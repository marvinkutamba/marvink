import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHabitStore } from '../../stores/habitStore';
import { Card, Button } from '../../components';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout } from '../../theme';
import { getToday, getMonthDates } from '../../utils/date';
import { getCompletionsForHabit } from '../../database';

export function HabitDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const habitId = route.params?.habitId;

  const habits = useHabitStore(s => s.habits);
  const deleteHabit = useHabitStore(s => s.deleteHabit);
  const habit = habits.find(h => h.id === habitId);

  const [completionDates, setCompletionDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (habitId) {
      getCompletionsForHabit(habitId).then(dates => {
        setCompletionDates(new Set(dates));
      });
    }
  }, [habitId, habits]);

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Habit not found</Text>
      </View>
    );
  }

  const today = getToday();
  const currentDate = new Date(today + 'T12:00:00');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDates = getMonthDates(year, month);

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const completionRate = habit.totalCompletions > 0
    ? Math.round((habit.totalCompletions / Math.max(1, Math.floor((Date.now() - new Date(habit.createdAt).getTime()) / 86400000))) * 100)
    : 0;

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"?${
        habit.currentStreak > 0
          ? ` This habit has a ${habit.currentStreak}-day streak.`
          : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habit.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Habit Header */}
      <View style={styles.header}>
        <Text style={styles.habitIcon}>{habit.icon}</Text>
        <Text style={styles.habitName}>{habit.name}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={24} color={colors.secondary[500]} />
          <Text style={styles.statValue}>{habit.currentStreak}</Text>
          <Text style={styles.statLabel}>Current</Text>
        </Card>
        <Card style={styles.statCard}>
          <MaterialCommunityIcons name="trophy" size={24} color={colors.secondary[400]} />
          <Text style={styles.statValue}>{habit.bestStreak}</Text>
          <Text style={styles.statLabel}>Best</Text>
        </Card>
        <Card style={styles.statCard}>
          <MaterialCommunityIcons name="check-all" size={24} color={colors.success} />
          <Text style={styles.statValue}>{habit.totalCompletions}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>
      </View>

      {/* Calendar */}
      <Card style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>{monthName}</Text>
        <View style={styles.calendarHeader}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <Text key={day} style={styles.calendarDayLabel}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.calendarCell} />
          ))}
          {/* Day cells */}
          {monthDates.map(date => {
            const dayNum = parseInt(date.split('-')[2], 10);
            const isCompleted = completionDates.has(date);
            const isToday = date === today;
            const isFuture = date > today;

            return (
              <View key={date} style={styles.calendarCell}>
                <View
                  style={[
                    styles.calendarDay,
                    isCompleted && { backgroundColor: colors.success },
                    isToday && !isCompleted && styles.calendarToday,
                    isFuture && styles.calendarFuture,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      isCompleted && { color: '#FFFFFF' },
                      isFuture && { color: colors.neutral[300] },
                    ]}
                  >
                    {dayNum}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Delete */}
      <Pressable onPress={handleDelete} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete Habit</Text>
      </Pressable>
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
    paddingBottom: 40,
  },
  notFound: {
    ...typography.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.base,
  },
  habitIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  habitName: {
    ...typography.h2,
    color: lightTheme.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  statValue: {
    ...typography.h2,
    color: lightTheme.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    color: lightTheme.textSecondary,
  },
  calendarCard: {
    marginBottom: spacing.xl,
  },
  calendarTitle: {
    ...typography.bodyBold,
    color: lightTheme.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  calendarDayLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.small,
    color: lightTheme.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  calendarDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarToday: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  calendarFuture: {
    opacity: 0.4,
  },
  calendarDayText: {
    ...typography.small,
    color: lightTheme.textPrimary,
    fontWeight: '500',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  deleteText: {
    ...typography.body,
    color: colors.error,
  },
});
