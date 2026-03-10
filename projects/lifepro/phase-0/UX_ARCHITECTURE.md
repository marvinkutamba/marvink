# LifePro -- UX Architecture

**Agent**: UX Architect (ArchitectUX)
**Phase**: 0 (Discovery & Architecture)
**Mode**: NEXUS-Micro
**Date**: 2026-03-10

---

## 1. Navigation Architecture

### Decision: Bottom Tab Bar (5 tabs)

A bottom tab bar is the correct pattern for LifePro. Rationale:

- **Thumb-zone accessibility** -- all primary destinations reachable one-handed
- **Persistent visibility** -- users always know where they are and can switch domains instantly
- **Industry standard** -- matches mental models from fitness and finance apps users already know
- **Flat hierarchy** -- avoids the discoverability problems of hamburger/drawer menus

A drawer menu would hide the app's breadth, which is its core differentiator. Tab bar exposes it.

### Tab Structure

```
[Dashboard]   [Habits]   [+]   [Wellness]   [More]
     |            |        |        |           |
   Home        Habits   Quick     Wellness   Goals / Finance
                        Add                  Insights / Settings
```

| Tab | Icon | Label | Screen Stack |
|-----|------|-------|-------------|
| 1 | Grid/Compass | Dashboard | Dashboard (home) |
| 2 | Checkmark | Habits | Habit Today > Habit List > Habit Detail > Streak Calendar |
| 3 | Plus circle | Add | Quick-entry modal (not a full tab -- floats as FAB-style center button) |
| 4 | Heart | Wellness | Mood/Sleep/Nutrition entry > Wellness History |
| 5 | Menu/Grid | More | Goals, Finance, Insights, Settings (section list) |

### Why this grouping

- **Dashboard and Habits get dedicated tabs** because they are the daily-use screens (the habit loop).
- **Quick Add gets the center position** because reducing friction for data entry is the single most important UX goal. One tap from anywhere to log anything.
- **Wellness gets its own tab** because mood/sleep/nutrition logging is a daily action, distinct from habits.
- **"More" consolidates secondary features** (Goals, Finance, Insights, Settings) that are used weekly, not daily. This keeps the tab bar clean at 5 items while preserving access to all features.

### Navigation Library Mapping (React Navigation v6)

```
BottomTabNavigator
  ├── DashboardStack (Stack.Navigator)
  │     └── DashboardScreen
  ├── HabitsStack (Stack.Navigator)
  │     ├── HabitsTodayScreen
  │     ├── HabitListScreen
  │     ├── HabitDetailScreen
  │     └── StreakCalendarScreen
  ├── QuickAddModal (presented as modal overlay, not a stack)
  ├── WellnessStack (Stack.Navigator)
  │     ├── WellnessEntryScreen
  │     └── WellnessHistoryScreen
  └── MoreStack (Stack.Navigator)
        ├── MoreMenuScreen
        ├── GoalsListScreen
        ├── GoalCreateWizardScreen
        ├── GoalDetailScreen
        ├── FinanceOverviewScreen
        ├── AddTransactionScreen
        ├── SavingsGoalsScreen
        ├── InsightsScreen
        └── SettingsScreen
```

---

## 2. First-Time User Onboarding Flow

### Design Principles

- **3 screens maximum** -- onboarding abandonment spikes after screen 3
- **Value before configuration** -- show what the app does before asking for input
- **Progressive disclosure** -- collect preferences over the first week, not on day one
- **Skip-friendly** -- every screen has a skip/continue option

### Flow

```
App Launch (first time)
  │
  ▼
┌─────────────────────────────────────┐
│  SCREEN 1: Welcome                  │
│                                     │
│  "One app for your whole life."     │
│                                     │
│  [Life Balance Wheel illustration]  │
│  Health · Habits · Goals ·          │
│  Finance · Growth                   │
│                                     │
│  Brief tagline: Track everything    │
│  that matters. See how it all       │
│  connects.                          │
│                                     │
│  [Get Started]                      │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│  SCREEN 2: Pick Your Focus Areas   │
│                                     │
│  "What matters most right now?"     │
│                                     │
│  [ ] Health & Fitness               │
│  [ ] Daily Habits                   │
│  [ ] Goals & Milestones             │
│  [ ] Money & Savings                │
│  [ ] Personal Growth                │
│                                     │
│  (Multi-select. Pre-check all.      │
│   Unchecked areas hide from         │
│   Dashboard but remain accessible   │
│   in More > Settings.)              │
│                                     │
│  [Continue]           [Skip]        │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│  SCREEN 3: Your First Habit        │
│                                     │
│  "Start with one small win."        │
│                                     │
│  Suggested starter habits:          │
│  ○ Drink 8 glasses of water         │
│  ○ Read for 15 minutes              │
│  ○ Exercise for 30 minutes          │
│  ○ Meditate for 5 minutes           │
│  ○ [+ Create your own]              │
│                                     │
│  (Tap to select one or create.      │
│   Seeds the habit tracker so the    │
│   dashboard is not empty.)          │
│                                     │
│  [Let's Go!]          [Skip]        │
└─────────────────────────────────────┘
  │
  ▼
Dashboard (populated with selected habit + focus areas)
```

### Data written during onboarding

| Action | Stored As | Storage |
|--------|-----------|---------|
| Focus area selection | `user_preferences.active_dimensions[]` | AsyncStorage |
| Starter habit | First row in `habits` table | SQLite |
| Onboarding complete flag | `user_preferences.onboarding_complete = true` | AsyncStorage |

### Post-onboarding progressive disclosure

- **Day 2**: Prompt to add a goal ("You've tracked a habit. Want to connect it to a bigger goal?")
- **Day 3**: Prompt to try mood tracking ("How are you feeling? Tap Wellness to start tracking.")
- **Day 7**: First weekly insight available, nudge to view Insights tab

These prompts are simple in-app cards on the Dashboard, not modals or notifications.

---

## 3. Daily Usage Flow (The Habit Loop)

This is the most critical flow. If this is slow or confusing, retention dies.

### Design Goal

**Open to Done in under 30 seconds.** The user opens the app, sees what they need to do today, taps a few checkmarks, and closes the app feeling accomplished.

### Flow

```
User opens app
  │
  ▼
┌─────────────────────────────────────┐
│  DASHBOARD                          │
│                                     │
│  Good morning, [time-of-day         │
│  greeting].                         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Today's Progress   3/7 ●●●○○○○│
│  └─────────────────────────────┘    │
│                                     │
│  TODAY'S HABITS (inline checklist)  │
│  ☑ Drink water          ✓ Done     │
│  ☑ Read 15 min          ✓ Done     │
│  ☑ Exercise             ✓ Done     │
│  ☐ Meditate             [ Tap ]    │
│  ☐ Journal              [ Tap ]    │
│  ☐ No sugar             [ Tap ]    │
│  ☐ Sleep by 11pm        [ Tap ]    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Mood today?  😫 😕 😐 🙂 😄   │
│  └─────────────────────────────┘    │
│                                     │
│  GOALS SNAPSHOT                     │
│  Run a marathon ████████░░ 78%      │
│  Save $5,000    █████░░░░░ 52%      │
│                                     │
└─────────────────────────────────────┘
```

### Interaction Details

| Element | Behavior |
|---------|----------|
| Habit checkbox | Single tap toggles complete/incomplete. Haptic feedback on complete. Checkbox animates (scale + checkmark draw). |
| Mood selector | Tap a face, it highlights with a subtle bounce. Selection saves immediately. Tapping again changes it. No confirmation dialog. |
| Progress bar | Updates in real-time as habits are checked off. Fills with brand color. At 100%, a brief celebration animation (confetti or glow). |
| Goal progress | Tap to navigate to Goal Detail. Read-only on dashboard. |
| Quick Add button (center tab) | Opens a bottom sheet modal with options: Log Habit, Log Mood, Log Sleep, Add Expense, Log Water/Nutrition. Each opens a minimal 1-2 field form. |

### Quick Add Modal

```
┌─────────────────────────────────────┐
│         Quick Add                 ✕ │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ ✓    │ │ 😊   │ │ 💤   │        │
│  │Habit │ │ Mood │ │Sleep │        │
│  └──────┘ └──────┘ └──────┘        │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ 💰   │ │ 💧   │ │ 🍎   │        │
│  │Expense│ │Water │ │ Food │        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  (Tap a category, enter 1-2 fields, │
│   save. Sheet dismisses. Back to    │
│   whatever screen you were on.)     │
└─────────────────────────────────────┘
```

### Time-of-Day Adaptation

| Time | Dashboard emphasis |
|------|-------------------|
| Morning (5am-12pm) | Show habits. Greeting: "Good morning." Mood prompt prominent. |
| Afternoon (12pm-5pm) | Show progress so far. Greeting: "Good afternoon." Remaining habits highlighted. |
| Evening (5pm-10pm) | Show completion status. Greeting: "Good evening." Sleep log prompt appears. |

---

## 4. Key Screen Wireframe Descriptions

### 4.1 Dashboard Screen

**Purpose**: Single-glance view of today's life. The "home base."

**Layout** (top to bottom, single scrollable column):

1. **Header bar**: App name "LifePro" (left). Settings gear icon (right). No back button (this is root).
2. **Greeting + date**: "Good morning" / "Good afternoon" / "Good evening" + "Monday, March 10".
3. **Today's Progress card**: Horizontal progress bar showing X/Y habits completed. Rounded card with subtle shadow.
4. **Habits checklist**: Vertical list of today's habits with checkboxes. Each row: checkbox icon, habit name, streak count badge (e.g., "12 days"). Completed habits have muted text + strikethrough.
5. **Mood quick-entry**: Single-row card with 5 face icons (1-5 scale). Tap to select. If already logged today, shows the selection highlighted.
6. **Goals snapshot**: 1-3 active goals shown as horizontal progress bars with labels and percentages. "See all" link to Goals list.
7. **Life Balance Wheel** (optional, below fold): Radar/spider chart showing scores across active dimensions. Compact size. Tapping navigates to Insights.

**Scroll behavior**: Standard vertical scroll. All primary actions (habits, mood) are above the fold on standard phone screens (375pt width, 667pt+ height).

### 4.2 Habits Today Screen

**Purpose**: Full view of today's habits with more detail than the dashboard card.

**Layout**:

1. **Header**: "Habits" title. Filter toggle: Today / All.
2. **Streak summary bar**: "Current best streak: 14 days (Meditation)". Tappable, goes to Streak Calendar.
3. **Habit list**: Grouped by time-of-day if user has set reminders (Morning / Afternoon / Evening), otherwise flat list. Each row:
   - Colored category dot (left edge)
   - Habit name (primary text)
   - Frequency label ("Daily" / "3x/week") (secondary text)
   - Streak badge (right side, e.g., flame icon + "7")
   - Tap checkbox to complete
   - Swipe right to complete (alternative gesture)
   - Swipe left to skip (marks as intentionally skipped, different from missed)
4. **Add habit FAB**: Bottom-right floating action button, "+" icon. Navigates to habit creation form.

### 4.3 Habit Detail Screen

**Purpose**: View and edit a single habit. See its history.

**Layout**:

1. **Header**: Habit name as title. Edit button (pencil icon, right). Back arrow (left).
2. **Stats row**: Three stat cards in a horizontal row -- "Current Streak: 12", "Best Streak: 28", "Total: 145".
3. **Calendar heatmap**: Month grid showing completed days (colored) vs missed (empty). Similar to GitHub contribution graph. Swipe left/right to change month.
4. **Completion rate**: "This week: 5/7 (71%)" with small bar chart showing last 4 weeks.
5. **Linked goal** (if any): Card showing which goal this habit supports. Tappable to navigate to goal.
6. **Edit/Delete actions**: Bottom of screen. "Edit Habit" button, "Delete" text link (with confirmation dialog).

### 4.4 Wellness Entry Screen

**Purpose**: Log mood, sleep, and nutrition in one place.

**Layout** (card-based, scrollable):

1. **Header**: "Wellness" title. History button (clock icon, right).
2. **Mood card**:
   - "How are you feeling?" label
   - 5 face icons in a row (tap to select)
   - Optional tag chips below: "Stressed", "Energetic", "Calm", "Anxious", "Happy", "Tired" (multi-select)
   - Auto-saves on selection
3. **Sleep card**:
   - "Last night's sleep" label
   - Duration picker: hours + minutes (scroll wheels or stepper buttons, default to 7h 30m)
   - Quality: 5-star rating (tap)
   - Auto-saves on change
4. **Nutrition card**:
   - Water tracker: 8 circles in a row representing glasses. Tap to fill/unfill. Shows "5/8 glasses".
   - Quick meal log: "Breakfast / Lunch / Dinner / Snacks" as toggle chips. Tap to mark as logged. No calorie entry for MVP -- just "did you eat?" awareness.

### 4.5 Goal Creation Wizard

**Purpose**: Create a SMART goal in 3 steps. Wizard pattern reduces cognitive load.

**Flow**:

```
Step 1/3: What's the goal?
┌─────────────────────────────────────┐
│  Goal name: [__________________]    │
│  Category: [Health ▼]               │
│  Why this matters to you (optional):│
│  [__________________________]       │
│                                     │
│  [Next]                             │
└─────────────────────────────────────┘

Step 2/3: How will you measure it?
┌─────────────────────────────────────┐
│  Target: [___] [unit ▼]            │
│  (e.g., "Run 500 miles", "Save     │
│   $5,000", "Read 24 books")        │
│                                     │
│  Deadline: [Pick a date]            │
│  Starting value: [0]                │
│                                     │
│  [Back]              [Next]         │
└─────────────────────────────────────┘

Step 3/3: Break it down
┌─────────────────────────────────────┐
│  Add milestones (optional):         │
│  ┌──────────────────────────────┐   │
│  │ + Add milestone              │   │
│  └──────────────────────────────┘   │
│                                     │
│  Link to daily habits (optional):   │
│  ☐ Run 3x/week                      │
│  ☐ Track calories                   │
│  ☐ [+ Create new habit]             │
│                                     │
│  [Back]         [Create Goal]       │
└─────────────────────────────────────┘
```

### 4.6 Finance Overview Screen

**Purpose**: Simple snapshot of spending and savings. Not a full budgeting tool.

**Layout**:

1. **Header**: "Finance" title. Add transaction button (+ icon, right).
2. **Month selector**: Left/right arrows with "March 2026" centered. Swipe to change month.
3. **Summary card**: Income vs Expenses this month. Large numbers. Net amount (green if positive, red if negative).
4. **Category breakdown**: Horizontal bar chart or simple list showing spending by category (Food, Transport, Entertainment, Bills, Other). Each row shows category name, amount, and percentage of total.
5. **Savings goals section**: Vertical list of savings goals with progress bars. Each shows name, current/target amounts, progress percentage. "Add savings goal" button at bottom.

### 4.7 Insights Screen

**Purpose**: Show cross-domain patterns. The "aha" moment that justifies using one unified app.

**Layout**:

1. **Header**: "Insights" title. Week selector (left/right arrows).
2. **Weekly Summary card**: "This week you completed 85% of habits, logged mood 5/7 days, and saved $120."
3. **Correlations section**: Cards showing discovered patterns, each with:
   - Insight text: "You sleep 45 min longer on days you exercise"
   - Supporting mini-chart (simple line or bar)
   - Confidence indicator (based on data points available)
4. **Trends section**: Line charts for key metrics over time (4-week view):
   - Habit completion rate
   - Average mood
   - Sleep duration
5. **Empty state** (first week): "Keep tracking for 7 days to unlock your first insights. You're X days in!"

### 4.8 More Menu Screen

**Purpose**: Access to secondary features and settings.

**Layout**: Simple grouped list with icons.

```
TRACK
  > Goals & Milestones
  > Finance

ANALYZE
  > Insights & Trends

APP
  > Settings
  > Export My Data
  > About LifePro
```

Each row has an icon (left), label (center), and chevron (right). Standard iOS/Android list style.

### 4.9 Settings Screen

**Purpose**: App configuration and preferences.

**Layout**: Grouped settings list.

```
APPEARANCE
  Theme: [Light | Dark | System] (segmented control)

MY FOCUS AREAS
  (Toggles for each life dimension, matching onboarding selection)
  Health & Fitness    [ON]
  Daily Habits        [ON]
  Goals               [ON]
  Finance             [OFF]
  Personal Growth     [ON]

DATA
  Export Data (JSON)   >
  Import Data          >
  Clear All Data       > (with confirmation dialog)

ABOUT
  Version 1.0.0
```

---

## 5. Interaction Patterns & Micro-UX

### Data Entry Philosophy

Every input should follow the **1-tap or 2-tap rule**:

| Action | Taps required |
|--------|--------------|
| Complete a habit | 1 (tap checkbox) |
| Log mood | 1 (tap face) |
| Log water | 1 (tap glass circle) |
| Log sleep duration | 2 (adjust hours, adjust minutes) |
| Add expense | 3 (amount, category, save) |
| Create new habit | 4 (name, frequency, category, save) |

### Feedback Patterns

| Event | Feedback |
|-------|----------|
| Habit completed | Haptic tap + checkbox animation + progress bar updates |
| All habits done for the day | Brief celebration (confetti burst, 1 second) |
| Streak milestone (7, 14, 30, 60, 90 days) | Congratulations card on Dashboard |
| Mood logged | Face icon scales up briefly, color fills in |
| Goal progress updated | Progress bar animates to new value |

### Empty States

Every screen that can be empty must have a friendly, actionable empty state:

| Screen | Empty State Message | CTA |
|--------|-------------------|-----|
| Dashboard habits | "No habits yet. Start with something small." | [Add Your First Habit] |
| Goals list | "What do you want to achieve?" | [Create a Goal] |
| Finance | "Track where your money goes." | [Add First Transaction] |
| Insights | "Keep logging for 7 days to see patterns." | (progress indicator: "Day 3 of 7") |
| Wellness history | "Start tracking to build your wellness picture." | [Log Today's Mood] |

### Error & Edge Cases

| Scenario | Behavior |
|----------|----------|
| User tries to delete habit with active streak | Warning: "This habit has a 14-day streak. Delete anyway?" with clear Cancel/Delete buttons |
| No data for insights | Show encouraging progress toward data threshold, never a blank screen |
| App opened after midnight (missed day) | Do not auto-mark previous day as missed until next app open. Allow backdating within 24 hours. |
| Very long habit/goal names | Truncate with ellipsis in lists. Show full name on detail screen. Max 50 characters enforced on input. |

---

## 6. Responsive Considerations

LifePro is mobile-first and mobile-primary. However, the architecture should not prevent future tablet support.

| Concern | Decision |
|---------|----------|
| Orientation | Portrait-locked for MVP. Simplifies layout work significantly. |
| Device sizes | Target 375pt width (iPhone SE/standard) as minimum. Test at 390pt (iPhone 14) and 430pt (iPhone 14 Pro Max). |
| Font scaling | Respect system accessibility font size settings. Use relative units (no fixed px for text). |
| Safe areas | Use SafeAreaView for all screens. Account for notch, home indicator, and status bar. |
| Tab bar | Fixed at bottom, above home indicator safe area. Standard height (49pt iOS, 56dp Android). |

---

## 7. Theme Support

### Light Theme (Default)

- Background: white/off-white surface
- Cards: white with subtle shadow
- Text: near-black primary, gray secondary
- Brand accent: used for progress bars, active states, FAB

### Dark Theme

- Background: dark gray (not pure black -- easier on eyes, works better with shadows)
- Cards: slightly lighter dark gray
- Text: off-white primary, medium gray secondary
- Brand accent: same hue, adjusted for dark background contrast (may need to lighten 10-15%)

### System Theme

- Follow device setting via `useColorScheme()` hook in React Native
- Stored preference in AsyncStorage overrides system default

---

## 8. Accessibility Baseline

| Requirement | Implementation |
|-------------|---------------|
| Touch targets | Minimum 44x44pt for all interactive elements |
| Color contrast | 4.5:1 minimum for text, 3:1 for large text and UI components |
| Screen reader | All interactive elements have accessibilityLabel. Habit checkboxes announce state ("Meditate, not completed" / "Meditate, completed"). |
| Motion | Respect `prefers-reduced-motion`. Skip confetti and celebration animations if set. |
| Focus order | Logical tab order follows visual layout. No focus traps in modals (close button reachable). |

---

## 9. Implementation Priority for Developers

This is the build order. Each step produces a usable increment.

| Priority | What to Build | Why First |
|----------|--------------|-----------|
| P0 | Tab navigation skeleton + empty screens | Everything hangs off navigation. Build the frame. |
| P1 | Habit tracker (create, list, check off) | This is the core habit loop. Daily value starts here. |
| P2 | Dashboard with habit checklist + mood entry | The "home screen" that makes the app feel complete. |
| P3 | Wellness entry screen (mood, sleep, water) | Second daily-use flow. Builds data for insights. |
| P4 | Goal creation wizard + goal list | Weekly-use feature. Adds depth and purpose. |
| P5 | Finance overview + transaction logging | Lowest daily-use frequency of core features. |
| P6 | Insights screen with basic correlations | Requires 7+ days of data. Build last, reward early users. |
| P7 | Settings, themes, data export | Polish and configuration. Not needed for core value. |

---

## 10. Screen Inventory (Complete)

Total unique screens for MVP: **17**

| # | Screen | Parent Tab | Type |
|---|--------|-----------|------|
| 1 | Onboarding - Welcome | -- | Modal flow |
| 2 | Onboarding - Focus Areas | -- | Modal flow |
| 3 | Onboarding - First Habit | -- | Modal flow |
| 4 | Dashboard | Dashboard | Tab root |
| 5 | Habits Today | Habits | Tab root |
| 6 | Habit List | Habits | Stack push |
| 7 | Habit Detail | Habits | Stack push |
| 8 | Streak Calendar | Habits | Stack push |
| 9 | Habit Create/Edit | Habits | Modal |
| 10 | Wellness Entry | Wellness | Tab root |
| 11 | Wellness History | Wellness | Stack push |
| 12 | More Menu | More | Tab root |
| 13 | Goals List | More | Stack push |
| 14 | Goal Create Wizard | More | Modal (3-step) |
| 15 | Goal Detail | More | Stack push |
| 16 | Finance Overview | More | Stack push |
| 17 | Add Transaction | More | Modal |
| 18 | Insights | More | Stack push |
| 19 | Settings | More | Stack push |
| 20 | Quick Add | -- | Bottom sheet modal (global) |

Adjusted total: **20 screens** (including Quick Add modal and 3 onboarding screens).

---

**ArchitectUX Agent**: UX Architecture complete.
**Handoff**: Ready for UI Designer (visual design, component library, design tokens) and Backend Architect (data models informed by screen data requirements).
**Next Steps**: UI Designer should use Section 4 wireframes as the basis for visual design. Mobile App Builder should use Section 9 as the build order. Backend Architect should derive the SQLite schema from the data fields implied by each screen.
