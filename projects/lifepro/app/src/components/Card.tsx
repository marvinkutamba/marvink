import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, radius, shadows } from '../theme';
import { lightTheme } from '../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
});
