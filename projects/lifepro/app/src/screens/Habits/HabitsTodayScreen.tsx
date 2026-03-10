import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHabitStore } from '../../stores/habitStore';
import { HabitCheckbox, Card } from '../../components';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout, shadows } from '../../theme';

export function HabitsTodayScreen() {
  const navigation = useNavigation<any>();
  const { habits, isLoading, loadHabits, toggleCompletion } = useHabitStore();

  useEffect(() => {
    loadHabits();
  }, []);

  const completedCount = habits.filter(h => h.isCompletedToday).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadHabits} />
        }
      >
        {/* Summary Bar */}
        {habits.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              {completedCount} of {habits.length} completed today
            </Text>
            {habits.some(h => h.currentStreak > 0) && (
              <View style={styles.bestStreakRow}>
                <MaterialCommunityIcons
                  name="fire"
                  size={16}
                  color={colors.secondary[500]}
                />
                <Text style={styles.bestStreakText}>
                  Best active streak:{' '}
                  {Math.max(...habits.map(h => h.currentStreak))} days
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Habit List */}
        {habits.length === 0 ? (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="playlist-plus"
              size={48}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyTitle}>Start with one small win</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first habit
            </Text>
          </Card>
        ) : (
          habits.map(habit => (
            <Pressable
              key={habit.id}
              style={styles.habitCard}
              onPress={() =>
                navigation.navigate('HabitDetail', { habitId: habit.id })
              }
            >
              <View style={styles.habitLeft}>
                <HabitCheckbox
                  isCompleted={habit.isCompletedToday}
                  color={colors.success}
                  onToggle={() => toggleCompletion(habit.id)}
                />
                <View style={styles.habitInfo}>
                  <Text
                    style={[
                      styles.habitName,
                      habit.isCompletedToday && styles.completedName,
                    ]}
                  >
                    {habit.icon} {habit.name}
                  </Text>
                  <Text style={styles.habitFrequency}>
                    {habit.frequency === 'daily'
                      ? 'Every day'
                      : habit.frequency === 'weekly'
                      ? 'Weekly'
                      : 'Custom'}
                  </Text>
                </View>
              </View>
              <View style={styles.habitRight}>
                {habit.currentStreak > 0 && (
                  <View style={styles.streakBadge}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={14}
                      color={colors.secondary[500]}
                    />
                    <Text style={styles.streakText}>
                      {habit.currentStreak}
                    </Text>
                  </View>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.neutral[300]}
                />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('CreateHabit')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.surfaceSecondary,
  },
  content: {
    padding: layout.screenPaddingH,
    paddingBottom: 100,
  },
  summaryCard: {
    marginBottom: spacing.xl,
  },
  summaryText: {
    ...typography.bodyBold,
    color: lightTheme.textPrimary,
  },
  bestStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  bestStreakText: {
    ...typography.caption,
    color: colors.secondary[600],
    marginLeft: spacing.xs,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  habitName: {
    ...typography.body,
    color: lightTheme.textPrimary,
  },
  completedName: {
    textDecorationLine: 'line-through',
    color: lightTheme.textTertiary,
  },
  habitFrequency: {
    ...typography.small,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
  habitRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  streakText: {
    ...typography.small,
    color: colors.secondary[600],
    fontWeight: '600',
    marginLeft: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: lightTheme.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.caption,
    color: lightTheme.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
