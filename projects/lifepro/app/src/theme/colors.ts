export const colors = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
} as const;

export interface Theme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  error: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightTheme: Theme = {
  background: colors.neutral[0],
  surface: colors.neutral[0],
  surfaceSecondary: colors.neutral[50],
  border: colors.neutral[200],
  textPrimary: colors.neutral[900],
  textSecondary: colors.neutral[500],
  textTertiary: colors.neutral[400],
  accent: colors.primary[500],
  accentLight: colors.primary[50],
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  tabBarActive: colors.primary[500],
  tabBarInactive: colors.neutral[400],
};

export const darkTheme: Theme = {
  background: colors.neutral[950],
  surface: colors.neutral[900],
  surfaceSecondary: colors.neutral[800],
  border: colors.neutral[700],
  textPrimary: colors.neutral[50],
  textSecondary: colors.neutral[400],
  textTertiary: colors.neutral[500],
  accent: colors.primary[400],
  accentLight: colors.primary[900],
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  tabBarActive: colors.primary[400],
  tabBarInactive: colors.neutral[500],
};
