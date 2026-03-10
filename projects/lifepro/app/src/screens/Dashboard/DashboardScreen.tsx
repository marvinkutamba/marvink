import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useHabitStore } from '../../stores/habitStore';
import { Card, HabitCheckbox, ProgressBar } from '../../components';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout, shadows } from '../../theme';
import { getGreeting, getDisplayDate, getToday } from '../../utils/date';

export function DashboardScreen() {
  const { habits, isLoading, loadHabits, toggleCompletion } = useHabitStore();

  useEffect(() => {
    loadHabits();
  }, []);

  const completedCount = habits.filter(h => h.isCompletedToday).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadHabits} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{getDisplayDate(getToday())}</Text>
        </View>
      </View>

      {/* Progress Card */}
      {totalCount > 0 && (
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressCount}>
              {completedCount}/{totalCount}
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            color={progress === 1 ? colors.success : colors.primary[500]}
          />
          {progress === 1 && (
            <Text style={styles.allDoneText}>All habits completed!</Text>
          )}
        </Card>
      )}

      {/* Today's Habits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {habits.length === 0 ? (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="checkbox-marked-circle-outline"
              size={48}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Go to the Habits tab to create your first habit
            </Text>
          </Card>
        ) : (
          habits.map(habit => (
            <Pressable
              key={habit.id}
              style={styles.habitRow}
              onPress={() => toggleCompletion(habit.id)}
            >
              <HabitCheckbox
                isCompleted={habit.isCompletedToday}
                color={colors.success}
                onToggle={() => toggleCompletion(habit.id)}
              />
              <View style={styles.habitInfo}>
                <Text
                  style={[
                    styles.habitName,
                    habit.isCompletedToday && styles.habitNameCompleted,
                  ]}
                >
                  {habit.icon} {habit.name}
                </Text>
              </View>
              {habit.currentStreak > 0 && (
                <View style={styles.streakBadge}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={14}
                    color={colors.secondary[500]}
                  />
                  <Text style={styles.streakText}>{habit.currentStreak}</Text>
                </View>
              )}
            </Pressable>
          ))
        )}
      </View>

      {/* Daily Score */}
      {totalCount > 0 && (
        <Card style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Daily Score</Text>
          <Text style={styles.scoreValue}>
            {Math.round(progress * 100)}
          </Text>
          <Text style={styles.scoreUnit}>/ 100</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.surfaceSecondary,
  },
  content: {
    padding: layout.screenPaddingH,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  greeting: {
    ...typography.h2,
    color: lightTheme.textPrimary,
  },
  date: {
    ...typography.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.bodyBold,
    color: lightTheme.textPrimary,
  },
  progressCount: {
    ...typography.label,
    color: lightTheme.textSecondary,
  },
  allDoneText: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: lightTheme.textPrimary,
    marginBottom: spacing.md,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  habitInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  habitName: {
    ...typography.body,
    color: lightTheme.textPrimary,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: lightTheme.textTertiary,
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
    paddingVertical: spacing['2xl'],
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
  scoreCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  scoreLabel: {
    ...typography.label,
    color: lightTheme.textSecondary,
    marginRight: spacing.md,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary[500],
  },
  scoreUnit: {
    ...typography.caption,
    color: lightTheme.textTertiary,
  },
});
