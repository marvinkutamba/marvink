import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { HabitsTodayScreen } from '../screens/Habits/HabitsTodayScreen';
import { CreateHabitScreen } from '../screens/Habits/CreateHabitScreen';
import { HabitDetailScreen } from '../screens/Habits/HabitDetailScreen';
import { WellnessScreen } from '../screens/Wellness/WellnessScreen';
import { FinanceScreen } from '../screens/Finance/FinanceScreen';
import { AddTransactionScreen } from '../screens/Finance/AddTransactionScreen';
import { InsightsScreen } from '../screens/Insights/InsightsScreen';
import { MoreScreen } from '../screens/More/MoreScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme';

const Tab = createBottomTabNavigator();
const HabitsStack = createNativeStackNavigator();
const FinanceStack = createNativeStackNavigator();

const defaultScreenOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.neutral[50] },
  headerTitleStyle: { ...typography.bodyBold, color: colors.neutral[900] },
};

function HabitsStackNavigator() {
  return (
    <HabitsStack.Navigator screenOptions={defaultScreenOptions}>
      <HabitsStack.Screen
        name="HabitsToday"
        component={HabitsTodayScreen}
        options={{ title: 'Habits' }}
      />
      <HabitsStack.Screen
        name="CreateHabit"
        component={CreateHabitScreen}
        options={{ title: 'New Habit', presentation: 'modal' }}
      />
      <HabitsStack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={{ title: 'Habit Detail' }}
      />
    </HabitsStack.Navigator>
  );
}

function FinanceStackNavigator() {
  return (
    <FinanceStack.Navigator screenOptions={defaultScreenOptions}>
      <FinanceStack.Screen
        name="FinanceOverview"
        component={FinanceScreen}
        options={{ title: 'Finance' }}
      />
      <FinanceStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: 'Add Transaction', presentation: 'modal' }}
      />
    </FinanceStack.Navigator>
  );
}

type TabIconMap = Record<string, { focused: string; default: string }>;

const TAB_ICONS: TabIconMap = {
  Dashboard: { focused: 'grid', default: 'grid-outline' },
  Habits: { focused: 'checkmark-circle', default: 'checkmark-circle-outline' },
  Wellness: { focused: 'heart', default: 'heart-outline' },
  Finance: { focused: 'wallet', default: 'wallet-outline' },
  Insights: { focused: 'analytics', default: 'analytics-outline' },
};

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name] || { focused: 'help-circle', default: 'help-circle-outline' };
            const iconName = focused ? icons.focused : icons.default;
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary[500],
          tabBarInactiveTintColor: colors.neutral[400],
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: colors.neutral[200],
            height: Platform.select({ ios: 84, android: 64 }),
            paddingBottom: Platform.select({ ios: 24, android: 8 }),
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.neutral[50] },
          headerTitleStyle: { ...typography.bodyBold, color: colors.neutral[900] },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="Habits"
          component={HabitsStackNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Wellness"
          component={WellnessScreen}
        />
        <Tab.Screen
          name="Finance"
          component={FinanceStackNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Insights"
          component={InsightsScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
