import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppStore {
  isOnboardingComplete: boolean;
  theme: 'light' | 'dark' | 'system';
  isLoading: boolean;
  loadPreferences: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
}

const STORAGE_KEYS = {
  ONBOARDING: 'lifepro_onboarding_complete',
  THEME: 'lifepro_theme',
} as const;

export const useAppStore = create<AppStore>((set) => ({
  isOnboardingComplete: false,
  theme: 'light',
  isLoading: true,

  loadPreferences: async () => {
    try {
      const [onboarding, theme] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
      ]);

      set({
        isOnboardingComplete: onboarding === 'true',
        theme: (theme as 'light' | 'dark' | 'system') ?? 'light',
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    set({ isOnboardingComplete: true });
  },

  setTheme: async (theme) => {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    set({ theme });
  },
}));
