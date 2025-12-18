import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabParamList } from '../types/navigation';
import { Colors } from '../constants/Colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SleepTrackerScreen from '../screens/SleepTrackerScreen';
import TaskJournalScreen from '../screens/TaskJournalScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Bottom Tab Navigator
 * 5つのタブ: ホーム / 睡眠 / タスク / グラフ / 設定
 */
export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'ホーム',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🏠" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SleepTracker"
        component={SleepTrackerScreen}
        options={{
          title: '睡眠記録',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="😴" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TaskJournal"
        component={TaskJournalScreen}
        options={{
          title: 'タスク',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📝" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'グラフ',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📊" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="⚙️" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * タブアイコンコンポーネント（絵文字版）
 */
interface TabIconProps {
  emoji: string;
  color: string;
}

function TabIcon({ emoji, color }: TabIconProps) {
  return (
    <Text style={{ fontSize: 24, opacity: color === Colors.tabBarActive ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}
