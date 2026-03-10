import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, lightTheme } from '../../theme/colors';
import { spacing, typography, radius, layout } from '../../theme';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

function MenuItem({ icon, label, onPress, disabled }: MenuItemProps) {
  return (
    <Pressable
      style={[styles.menuItem, disabled && styles.menuItemDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={icon as any}
        size={22}
        color={disabled ? colors.neutral[300] : colors.primary[500]}
      />
      <Text style={[styles.menuLabel, disabled && styles.menuLabelDisabled]}>
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={disabled ? colors.neutral[200] : colors.neutral[400]}
      />
    </Pressable>
  );
}

export function MoreScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Track Section */}
      <Text style={styles.sectionHeader}>TRACK</Text>
      <View style={styles.section}>
        <MenuItem icon="flag-outline" label="Goals & Milestones" disabled />
        <MenuItem icon="wallet-outline" label="Finance" disabled />
      </View>

      {/* Analyze Section */}
      <Text style={styles.sectionHeader}>ANALYZE</Text>
      <View style={styles.section}>
        <MenuItem icon="analytics-outline" label="Insights & Trends" disabled />
      </View>

      {/* App Section */}
      <Text style={styles.sectionHeader}>APP</Text>
      <View style={styles.section}>
        <MenuItem icon="settings-outline" label="Settings" disabled />
        <MenuItem icon="download-outline" label="Export My Data" disabled />
        <MenuItem icon="information-circle-outline" label="About LifePro" disabled />
      </View>

      <Text style={styles.comingSoon}>
        These features are coming in future updates
      </Text>
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
  sectionHeader: {
    ...typography.small,
    fontWeight: '600',
    color: lightTheme.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  section: {
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuLabel: {
    ...typography.body,
    color: lightTheme.textPrimary,
    flex: 1,
    marginLeft: spacing.md,
  },
  menuLabelDisabled: {
    color: lightTheme.textTertiary,
  },
  comingSoon: {
    ...typography.caption,
    color: lightTheme.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
