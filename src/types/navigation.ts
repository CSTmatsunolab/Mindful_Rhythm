/**
 * ナビゲーション型定義
 * React Navigationの型安全性を確保
 */

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

/**
 * Bottom Tab Navigator のパラメータ型
 */
export type TabParamList = {
  Home: undefined;
  SleepTracker: undefined;
  TaskJournal: undefined;
  Statistics: undefined;
  Settings: undefined;
};

/**
 * Stack Navigator のパラメータ型
 */
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  MainTabs: undefined;
  SleepDiary: undefined;
};

/**
 * 各画面のナビゲーションプロパティ型
 */
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

export type SleepTrackerNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'SleepTracker'>,
  StackNavigationProp<RootStackParamList>
>;

export type TaskJournalNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'TaskJournal'>,
  StackNavigationProp<RootStackParamList>
>;

export type StatisticsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Statistics'>,
  StackNavigationProp<RootStackParamList>
>;

export type SettingsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Settings'>,
  StackNavigationProp<RootStackParamList>
>;
