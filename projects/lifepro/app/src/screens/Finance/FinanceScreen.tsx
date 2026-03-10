import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card, ProgressBar } from '../../components';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout, shadows } from '../../theme';
import { getToday } from '../../utils/date';
import {
  getTransactionsForMonth,
  getAllSavingsGoals,
} from '../../database';

const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  food: { icon: 'fast-food-outline', color: '#F59E0B' },
  transport: { icon: 'car-outline', color: '#3B82F6' },
  entertainment: { icon: 'game-controller-outline', color: '#8B5CF6' },
  bills: { icon: 'receipt-outline', color: '#EF4444' },
  shopping: { icon: 'bag-outline', color: '#EC4899' },
  health: { icon: 'medkit-outline', color: '#10B981' },
  other: { icon: 'ellipsis-horizontal-circle-outline', color: '#6B7280' },
};

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: string;
  date: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
}

export function FinanceScreen() {
  const navigation = useNavigation<any>();
  const today = getToday();
  const yearMonth = today.substring(0, 7); // YYYY-MM

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [currentMonth, setCurrentMonth] = useState(yearMonth);

  const loadData = useCallback(async () => {
    const [txs, goals] = await Promise.all([
      getTransactionsForMonth(currentMonth),
      getAllSavingsGoals(),
    ]);
    setTransactions(txs as Transaction[]);
    setSavingsGoals(goals as SavingsGoal[]);
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const net = income - expenses;

  // Group expenses by category
  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  const monthDate = new Date(currentMonth + '-15');
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function changeMonth(delta: number) {
    const d = new Date(currentMonth + '-15');
    d.setMonth(d.getMonth() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${y}-${m}`);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={lightTheme.textPrimary} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable onPress={() => changeMonth(1)} hitSlop={12}>
            <Ionicons name="chevron-forward" size={24} color={lightTheme.textPrimary} />
          </Pressable>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                ${income.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>
                ${expenses.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net</Text>
            <Text
              style={[
                styles.netValue,
                { color: net >= 0 ? colors.success : colors.error },
              ]}
            >
              {net >= 0 ? '+' : ''}${net.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Category Breakdown */}
        {sortedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            {sortedCategories.map(([category, amount]) => {
              const catInfo = CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
              const percentage = expenses > 0 ? amount / expenses : 0;

              return (
                <View key={category} style={styles.categoryRow}>
                  <View style={[styles.categoryIcon, { backgroundColor: catInfo.color + '20' }]}>
                    <Ionicons name={catInfo.icon as any} size={20} color={catInfo.color} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                      <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
                    </View>
                    <ProgressBar
                      progress={percentage}
                      color={catInfo.color}
                      height={6}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Savings Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
          {savingsGoals.length === 0 ? (
            <Card style={styles.emptyCard}>
              <MaterialCommunityIcons name="piggy-bank-outline" size={40} color={colors.neutral[300]} />
              <Text style={styles.emptyText}>No savings goals yet</Text>
            </Card>
          ) : (
            savingsGoals.map(goal => {
              const progress = goal.target_amount > 0
                ? goal.current_amount / goal.target_amount
                : 0;
              return (
                <Card key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalAmount}>
                      ${goal.current_amount.toFixed(0)} / ${goal.target_amount.toFixed(0)}
                    </Text>
                  </View>
                  <ProgressBar progress={progress} color={colors.success} />
                  <Text style={styles.goalPercent}>
                    {Math.round(progress * 100)}% complete
                  </Text>
                </Card>
              );
            })
          )}
        </View>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.slice(0, 10).map(tx => {
              const catInfo = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS.other;
              return (
                <View key={tx.id} style={styles.txRow}>
                  <View style={[styles.categoryIcon, { backgroundColor: catInfo.color + '20' }]}>
                    <Ionicons name={catInfo.icon as any} size={18} color={catInfo.color} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txDescription}>
                      {tx.description || tx.category}
                    </Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.type === 'income' ? colors.success : colors.error },
                    ]}
                  >
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {transactions.length === 0 && sortedCategories.length === 0 && (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons name="wallet-outline" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Track where your money goes</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add your first transaction
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  monthLabel: {
    ...typography.bodyBold,
    color: lightTheme.textPrimary,
  },
  summaryCard: {
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.base,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
  },
  summaryLabel: {
    ...typography.caption,
    color: lightTheme.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h2,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.sm,
  },
  netLabel: {
    ...typography.label,
    color: lightTheme.textSecondary,
  },
  netValue: {
    ...typography.h3,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: lightTheme.textPrimary,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.body,
    color: lightTheme.textPrimary,
  },
  categoryAmount: {
    ...typography.bodyBold,
    color: lightTheme.textPrimary,
  },
  goalCard: {
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  goalName: {
    ...typography.bodyBold,
    color: lightTheme.textPrimary,
  },
  goalAmount: {
    ...typography.caption,
    color: lightTheme.textSecondary,
  },
  goalPercent: {
    ...typography.small,
    color: lightTheme.textSecondary,
    marginTop: spacing.xs,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  txInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  txDescription: {
    ...typography.body,
    color: lightTheme.textPrimary,
  },
  txDate: {
    ...typography.small,
    color: lightTheme.textTertiary,
  },
  txAmount: {
    ...typography.bodyBold,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    ...typography.caption,
    color: lightTheme.textSecondary,
    marginTop: spacing.sm,
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
