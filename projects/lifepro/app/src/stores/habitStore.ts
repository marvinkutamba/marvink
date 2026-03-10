import { create } from 'zustand';
import type { HabitWithStats, CreateHabitInput, UpdateHabitInput } from '../types';
import {
  getAllHabits,
  insertHabit,
  updateHabitDb,
  deleteHabitDb,
  getCompletionsForHabit,
  getCompletionsForDate,
  toggleCompletionDb,
} from '../database';
import { getToday, calculateStreak, generateId } from '../utils/date';

interface HabitStore {
  habits: HabitWithStats[];
  isLoading: boolean;
  loadHabits: () => Promise<void>;
  createHabit: (input: CreateHabitInput) => Promise<void>;
  updateHabit: (input: UpdateHabitInput) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  isLoading: false,

  loadHabits: async () => {
    set({ isLoading: true });
    try {
      const today = getToday();
      const rawHabits = await getAllHabits();
      const completionsToday = await getCompletionsForDate(today);
      const completedTodayIds = new Set(completionsToday.map(c => c.habit_id));

      const habitsWithStats: HabitWithStats[] = await Promise.all(
        rawHabits.map(async (h: any) => {
          const completionDates = await getCompletionsForHabit(h.id);
          const { current, best } = calculateStreak(completionDates, today);

          return {
            id: h.id,
            name: h.name,
            icon: h.icon,
            color: h.color,
            frequency: h.frequency,
            frequencyDays: h.frequency_days ? JSON.parse(h.frequency_days) : null,
            reminderTime: h.reminder_time,
            category: h.category,
            sortOrder: h.sort_order,
            isArchived: h.is_archived === 1,
            createdAt: h.created_at,
            updatedAt: h.updated_at,
            isCompletedToday: completedTodayIds.has(h.id),
            currentStreak: current,
            bestStreak: best,
            totalCompletions: completionDates.length,
          };
        })
      );

      set({ habits: habitsWithStats, isLoading: false });
    } catch (error) {
      console.error('Failed to load habits:', error);
      set({ isLoading: false });
    }
  },

  createHabit: async (input: CreateHabitInput) => {
    const id = generateId();
    const habit = {
      id,
      name: input.name,
      icon: input.icon ?? '✓',
      color: input.color ?? '#6366F1',
      frequency: input.frequency ?? 'daily',
      frequencyDays: input.frequencyDays ? JSON.stringify(input.frequencyDays) : null,
      reminderTime: input.reminderTime ?? null,
      category: input.category ?? 'general',
      sortOrder: get().habits.length,
    };

    await insertHabit(habit);
    await get().loadHabits();
  },

  updateHabit: async (input: UpdateHabitInput) => {
    const updates: Record<string, any> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.icon !== undefined) updates.icon = input.icon;
    if (input.color !== undefined) updates.color = input.color;
    if (input.frequency !== undefined) updates.frequency = input.frequency;
    if (input.frequencyDays !== undefined)
      updates.frequency_days = JSON.stringify(input.frequencyDays);
    if (input.reminderTime !== undefined) updates.reminder_time = input.reminderTime;
    if (input.category !== undefined) updates.category = input.category;

    if (Object.keys(updates).length > 0) {
      await updateHabitDb(input.id, updates);
      await get().loadHabits();
    }
  },

  deleteHabit: async (id: string) => {
    await deleteHabitDb(id);
    await get().loadHabits();
  },

  toggleCompletion: async (habitId: string) => {
    const today = getToday();
    const completionId = generateId();
    await toggleCompletionDb(completionId, habitId, today);
    await get().loadHabits();
  },
}));
