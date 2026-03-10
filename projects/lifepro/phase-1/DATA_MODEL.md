# LifePro -- Data Model

**Agent**: Backend Architect
**Phase**: 1 (Architecture)
**Mode**: NEXUS-Micro
**Date**: 2026-03-10

---

## 1. Design Principles

1. **Local-first**: All data lives in SQLite via `expo-sqlite`. No network calls. No authentication.
2. **Single database file**: One `.db` file holds all tables. Simplifies backup/export.
3. **Extensible schema**: P0 tables are designed so P1/P2 features (goals, wellness, finance) slot in without migrations that alter existing tables -- they add new tables and optional foreign keys.
4. **Zustand as read cache**: SQLite is the source of truth. Zustand stores hold the working set (today's habits, current preferences) for reactive UI updates. Writes go to SQLite first, then sync to Zustand.
5. **Soft deletes**: Habits use an `archived_at` timestamp instead of hard DELETE. This preserves streak history and completion records.
6. **UTC storage, local display**: All timestamps stored as ISO 8601 UTC strings. The app converts to local time for display.
7. **Date strings for day-level data**: Completion tracking and daily logs use `YYYY-MM-DD` date strings (local date), not timestamps. This avoids timezone bugs when answering "did the user complete this habit today?"

---

## 2. SQLite Schema

### 2.1 Database Initialization

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
```

WAL mode gives better concurrent read performance (UI reads while a write is in progress). Foreign keys enforce referential integrity.

### 2.2 Schema Version & Migrations

```sql
CREATE TABLE IF NOT EXISTS schema_version (
  version    INTEGER NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert initial version
INSERT INTO schema_version (version) VALUES (1);
```

The app checks `schema_version` on startup and runs any pending migration scripts sequentially. This replaces the need for a migration framework in a local-only app.

---

### 2.3 P0 Tables

#### `categories`

Shared category system used by habits, goals, and future features.

```sql
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY NOT NULL,  -- UUID v4
  name        TEXT NOT NULL,
  color       TEXT NOT NULL,              -- hex color, e.g. '#4CAF50'
  icon        TEXT NOT NULL,              -- icon identifier, e.g. 'heart', 'dumbbell'
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_default  INTEGER NOT NULL DEFAULT 0, -- 1 = system-provided, 0 = user-created
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_categories_sort ON categories(sort_order);
```

**Default seed data** (inserted on first launch):

| name | color | icon | sort_order |
|------|-------|------|------------|
| Health & Fitness | #4CAF50 | dumbbell | 0 |
| Mindfulness | #9C27B0 | brain | 1 |
| Learning | #2196F3 | book-open | 2 |
| Productivity | #FF9800 | target | 3 |
| Social | #E91E63 | users | 4 |
| Self-Care | #00BCD4 | heart | 5 |
| Finance | #607D8B | dollar-sign | 6 |
| Custom | #795548 | star | 7 |

Icon identifiers correspond to [Lucide icons](https://lucide.dev/), which work well with `react-native-vector-icons` or `lucide-react-native`.

#### `habits`

```sql
CREATE TABLE IF NOT EXISTS habits (
  id            TEXT PRIMARY KEY NOT NULL,  -- UUID v4
  name          TEXT NOT NULL,              -- max 50 chars, enforced in app
  description   TEXT,                       -- optional user note
  category_id   TEXT NOT NULL,
  icon          TEXT,                       -- optional override of category icon
  color         TEXT,                       -- optional override of category color

  -- Frequency configuration
  frequency_type TEXT NOT NULL DEFAULT 'daily',  -- 'daily' | 'weekly' | 'custom'
  frequency_value INTEGER NOT NULL DEFAULT 1,    -- for 'weekly': times per week (e.g. 3)
  frequency_days TEXT,                           -- for 'custom': JSON array of ISO day numbers
                                                 -- e.g. '[1,3,5]' = Mon, Wed, Fri (ISO 8601)

  -- Scheduling
  time_of_day   TEXT,                      -- 'morning' | 'afternoon' | 'evening' | null
  reminder_time TEXT,                      -- HH:MM format, nullable (for future notifications)

  -- Streak cache (denormalized for read performance)
  current_streak    INTEGER NOT NULL DEFAULT 0,
  best_streak       INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,  -- 0 = paused (excluded from today view)
  archived_at   TEXT,                        -- non-null = soft deleted
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_habits_active ON habits(is_active, archived_at);
CREATE INDEX idx_habits_category ON habits(category_id);
CREATE INDEX idx_habits_sort ON habits(sort_order);
```

**Design decisions**:

- **`frequency_days` as JSON**: Stores a JSON array (e.g. `'[1,3,5]'`) rather than a separate join table. For a max of 7 values this is simpler and faster than a normalized approach. Uses ISO 8601 day numbers: 1=Monday through 7=Sunday.
- **Denormalized streaks**: `current_streak`, `best_streak`, and `total_completions` are cached on the habit row. Recalculating from `habit_completions` on every render would be O(n) per habit. The app recalculates and updates these cached values only when a completion is toggled.
- **`is_active` vs `archived_at`**: `is_active = 0` means "paused" -- temporarily hidden from today view without deleting. `archived_at IS NOT NULL` means "soft deleted" -- removed from all views but data preserved for history.
- **`icon` and `color` overrides**: A habit inherits its category's icon and color by default. These optional fields let the user customize per-habit without changing the category.

#### `habit_completions`

```sql
CREATE TABLE IF NOT EXISTS habit_completions (
  id           TEXT PRIMARY KEY NOT NULL,  -- UUID v4
  habit_id     TEXT NOT NULL,
  date         TEXT NOT NULL,              -- 'YYYY-MM-DD' local date
  status       TEXT NOT NULL DEFAULT 'completed',  -- 'completed' | 'skipped'
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  notes        TEXT,                       -- optional user note for the day

  FOREIGN KEY (habit_id) REFERENCES habits(id),
  UNIQUE(habit_id, date)                  -- one entry per habit per day
);

CREATE INDEX idx_completions_habit_date ON habit_completions(habit_id, date);
CREATE INDEX idx_completions_date ON habit_completions(date);
```

**Design decisions**:

- **`UNIQUE(habit_id, date)`** prevents double-completions and makes toggling idempotent (INSERT OR REPLACE / DELETE).
- **`status = 'skipped'`** distinguishes intentional skips from misses. Skipped days do not break streaks when `streak_skip_policy = 'preserve'` (the default). Missed days (absence of a row) always break streaks.
- **`date` is the user's local date**, not a UTC timestamp. This is critical: "did I complete this today?" must align with the user's midnight, not UTC midnight.
- **No `ON DELETE CASCADE`** on `habit_id` -- we use soft deletes for habits, so the FK target always exists. If a hard delete is ever needed, completions should be cleaned up explicitly.

#### `user_preferences`

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL                    -- JSON-encoded value
);
```

**Key-value design rationale**: User preferences are heterogeneous (booleans, strings, arrays, objects). A key-value store with JSON values is more flexible than a single-row wide table that requires a schema change for every new preference.

**Known keys** (seeded on first launch with defaults):

| key | default value | type | description |
|-----|--------------|------|-------------|
| `onboarding_complete` | `"false"` | boolean | Has user completed onboarding flow |
| `active_dimensions` | `'["health","habits","goals","finance","growth"]'` | string[] | Visible life dimensions on dashboard |
| `theme` | `"system"` | string | `"light"` / `"dark"` / `"system"` |
| `week_start_day` | `"1"` | number | ISO day number (1=Monday, 7=Sunday) |
| `streak_skip_policy` | `"preserve"` | string | `"preserve"` = skips don't break streak; `"break"` = they do |
| `daily_reminder_enabled` | `"false"` | boolean | Global reminder toggle (future use) |
| `daily_reminder_time` | `"09:00"` | string | Default reminder time HH:MM (future use) |

---

### 2.4 P1 Tables (Goals -- build if time allows)

These tables are designed now to prove the schema is extensible. They share the `categories` table with habits.

#### `goals`

```sql
CREATE TABLE IF NOT EXISTS goals (
  id            TEXT PRIMARY KEY NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  category_id   TEXT NOT NULL,
  motivation    TEXT,                      -- "why this matters" from SMART wizard

  -- SMART measurable fields
  target_value  REAL NOT NULL,             -- numeric target (e.g. 500 miles, 5000 dollars)
  current_value REAL NOT NULL DEFAULT 0,
  unit          TEXT NOT NULL,             -- 'miles', 'dollars', 'books', etc.
  start_value   REAL NOT NULL DEFAULT 0,

  -- Dates
  deadline      TEXT,                      -- 'YYYY-MM-DD', nullable for open-ended goals
  started_at    TEXT NOT NULL DEFAULT (datetime('now')),

  -- State
  status        TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'archived'
  completed_at  TEXT,
  archived_at   TEXT,

  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_category ON goals(category_id);
```

#### `milestones`

```sql
CREATE TABLE IF NOT EXISTS milestones (
  id           TEXT PRIMARY KEY NOT NULL,
  goal_id      TEXT NOT NULL,
  name         TEXT NOT NULL,
  target_value REAL NOT NULL,
  is_reached   INTEGER NOT NULL DEFAULT 0,
  reached_at   TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,

  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE INDEX idx_milestones_goal ON milestones(goal_id);
```

#### `goal_habits` (linking table)

```sql
CREATE TABLE IF NOT EXISTS goal_habits (
  goal_id  TEXT NOT NULL,
  habit_id TEXT NOT NULL,
  PRIMARY KEY (goal_id, habit_id),
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (habit_id) REFERENCES habits(id)
);
```

---

### 2.5 P2 Tables (Wellness & Finance -- deferred)

Defined here for schema validation only. Not created until the feature is built.

#### `mood_entries`

```sql
CREATE TABLE IF NOT EXISTS mood_entries (
  id         TEXT PRIMARY KEY NOT NULL,
  date       TEXT NOT NULL UNIQUE,          -- 'YYYY-MM-DD', one per day
  score      INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
  tags       TEXT,                          -- JSON array: '["stressed","tired"]'
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_mood_date ON mood_entries(date);
```

#### `sleep_entries`

```sql
CREATE TABLE IF NOT EXISTS sleep_entries (
  id               TEXT PRIMARY KEY NOT NULL,
  date             TEXT NOT NULL UNIQUE,      -- 'YYYY-MM-DD' (the morning date)
  duration_minutes INTEGER NOT NULL,
  quality          INTEGER NOT NULL CHECK(quality >= 1 AND quality <= 5),
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sleep_date ON sleep_entries(date);
```

#### `nutrition_entries`

```sql
CREATE TABLE IF NOT EXISTS nutrition_entries (
  id            TEXT PRIMARY KEY NOT NULL,
  date          TEXT NOT NULL UNIQUE,
  water_glasses INTEGER NOT NULL DEFAULT 0,   -- 0-12
  meals_logged  TEXT NOT NULL DEFAULT '[]',   -- JSON: '["breakfast","lunch"]'
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_nutrition_date ON nutrition_entries(date);
```

#### `transactions`

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id          TEXT PRIMARY KEY NOT NULL,
  type        TEXT NOT NULL,                -- 'income' | 'expense'
  amount      REAL NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'USD',
  category    TEXT NOT NULL,                -- 'food', 'transport', 'bills', etc.
  description TEXT,
  date        TEXT NOT NULL,                -- 'YYYY-MM-DD'
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category, date);
```

#### `savings_goals`

```sql
CREATE TABLE IF NOT EXISTS savings_goals (
  id             TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  target_amount  REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  deadline       TEXT,                      -- 'YYYY-MM-DD'
  status         TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed'
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 3. TypeScript Type Definitions

### 3.1 Common Primitives

```typescript
// types/common.ts

type UUID = string;
type ISODateString = string;     // 'YYYY-MM-DD'
type ISODateTimeString = string; // ISO 8601 UTC, e.g. '2026-03-10T14:30:00.000Z'
type HexColor = string;          // '#RRGGBB'
type TimeString = string;        // 'HH:MM'
type ISODayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7; // Mon=1 .. Sun=7 (ISO 8601)
```

### 3.2 Enums (as union types)

```typescript
// types/common.ts (continued)

type FrequencyType = 'daily' | 'weekly' | 'custom';
type TimeOfDay = 'morning' | 'afternoon' | 'evening';
type CompletionStatus = 'completed' | 'skipped';
type ThemePreference = 'light' | 'dark' | 'system';
type StreakSkipPolicy = 'preserve' | 'break';
type GoalStatus = 'active' | 'completed' | 'archived';
type TransactionType = 'income' | 'expense';
type LifeDimension = 'health' | 'habits' | 'goals' | 'finance' | 'growth';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
```

### 3.3 Category

```typescript
// types/category.ts

interface Category {
  id: UUID;
  name: string;
  color: HexColor;
  icon: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
```

### 3.4 Habit Types

```typescript
// types/habit.ts

interface Habit {
  id: UUID;
  name: string;                     // max 50 chars
  description: string | null;
  categoryId: UUID;
  icon: string | null;              // override category icon
  color: HexColor | null;           // override category color

  // Frequency
  frequencyType: FrequencyType;
  frequencyValue: number;           // for 'weekly': times per week
  frequencyDays: ISODayNumber[] | null; // for 'custom': which days

  // Scheduling
  timeOfDay: TimeOfDay | null;
  reminderTime: TimeString | null;

  // Streak cache (read from denormalized DB columns)
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;

  // State
  sortOrder: number;
  isActive: boolean;
  archivedAt: ISODateTimeString | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

interface HabitCompletion {
  id: UUID;
  habitId: UUID;
  date: ISODateString;
  status: CompletionStatus;
  completedAt: ISODateTimeString;
  notes: string | null;
}

// Form input for creating/editing habits
interface HabitFormData {
  name: string;
  description?: string;
  categoryId: UUID;
  icon?: string;
  color?: string;
  frequencyType: FrequencyType;
  frequencyValue: number;
  frequencyDays?: ISODayNumber[];
  timeOfDay?: TimeOfDay;
  reminderTime?: string;
}
```

### 3.5 Habit Derived Types (for UI components)

```typescript
// types/habit.ts (continued)

// Habit enriched with today's status -- used by Dashboard and Habits Today
interface HabitWithStatus extends Habit {
  category: Category;
  isCompletedToday: boolean;
  isSkippedToday: boolean;
  isDueToday: boolean;
}

// Stats for the Habit Detail screen
interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completionRateThisWeek: number;   // 0-1
  completionRateLast4Weeks: number; // 0-1
  weeklyRates: number[];            // last 4 weeks, each 0-1
}

// Calendar heatmap data for Streak Calendar screen
interface HabitCalendarDay {
  date: ISODateString;
  status: 'completed' | 'skipped' | 'missed' | 'future' | 'not-due';
}
```

### 3.6 User Preferences

```typescript
// types/preferences.ts

interface UserPreferences {
  onboardingComplete: boolean;
  activeDimensions: LifeDimension[];
  theme: ThemePreference;
  weekStartDay: ISODayNumber;
  streakSkipPolicy: StreakSkipPolicy;
  dailyReminderEnabled: boolean;
  dailyReminderTime: TimeString;
}
```

### 3.7 P1 Types (Goals)

```typescript
// types/goal.ts

interface Goal {
  id: UUID;
  name: string;
  description: string | null;
  categoryId: UUID;
  motivation: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  startValue: number;
  deadline: ISODateString | null;
  startedAt: ISODateTimeString;
  status: GoalStatus;
  completedAt: ISODateTimeString | null;
  archivedAt: ISODateTimeString | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

interface Milestone {
  id: UUID;
  goalId: UUID;
  name: string;
  targetValue: number;
  isReached: boolean;
  reachedAt: ISODateTimeString | null;
  sortOrder: number;
}

// Enriched goal for list/detail views
interface GoalWithDetails extends Goal {
  category: Category;
  milestones: Milestone[];
  linkedHabits: Habit[];
  progressPercent: number; // 0-100
}

interface GoalFormData {
  name: string;
  description?: string;
  categoryId: UUID;
  motivation?: string;
  targetValue: number;
  unit: string;
  startValue?: number;
  deadline?: string;
}
```

### 3.8 P2 Types (Wellness & Finance)

```typescript
// types/wellness.ts

interface MoodEntry {
  id: UUID;
  date: ISODateString;
  score: 1 | 2 | 3 | 4 | 5;
  tags: string[] | null;
  notes: string | null;
  createdAt: ISODateTimeString;
}

interface SleepEntry {
  id: UUID;
  date: ISODateString;
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  createdAt: ISODateTimeString;
}

interface NutritionEntry {
  id: UUID;
  date: ISODateString;
  waterGlasses: number;
  mealsLogged: MealType[];
  createdAt: ISODateTimeString;
}

// types/finance.ts

interface Transaction {
  id: UUID;
  type: TransactionType;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  date: ISODateString;
  createdAt: ISODateTimeString;
}

interface SavingsGoal {
  id: UUID;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: ISODateString | null;
  status: 'active' | 'completed';
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

// Dashboard aggregate for daily score
interface DailyScore {
  date: ISODateString;
  habitsCompleted: number;
  habitsTotal: number;
  completionPercentage: number; // 0-100
  mood: number | null;         // 1-5 or null if not logged
}
```

---

## 4. Zustand Store Architecture

### 4.1 Store Design Principles

- **One store per domain**, not one monolithic store. Each feature gets its own slice with independent selectors, preventing unnecessary re-renders across unrelated features.
- **Actions are async** because they write to SQLite before updating Zustand state.
- **Selectors are derived** -- computed values (e.g., "habits due today", "today's progress") are selector functions, not stored state.
- **Hydration on app start**: Each store has an `initialize()` action that loads relevant SQLite data into memory.

### 4.2 `useHabitStore`

```typescript
// stores/useHabitStore.ts
import { create } from 'zustand';

interface HabitState {
  // --- State ---
  habits: Habit[];
  completions: Map<string, HabitCompletion[]>; // key = habitId
  todayCompletions: Map<string, HabitCompletion>; // key = habitId, today only
  isLoading: boolean;
  isInitialized: boolean;

  // --- Actions (all async, write to SQLite first) ---
  initialize: () => Promise<void>;
  createHabit: (data: HabitFormData) => Promise<Habit>;
  updateHabit: (id: UUID, data: Partial<HabitFormData>) => Promise<void>;
  archiveHabit: (id: UUID) => Promise<void>;
  restoreHabit: (id: UUID) => Promise<void>;
  reorderHabits: (orderedIds: UUID[]) => Promise<void>;
  toggleCompletion: (habitId: UUID, date: ISODateString) => Promise<void>;
  skipHabit: (habitId: UUID, date: ISODateString) => Promise<void>;
  loadCompletionsForRange: (
    habitId: UUID,
    startDate: ISODateString,
    endDate: ISODateString
  ) => Promise<HabitCompletion[]>;
  recalculateStreak: (habitId: UUID) => Promise<void>;
}

const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  completions: new Map(),
  todayCompletions: new Map(),
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    set({ isLoading: true });
    // 1. Load all active, non-archived habits from SQLite
    // 2. Load today's completions from SQLite
    // 3. Populate todayCompletions map
    set({ habits, todayCompletions, isLoading: false, isInitialized: true });
  },

  createHabit: async (data) => {
    // 1. Generate UUID
    // 2. INSERT into SQLite habits table
    // 3. Append to Zustand habits array
    // 4. Return created Habit
  },

  updateHabit: async (id, data) => {
    // 1. UPDATE SQLite row (set updated_at = now)
    // 2. Replace habit in Zustand habits array
  },

  archiveHabit: async (id) => {
    // 1. SET archived_at = datetime('now') in SQLite
    // 2. Remove from Zustand habits array
  },

  restoreHabit: async (id) => {
    // 1. SET archived_at = NULL in SQLite
    // 2. Re-add to Zustand habits array
  },

  reorderHabits: async (orderedIds) => {
    // 1. UPDATE sort_order for each habit in SQLite (batch)
    // 2. Re-sort Zustand habits array
  },

  toggleCompletion: async (habitId, date) => {
    // 1. Check if completion exists for habit_id + date
    // 2. If exists: DELETE from SQLite -> remove from todayCompletions
    // 3. If not: INSERT into SQLite -> add to todayCompletions
    // 4. Call recalculateStreak(habitId)
    // 5. Update total_completions on habit
  },

  skipHabit: async (habitId, date) => {
    // 1. INSERT OR REPLACE into SQLite with status = 'skipped'
    // 2. Update todayCompletions map
    // 3. Call recalculateStreak(habitId)
  },

  loadCompletionsForRange: async (habitId, startDate, endDate) => {
    // SELECT from habit_completions WHERE habit_id = ? AND date BETWEEN ? AND ?
    // Used by Streak Calendar screen
  },

  recalculateStreak: async (habitId) => {
    // 1. Load all completions for this habit, ordered by date DESC
    // 2. Run streak algorithm (Section 5)
    // 3. UPDATE current_streak, best_streak, total_completions in SQLite
    // 4. Update habit in Zustand state
  },
}));

export default useHabitStore;
```

### 4.3 Habit Selectors

Defined as standalone functions for reusability across components:

```typescript
// stores/habitSelectors.ts

// Habits due today, enriched with completion status
export const selectHabitsDueToday = (state: HabitState): HabitWithStatus[] => {
  const today = getTodayLocalDate(); // 'YYYY-MM-DD'
  const dayOfWeek = getDayOfWeek(today); // 1-7

  return state.habits
    .filter(h => h.archivedAt === null && h.isActive)
    .filter(h => isHabitDueOnDay(h, dayOfWeek))
    .map(h => ({
      ...h,
      category: getCategoryById(h.categoryId), // from category store or cache
      isCompletedToday: state.todayCompletions.has(h.id)
        && state.todayCompletions.get(h.id)!.status === 'completed',
      isSkippedToday: state.todayCompletions.has(h.id)
        && state.todayCompletions.get(h.id)!.status === 'skipped',
      isDueToday: true,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

// Today's progress for Dashboard progress bar
export const selectTodayProgress = (state: HabitState) => {
  const dueToday = selectHabitsDueToday(state);
  const completed = dueToday.filter(h => h.isCompletedToday).length;
  return { completed, total: dueToday.length };
};

// All habits grouped by category (for Habit List screen)
export const selectHabitsByCategory = (state: HabitState) => {
  const active = state.habits.filter(h => h.archivedAt === null);
  const grouped = new Map<UUID, Habit[]>();
  for (const habit of active) {
    const list = grouped.get(habit.categoryId) || [];
    list.push(habit);
    grouped.set(habit.categoryId, list);
  }
  return grouped;
};

// Helper: is this habit scheduled for this day of the week?
function isHabitDueOnDay(habit: Habit, dayOfWeek: ISODayNumber): boolean {
  switch (habit.frequencyType) {
    case 'daily':
      return true;
    case 'custom':
      return habit.frequencyDays?.includes(dayOfWeek) ?? false;
    case 'weekly':
      // "3x per week" habits are always shown; user chooses which days
      return true;
    default:
      return true;
  }
}
```

### 4.4 `usePreferencesStore`

```typescript
// stores/usePreferencesStore.ts
import { create } from 'zustand';

interface PreferencesState {
  preferences: UserPreferences;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  toggleDimension: (dimension: LifeDimension) => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  onboardingComplete: false,
  activeDimensions: ['health', 'habits', 'goals', 'finance', 'growth'],
  theme: 'system',
  weekStartDay: 1,
  streakSkipPolicy: 'preserve',
  dailyReminderEnabled: false,
  dailyReminderTime: '09:00',
};

const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: { ...DEFAULT_PREFERENCES },
  isInitialized: false,

  initialize: async () => {
    // 1. SELECT * FROM user_preferences
    // 2. Parse each JSON value
    // 3. Merge with DEFAULT_PREFERENCES (defaults fill any missing keys)
    // 4. set({ preferences, isInitialized: true })
  },

  setPreference: async (key, value) => {
    // 1. JSON.stringify(value)
    // 2. INSERT OR REPLACE INTO user_preferences (key, value)
    // 3. set(state => ({ preferences: { ...state.preferences, [key]: value } }))
  },

  completeOnboarding: async () => {
    await get().setPreference('onboardingComplete', true);
  },

  toggleDimension: async (dimension) => {
    const current = get().preferences.activeDimensions;
    const updated = current.includes(dimension)
      ? current.filter(d => d !== dimension)
      : [...current, dimension];
    await get().setPreference('activeDimensions', updated);
  },
}));

export default usePreferencesStore;
```

### 4.5 `useDashboardStore`

```typescript
// stores/useDashboardStore.ts
import { create } from 'zustand';

interface DashboardState {
  dailyScore: DailyScore | null;
  isLoading: boolean;

  refreshDashboard: () => Promise<void>;
}

const useDashboardStore = create<DashboardState>((set) => ({
  dailyScore: null,
  isLoading: false,

  refreshDashboard: async () => {
    set({ isLoading: true });
    // 1. Get today's habit progress from useHabitStore
    // 2. Get today's mood from mood_entries (P2, null for now)
    // 3. Calculate completion percentage
    // 4. set({ dailyScore: { ... }, isLoading: false })
  },
}));

export default useDashboardStore;
```

### 4.6 P1/P2 Store Interfaces

```typescript
// stores/useGoalStore.ts (P1)
interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  createGoal: (data: GoalFormData) => Promise<Goal>;
  updateGoal: (id: UUID, data: Partial<GoalFormData>) => Promise<void>;
  updateProgress: (id: UUID, newValue: number) => Promise<void>;
  archiveGoal: (id: UUID) => Promise<void>;
  completeGoal: (id: UUID) => Promise<void>;
  addMilestone: (goalId: UUID, name: string, targetValue: number) => Promise<void>;
  removeMilestone: (milestoneId: UUID) => Promise<void>;
  linkHabit: (goalId: UUID, habitId: UUID) => Promise<void>;
  unlinkHabit: (goalId: UUID, habitId: UUID) => Promise<void>;
}

// stores/useWellnessStore.ts (P2)
interface WellnessState {
  todayMood: MoodEntry | null;
  todaySleep: SleepEntry | null;
  todayNutrition: NutritionEntry | null;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  logMood: (score: number, tags?: string[]) => Promise<void>;
  logSleep: (durationMinutes: number, quality: number) => Promise<void>;
  updateWater: (glasses: number) => Promise<void>;
  toggleMeal: (meal: MealType) => Promise<void>;
  loadHistory: (startDate: ISODateString, endDate: ISODateString) => Promise<void>;
}

// stores/useFinanceStore.ts (P2)
interface FinanceState {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  selectedMonth: string;              // 'YYYY-MM'
  isInitialized: boolean;

  initialize: () => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: UUID) => Promise<void>;
  setSelectedMonth: (month: string) => void;
  createSavingsGoal: (name: string, target: number, deadline?: string) => Promise<void>;
  updateSavingsProgress: (id: UUID, amount: number) => Promise<void>;
}
```

---

## 5. Streak Calculation Algorithm

The streak algorithm is the most logic-heavy part of the habit data model. It must handle daily habits, custom-day habits, and the user's skip policy preference.

### 5.1 Algorithm

```typescript
// utils/streakCalculator.ts

interface StreakResult {
  currentStreak: number;
  bestStreak: number;
}

function calculateStreak(
  habit: Habit,
  completions: HabitCompletion[], // sorted by date DESC
  skipPolicy: StreakSkipPolicy,
  today: ISODateString
): StreakResult {
  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;
  let isCurrentStreakSet = false;
  let checkDate = today;
  const createdDate = habit.createdAt.substring(0, 10); // extract YYYY-MM-DD

  // Build a lookup map for O(1) access
  const completionMap = new Map<string, CompletionStatus>();
  for (const c of completions) {
    completionMap.set(c.date, c.status);
  }

  // Walk backwards day by day from today to habit creation date
  while (checkDate >= createdDate) {
    const dayOfWeek = getDayOfWeek(checkDate) as ISODayNumber;
    const isDue = isHabitDueOnDay(habit, dayOfWeek);

    if (!isDue) {
      // Day not scheduled -- skip without affecting streak
      checkDate = getPreviousDay(checkDate);
      continue;
    }

    const status = completionMap.get(checkDate);

    if (status === 'completed') {
      runningStreak++;
    } else if (status === 'skipped') {
      if (skipPolicy === 'preserve') {
        // Skip preserves streak but does not increment
        checkDate = getPreviousDay(checkDate);
        continue;
      } else {
        // Skip breaks the streak
        if (!isCurrentStreakSet) {
          currentStreak = runningStreak;
          isCurrentStreakSet = true;
        }
        bestStreak = Math.max(bestStreak, runningStreak);
        runningStreak = 0;
      }
    } else {
      // No completion row = missed day -- streak broken
      if (!isCurrentStreakSet) {
        currentStreak = runningStreak;
        isCurrentStreakSet = true;
      }
      bestStreak = Math.max(bestStreak, runningStreak);
      runningStreak = 0;
    }

    checkDate = getPreviousDay(checkDate);
  }

  // Finalize after loop
  if (!isCurrentStreakSet) {
    currentStreak = runningStreak;
  }
  bestStreak = Math.max(bestStreak, runningStreak);

  return { currentStreak, bestStreak };
}
```

### 5.2 Edge Cases

| Case | Behavior |
|------|----------|
| New habit, no completions | `currentStreak = 0, bestStreak = 0` |
| Habit created today, completed today | `currentStreak = 1, bestStreak = 1` |
| Custom days (Mon/Wed/Fri), completed Mon, today is Tue | Tue is not a due day, skipped in the walk. `currentStreak = 1`. |
| Today not yet completed | `currentStreak = 0` (current streak counts from most recent consecutive completed). The UI can show "complete today to continue your streak" when yesterday was completed. |
| Weekly habit "3x/week" | Weekly habits show on all days (`isDue = true`). Streak counts consecutive completed days. The user picks which days to complete. |
| App not opened for 3 days | On next open, streak recalculates from completions table. Missed due-days break the streak. |
| Backdated completion (within 24h per UX spec) | User adds completion for yesterday. `recalculateStreak` re-runs and may restore the streak. |
| Skipped day with `preserve` policy | Day is ignored in the walk. A streak of 5 with a skip in the middle stays 5. |
| Skipped day with `break` policy | Treated like a miss. Streak resets to 0 at that point. |

### 5.3 Performance

- The algorithm queries `habit_completions` for a single habit, ordered by date DESC. For most users this is under 365 rows.
- A `Map` lookup makes each day check O(1).
- Results are cached on the `habits` row (`current_streak`, `best_streak`). Recalculation only runs on `toggleCompletion` or `skipHabit` -- not on every render.

---

## 6. Database Service Layer

A thin service layer between Zustand stores and raw `expo-sqlite` calls. This keeps SQL out of stores and makes the database interface testable.

### 6.1 Database Connection

```typescript
// db/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('lifepro.db');
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }
  return db;
}
```

### 6.2 Service Interfaces

```typescript
// db/habitService.ts
export const habitService = {
  getAll: async (): Promise<Habit[]> =>
    { /* SELECT * FROM habits WHERE archived_at IS NULL ORDER BY sort_order */ },
  getById: async (id: UUID): Promise<Habit | null> =>
    { /* SELECT * FROM habits WHERE id = ? */ },
  create: async (data: HabitFormData): Promise<Habit> =>
    { /* INSERT INTO habits (...) VALUES (...) */ },
  update: async (id: UUID, data: Partial<HabitFormData>): Promise<void> =>
    { /* UPDATE habits SET ... WHERE id = ? */ },
  archive: async (id: UUID): Promise<void> =>
    { /* UPDATE habits SET archived_at = datetime('now') WHERE id = ? */ },
  restore: async (id: UUID): Promise<void> =>
    { /* UPDATE habits SET archived_at = NULL WHERE id = ? */ },
  updateStreaks: async (id: UUID, current: number, best: number, total: number): Promise<void> =>
    { /* UPDATE habits SET current_streak=?, best_streak=?, total_completions=? WHERE id=? */ },
  updateSortOrder: async (updates: Array<{ id: UUID; sortOrder: number }>): Promise<void> =>
    { /* Batch UPDATE sort_order */ },
};

// db/completionService.ts
export const completionService = {
  getForDate: async (date: ISODateString): Promise<HabitCompletion[]> =>
    { /* SELECT * FROM habit_completions WHERE date = ? */ },
  getForHabitInRange: async (habitId: UUID, start: ISODateString, end: ISODateString): Promise<HabitCompletion[]> =>
    { /* SELECT * FROM habit_completions WHERE habit_id = ? AND date BETWEEN ? AND ? ORDER BY date */ },
  getAllForHabit: async (habitId: UUID): Promise<HabitCompletion[]> =>
    { /* SELECT * FROM habit_completions WHERE habit_id = ? ORDER BY date DESC */ },
  insert: async (habitId: UUID, date: ISODateString, status: CompletionStatus): Promise<HabitCompletion> =>
    { /* INSERT INTO habit_completions (...) VALUES (...) */ },
  delete: async (habitId: UUID, date: ISODateString): Promise<void> =>
    { /* DELETE FROM habit_completions WHERE habit_id = ? AND date = ? */ },
};

// db/categoryService.ts
export const categoryService = {
  getAll: async (): Promise<Category[]> =>
    { /* SELECT * FROM categories ORDER BY sort_order */ },
  seedDefaults: async (): Promise<void> =>
    { /* INSERT OR IGNORE default categories */ },
};

// db/preferencesService.ts
export const preferencesService = {
  getAll: async (): Promise<Record<string, string>> =>
    { /* SELECT * FROM user_preferences, return as key-value object */ },
  get: async (key: string): Promise<string | null> =>
    { /* SELECT value FROM user_preferences WHERE key = ? */ },
  set: async (key: string, value: string): Promise<void> =>
    { /* INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?) */ },
};

// db/migrationService.ts
export const migrationService = {
  getCurrentVersion: async (): Promise<number> =>
    { /* SELECT MAX(version) FROM schema_version */ },
  runMigrations: async (): Promise<void> => {
    // 1. Get current version
    // 2. Filter MIGRATIONS array for version > current
    // 3. Execute each migration SQL in order
    // 4. INSERT new version into schema_version
  },
};
```

---

## 7. Data Flow

```
┌──────────────┐     subscribes    ┌──────────────┐     reads         ┌──────────────┐
│              │ ◄──────────────── │              │ ◄──────────────── │              │
│  React UI    │                   │ Zustand Store │                   │    SQLite    │
│  Components  │ ──────────────►  │  (in-memory)  │ ──────────────►  │  (on-disk)   │
│              │  dispatches       │              │  writes via       │              │
└──────────────┘  actions          └──────────────┘  db services      └──────────────┘
```

**Write path**: Component calls store action -> action calls db service (SQLite write) -> on success, `set()` updates Zustand state -> subscribers re-render.

**Read path**: Component calls `useHabitStore(selectHabitsDueToday)` -> Zustand returns derived data from in-memory state -> component renders.

**Startup path**: `App.tsx` mounts -> calls `initialize()` on each store -> db services read from SQLite -> Zustand state populated -> UI renders with data.

### App Initialization Sequence

```typescript
// In App.tsx or a root provider
async function initializeApp() {
  const db = await getDatabase();

  // 1. Run migrations (creates tables if needed)
  await migrationService.runMigrations();

  // 2. Seed default categories if empty
  await categoryService.seedDefaults();

  // 3. Hydrate stores (order matters: preferences first, then data stores)
  await usePreferencesStore.getState().initialize();
  await useHabitStore.getState().initialize();

  // 4. Calculate dashboard score
  await useDashboardStore.getState().refreshDashboard();
}
```

---

## 8. File Structure

```
src/
├── db/
│   ├── database.ts              -- getDatabase(), connection singleton
│   ├── migrations.ts            -- ordered migration scripts array
│   ├── migrationService.ts      -- version check + run migrations
│   ├── habitService.ts          -- habit CRUD
│   ├── completionService.ts     -- habit completion CRUD
│   ├── categoryService.ts       -- category CRUD + seed data
│   └── preferencesService.ts    -- key-value preferences CRUD
│   ├── goalService.ts           -- (P1)
│   ├── wellnessService.ts       -- (P2)
│   └── financeService.ts        -- (P2)
├── stores/
│   ├── useHabitStore.ts         -- habit state + actions
│   ├── habitSelectors.ts        -- derived selectors for habit UI
│   ├── usePreferencesStore.ts   -- user preferences state
│   ├── useDashboardStore.ts     -- dashboard daily score
│   ├── useGoalStore.ts          -- (P1)
│   ├── useWellnessStore.ts      -- (P2)
│   └── useFinanceStore.ts       -- (P2)
├── types/
│   ├── common.ts                -- UUID, ISODateString, shared primitives + enums
│   ├── category.ts              -- Category
│   ├── habit.ts                 -- Habit, HabitCompletion, HabitFormData, HabitWithStatus, etc.
│   ├── preferences.ts           -- UserPreferences, LifeDimension
│   ├── goal.ts                  -- (P1) Goal, Milestone, GoalFormData
│   ├── wellness.ts              -- (P2) MoodEntry, SleepEntry, NutritionEntry
│   ├── finance.ts               -- (P2) Transaction, SavingsGoal
│   └── dashboard.ts             -- DailyScore
├── utils/
│   ├── streakCalculator.ts      -- streak algorithm
│   ├── dateUtils.ts             -- getTodayLocalDate(), getDayOfWeek(), getPreviousDay()
│   └── uuid.ts                  -- generateUUID() wrapper
```

---

## 9. Key SQL Queries

Frequently-run queries, documented for the Mobile App Builder.

### Today's habits with completion status

```sql
SELECT
  h.*,
  c.name  AS category_name,
  c.color AS category_color,
  c.icon  AS category_icon,
  hc.status AS completion_status
FROM habits h
JOIN categories c ON c.id = h.category_id
LEFT JOIN habit_completions hc
  ON hc.habit_id = h.id AND hc.date = ?  -- bind: today's local date
WHERE h.archived_at IS NULL
  AND h.is_active = 1
ORDER BY h.sort_order;
```

### Completions for calendar heatmap (one month)

```sql
SELECT date, status
FROM habit_completions
WHERE habit_id = ?
  AND date BETWEEN ? AND ?  -- bind: month start, month end
ORDER BY date;
```

### All completions for streak calculation

```sql
SELECT date, status
FROM habit_completions
WHERE habit_id = ?
ORDER BY date DESC;
```

### Dashboard daily score

```sql
SELECT
  COUNT(CASE WHEN hc.status = 'completed' THEN 1 END) AS completed,
  COUNT(h.id) AS total
FROM habits h
LEFT JOIN habit_completions hc
  ON hc.habit_id = h.id AND hc.date = ?  -- bind: today's local date
WHERE h.archived_at IS NULL
  AND h.is_active = 1;
```

### Habit detail stats (last 4 weeks completion rate)

```sql
SELECT
  date,
  status
FROM habit_completions
WHERE habit_id = ?
  AND date >= ?  -- bind: 28 days ago
ORDER BY date;
```

---

## 10. Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  categories  │       │     habits       │       │ habit_completions│
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)      │◄──────│ category_id (FK) │       │ id (PK)          │
│ name         │       │ id (PK)          │◄──────│ habit_id (FK)    │
│ color        │       │ name             │       │ date             │
│ icon         │       │ description      │       │ status           │
│ sort_order   │       │ icon             │       │ completed_at     │
│ is_default   │       │ color            │       │ notes            │
│ created_at   │       │ frequency_type   │       └──────────────────┘
│ updated_at   │       │ frequency_value  │
└──────────────┘       │ frequency_days   │       ┌──────────────────┐
                       │ time_of_day      │       │ user_preferences │
                       │ reminder_time    │       ├──────────────────┤
                       │ current_streak   │       │ key (PK)         │
                       │ best_streak      │       │ value            │
                       │ total_completions│       └──────────────────┘
                       │ sort_order       │
                       │ is_active        │       ┌──────────────────┐
                       │ archived_at      │       │ schema_version   │
                       │ created_at       │       ├──────────────────┤
                       │ updated_at       │       │ version          │
                       └──────────────────┘       │ applied_at       │
                              │                   └──────────────────┘
            ┌─────────────────┤ (P1)
            ▼                 ▼
   ┌──────────────┐   ┌──────────────┐
   │ goal_habits  │   │    goals     │◄──── milestones
   │ (join table) │   │   (P1)      │
   └──────────────┘   └──────────────┘

   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
   │ mood_entries │   │sleep_entries │   │nutrition_entries  │
   │    (P2)      │   │    (P2)      │   │      (P2)        │
   └──────────────┘   └──────────────┘   └──────────────────┘

   ┌──────────────┐   ┌──────────────┐
   │ transactions │   │savings_goals │
   │    (P2)      │   │    (P2)      │
   └──────────────┘   └──────────────┘
```

---

**Backend Architect Agent**: Data model design complete.
**Handoff**: Ready for Mobile App Builder (implement database initialization, services, and stores) and UI Designer (category colors/icons for design tokens).
**Dependencies**: Requires `expo-sqlite` and `zustand` packages. UUID generation can use `expo-crypto`'s `randomUUID()` or the `uuid` package.

---

*Data model designed: 2026-03-10*
*Agent: Backend Architect | Pipeline: NEXUS-Micro | Project: LifePro*
