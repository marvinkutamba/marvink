export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  frequencyDays: DayOfWeek[] | null;
  reminderTime: string | null;
  category: string;
  sortOrder: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedDate: string;
  completedAt: string;
}

export interface HabitWithStats extends Habit {
  isCompletedToday: boolean;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
}

export interface MoodEntry {
  id: string;
  date: string;
  score: number;
  tags: string[];
  createdAt: string;
}

export interface DailyScore {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  completionPercentage: number;
  mood: number | null;
}

export interface CreateHabitInput {
  name: string;
  icon?: string;
  color?: string;
  frequency?: HabitFrequency;
  frequencyDays?: DayOfWeek[];
  reminderTime?: string;
  category?: string;
}

export interface UpdateHabitInput extends Partial<CreateHabitInput> {
  id: string;
}
