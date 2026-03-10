import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Card, ProgressBar } from '../../components';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout } from '../../theme';
import { getToday, formatDate } from '../../utils/date';
import { useHabitStore } from '../../stores/habitStore';
import {
  getMoodHistory,
  getTransactionsForMonth,
  getCompletionsForDate,
  getAllHabits,
} from '../../database';

interface WeeklySummary {
  habitCompletionRate: number;
  moodAverage: number | null;
  moodDaysLogged: number;
  totalExpenses: number;
  daysTracked: number;
}

interface Insight {
  icon: string;
  iconColor: string;
  text: string;
  confidence: 'low' | 'medium' | 'high';
}

export function InsightsScreen() {
  const today = getToday();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [daysOfData, setDaysOfData] = useState(0);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get all habits
    const habits = await getAllHabits();

    // Calculate weekly habit completion
    let totalCompleted = 0;
    let totalPossible = 0;
    const dailyCompletions: number[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const completions = await getCompletionsForDate(dateStr);
      const completed = completions.length;
      dailyCompletions.push(completed);
      totalCompleted += completed;
      totalPossible += habits.length;
    }

    // Get mood history
    const moods = await getMoodHistory(7);
    const moodAvg = moods.length > 0
      ? moods.reduce((sum: number, m: any) => sum + m.score, 0) / moods.length
      : null;

    // Get this month's expenses
    const yearMonth = today.substring(0, 7);
    const transactions = await getTransactionsForMonth(yearMonth);
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const completionRate = totalPossible > 0 ? totalCompleted / totalPossible : 0;

    setSummary({
      habitCompletionRate: completionRate,
      moodAverage: moodAvg,
      moodDaysLogged: moods.length,
      totalExpenses,
      daysTracked: Math.min(7, habits.length > 0 ? 7 : 0),
    });

    setDaysOfData(habits.length > 0 ? dailyCompletions.filter(c => c > 0).length : 0);

    // Generate insights
    const generatedInsights: Insight[] = [];

    if (completionRate >= 0.8) {
      generatedInsights.push({
        icon: 'trophy',
        iconColor: colors.secondary[500],
        text: `Great week! You completed ${Math.round(completionRate * 100)}% of your habits.`,
        confidence: 'high',
      });
    } else if (completionRate > 0 && completionRate < 0.5) {
      generatedInsights.push({
        icon: 'trending-up',
        iconColor: colors.primary[500],
        text: `You completed ${Math.round(completionRate * 100)}% of habits this week. Small progress counts!`,
        confidence: 'high',
      });
    }

    if (moodAvg !== null) {
      if (moodAvg >= 4) {
        generatedInsights.push({
          icon: 'sunny',
          iconColor: colors.secondary[400],
          text: `Your average mood this week is ${moodAvg.toFixed(1)}/5 — you're doing well!`,
          confidence: 'medium',
        });
      } else if (moodAvg < 3) {
        generatedInsights.push({
          icon: 'heart',
          iconColor: colors.error,
          text: `Your mood averaged ${moodAvg.toFixed(1)}/5 this week. Consider what might help improve it.`,
          confidence: 'medium',
        });
      }
    }

    // Cross-domain: habits + mood correlation
    if (moods.length >= 3 && dailyCompletions.length >= 3) {
      const highCompletionDays = dailyCompletions.filter(c => c >= habits.length * 0.8).length;
      if (highCompletionDays >= 3) {
        generatedInsights.push({
          icon: 'link',
          iconColor: colors.primary[400],
          text: 'On days you complete most habits, your overall tracking is stronger. Keep the momentum!',
          confidence: 'low',
        });
      }
    }

    if (totalExpenses > 0) {
      generatedInsights.push({
        icon: 'wallet',
        iconColor: colors.info,
        text: `You've spent $${totalExpenses.toFixed(2)} this month so far.`,
        confidence: 'high',
      });
    }

    if (generatedInsights.length === 0 && habits.length > 0) {
      generatedInsights.push({
        icon: 'time',
        iconColor: colors.neutral[400],
        text: 'Keep tracking for a full week to unlock personalized insights!',
        confidence: 'low',
      });
    }

    setInsights(generatedInsights);
  }

  const confidenceLabel: Record<string, string> = {
    low: 'Early signal',
    medium: 'Likely pattern',
    high: 'Strong signal',
  };

  const confidenceColor: Record<string, string> = {
    low: colors.neutral[400],
    medium: colors.secondary[500],
    high: colors.success,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Weekly Summary */}
      {summary && (
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>This Week</Text>

          {summary.habitCompletionRate > 0 && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
              <Text style={styles.summaryText}>
                Habits completed: {Math.round(summary.habitCompletionRate * 100)}%
              </Text>
            </View>
          )}

          {summary.moodAverage !== null && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="emoticon" size={20} color={colors.secondary[500]} />
              <Text style={styles.summaryText}>
                Mood logged {summary.moodDaysLogged}/7 days (avg {summary.moodAverage.toFixed(1)})
              </Text>
            </View>
          )}

          {summary.totalExpenses > 0 && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="cash" size={20} color={colors.info} />
              <Text style={styles.summaryText}>
                Spent ${summary.totalExpenses.toFixed(2)} this month
              </Text>
            </View>
          )}

          {summary.habitCompletionRate === 0 && summary.moodAverage === null && summary.totalExpenses === 0 && (
            <Text style={styles.noDataText}>
              Start tracking to see your weekly summary
            </Text>
          )}
        </Card>
      )}

      {/* Data Progress */}
      {daysOfData < 7 && (
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={colors.primary[500]} />
            <Text style={styles.progressTitle}>Building your insights</Text>
          </View>
          <ProgressBar
            progress={daysOfData / 7}
            color={colors.primary[500]}
          />
          <Text style={styles.progressText}>
            {daysOfData}/7 days tracked — {7 - daysOfData} more days until full weekly insights
          </Text>
        </Card>
      )}

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        {insights.length === 0 ? (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons name="lightbulb-outline" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No insights yet</Text>
            <Text style={styles.emptySubtext}>
              Track habits, mood, and expenses for 7 days to see patterns
            </Text>
          </Card>
        ) : (
          insights.map((insight, index) => (
            <Card key={index} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons name={insight.icon as any} size={24} color={insight.iconColor} />
                <View
                  style={[
                    styles.confidenceBadge,
                    { backgroundColor: confidenceColor[insight.confidence] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.confidenceText,
                      { color: confidenceColor[insight.confidence] },
                    ]}
                  >
                    {confidenceLabel[insight.confidence]}
                  </Text>
                </View>
              </View>
              <Text style={styles.insightText}>{insight.text}</Text>
            </Card>
          ))
        )}
      </View>
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
  cardTitle: {
    ...typography.h3,
    color: lightTheme.textPrimary,
    marginBottom: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typography.body,
    color: lightTheme.textPrimary,
  },
  noDataText: {
    ...typography.caption,
    color: lightTheme.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  progressCard: {
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.bodyBold,
    color: lightTheme.textPrimary,
  },
  progressText: {
    ...typography.caption,
    color: lightTheme.textSecondary,
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: lightTheme.textPrimary,
    marginBottom: spacing.md,
  },
  insightCard: {
    marginBottom: spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  confidenceText: {
    ...typography.small,
    fontWeight: '500',
  },
  insightText: {
    ...typography.body,
    color: lightTheme.textPrimary,
    lineHeight: 22,
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
  emptySubtext: {
    ...typography.caption,
    color: lightTheme.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
