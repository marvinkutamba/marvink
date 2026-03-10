import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme';

interface HabitCheckboxProps {
  isCompleted: boolean;
  color?: string;
  size?: number;
  onToggle: () => void;
}

export function HabitCheckbox({
  isCompleted,
  color = colors.success,
  size = 28,
  onToggle,
}: HabitCheckboxProps) {
  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isCompleted ? color : 'transparent',
            borderColor: isCompleted ? color : colors.neutral[300],
          },
        ]}
      >
        {isCompleted && (
          <Ionicons name="checkmark" size={size * 0.6} color="#FFFFFF" />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
