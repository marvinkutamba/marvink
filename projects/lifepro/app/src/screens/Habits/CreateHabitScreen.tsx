import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useHabitStore } from '../../stores/habitStore';
import { Button } from '../../components';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout } from '../../theme';
import type { HabitFrequency } from '../../types';

const ICONS = ['🏃', '📖', '🧘', '💧', '💪', '🎯', '📝', '🎵', '💤', '🍎', '🧠', '🎨'];
const COLORS = [
  '#6366F1', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
];

export function CreateHabitScreen() {
  const navigation = useNavigation();
  const createHabit = useHabitStore(s => s.createHabit);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✓');
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    await createHabit({
      name: name.trim(),
      icon,
      color,
      frequency,
    });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Name Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Exercise 30 minutes"
          placeholderTextColor={colors.neutral[400]}
          value={name}
          onChangeText={setName}
          maxLength={50}
          autoFocus
        />
      </View>

      {/* Icon Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map(i => (
            <Pressable
              key={i}
              style={[
                styles.iconOption,
                icon === i && styles.iconSelected,
              ]}
              onPress={() => setIcon(i)}
            >
              <Text style={styles.iconText}>{i}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Frequency */}
      <View style={styles.field}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyRow}>
          {(['daily', 'weekly'] as HabitFrequency[]).map(f => (
            <Pressable
              key={f}
              style={[
                styles.frequencyOption,
                frequency === f && styles.frequencySelected,
              ]}
              onPress={() => setFrequency(f)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  frequency === f && styles.frequencyTextSelected,
                ]}
              >
                {f === 'daily' ? 'Daily' : 'Weekly'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Color Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {COLORS.map(c => (
            <Pressable
              key={c}
              style={[
                styles.colorOption,
                { backgroundColor: c },
                color === c && styles.colorSelected,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>
      </View>

      {/* Save Button */}
      <Button
        title="Create Habit"
        onPress={handleSave}
        disabled={!canSave}
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.surface,
  },
  content: {
    padding: layout.screenPaddingH,
    paddingBottom: 40,
  },
  field: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    color: lightTheme.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    ...typography.body,
    color: lightTheme.textPrimary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.surfaceSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  iconText: {
    fontSize: 24,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  frequencyOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    backgroundColor: lightTheme.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  frequencySelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  frequencyText: {
    ...typography.label,
    color: lightTheme.textSecondary,
  },
  frequencyTextSelected: {
    color: colors.primary[600],
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: colors.neutral[900],
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});
