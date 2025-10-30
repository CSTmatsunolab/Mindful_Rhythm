import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { HomeScreenNavigationProp } from '../types/navigation';

interface Props {
  navigation: HomeScreenNavigationProp;
}

/**
 * ホーム画面
 * - 睡眠スコア表示（円形ゲージ）
 * - 今日の気分
 * - キャラクター「スリーピン」
 * - 今日のタスク一覧
 */
export default function HomeScreen({ navigation }: Props) {
  // TODO: データベースから最新の睡眠スコアを取得
  const sleepScore = 82; // モック値
  const todayDate = new Date().toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>おはよう！</Text>
        <Text style={styles.date}>{todayDate}</Text>
      </View>

      {/* Character Section */}
      <View style={styles.characterSection}>
        <View style={styles.characterContainer}>
          <Text style={styles.characterEmoji}>😊</Text>
          <Text style={styles.characterName}>スリーピン</Text>
        </View>
      </View>

      {/* Sleep Score Card */}
      <TouchableOpacity
        style={styles.scoreCard}
        onPress={() => navigation.navigate('SleepTracker')}
        accessibilityLabel="睡眠スコアカード。タップして睡眠記録画面へ"
      >
        <Text style={styles.scoreTitle}>今日の睡眠スコア</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{sleepScore}</Text>
          <Text style={styles.scoreUnit}>点</Text>
        </View>
        <View style={styles.scoreBar}>
          {[...Array(7)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.scoreBarItem,
                { backgroundColor: i < 5 ? Colors.accent : Colors.border },
              ]}
            />
          ))}
        </View>
        <Text style={styles.scoreLabel}>とても良い睡眠です！</Text>
      </TouchableOpacity>

      {/* Today's Tasks Section */}
      <View style={styles.tasksSection}>
        <View style={styles.tasksSectionHeader}>
          <Text style={styles.tasksTitle}>今日のタスク</Text>
          <Text style={styles.tasksProgress}>2/5 完了</Text>
        </View>

        {/* Task Items */}
        <View style={styles.taskItem}>
          <View style={styles.taskCheckbox}>
            <Text style={styles.taskCheckMark}>✓</Text>
          </View>
          <Text style={[styles.taskText, styles.taskTextCompleted]}>
            寝る1時間前はスマホ禁止
          </Text>
          <Text style={styles.taskEmoji}>😌</Text>
        </View>

        <View style={styles.taskItem}>
          <View style={[styles.taskCheckbox, styles.taskCheckboxEmpty]} />
          <Text style={styles.taskText}>15時以降カフェイン禁止</Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('TaskJournal')}
        >
          <Text style={styles.viewAllButtonText}>すべて見る →</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('SleepTracker')}
        >
          <Text style={styles.quickActionEmoji}>😴</Text>
          <Text style={styles.quickActionText}>睡眠記録</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={styles.quickActionEmoji}>📊</Text>
          <Text style={styles.quickActionText}>グラフ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  characterSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  characterContainer: {
    alignItems: 'center',
  },
  characterEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  characterName: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  scoreCard: {
    backgroundColor: Colors.surface,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.accent,
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.accent,
  },
  scoreUnit: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  scoreBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  scoreBarItem: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  scoreLabel: {
    ...Typography.body,
    color: Colors.success,
  },
  tasksSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tasksTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  tasksProgress: {
    ...Typography.body,
    color: Colors.accent,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskCheckboxEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  taskCheckMark: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  taskText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  taskEmoji: {
    fontSize: 20,
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllButtonText: {
    ...Typography.button,
    color: Colors.accent,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  quickActionButton: {
    backgroundColor: Colors.surface,
    width: 120,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    ...Typography.body,
    color: Colors.text,
  },
});
