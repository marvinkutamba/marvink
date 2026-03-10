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
import { Button } from '../../components';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout } from '../../theme';
import { getToday, generateId } from '../../utils/date';
import { insertTransaction } from '../../database';

const CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍔' },
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'entertainment', label: 'Fun', emoji: '🎮' },
  { key: 'bills', label: 'Bills', emoji: '📄' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { key: 'health', label: 'Health', emoji: '💊' },
  { key: 'other', label: 'Other', emoji: '📦' },
];

export function AddTransactionScreen() {
  const navigation = useNavigation();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const canSave = amount.trim().length > 0 && !isNaN(parseFloat(amount));

  async function handleSave() {
    if (!canSave) return;
    await insertTransaction({
      id: generateId(),
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      type,
      date: getToday(),
    });
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Type Toggle */}
      <View style={styles.typeRow}>
        <Pressable
          style={[styles.typeOption, type === 'expense' && styles.typeExpenseSelected]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextSelected]}>
            Expense
          </Text>
        </Pressable>
        <Pressable
          style={[styles.typeOption, type === 'income' && styles.typeIncomeSelected]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && styles.typeTextSelectedIncome]}>
            Income
          </Text>
        </Pressable>
      </View>

      {/* Amount */}
      <View style={styles.field}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySign}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.neutral[400]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              style={[
                styles.categoryOption,
                category === cat.key && styles.categorySelected,
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  category === cat.key && styles.categoryLabelSelected,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="What was this for?"
          placeholderTextColor={colors.neutral[400]}
          value={description}
          onChangeText={setDescription}
          maxLength={100}
        />
      </View>

      <Button
        title="Save Transaction"
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
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  typeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeExpenseSelected: {
    backgroundColor: colors.error + '15',
    borderColor: colors.error,
  },
  typeIncomeSelected: {
    backgroundColor: colors.success + '15',
    borderColor: colors.success,
  },
  typeText: {
    ...typography.bodyBold,
    color: lightTheme.textSecondary,
  },
  typeTextSelected: {
    color: colors.error,
  },
  typeTextSelectedIncome: {
    color: colors.success,
  },
  field: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    color: lightTheme.textPrimary,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySign: {
    fontSize: 36,
    fontWeight: '700',
    color: lightTheme.textPrimary,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: lightTheme.textPrimary,
    padding: 0,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: lightTheme.surfaceSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  categorySelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    ...typography.small,
    color: lightTheme.textSecondary,
    marginTop: spacing.xs,
  },
  categoryLabelSelected: {
    color: colors.primary[600],
    fontWeight: '500',
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
  saveButton: {
    marginTop: spacing.base,
  },
});
