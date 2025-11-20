import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { HomeScreenNavigationProp } from '../types/navigation';
import { getLatestSleepRecord, getTodayTasks, getUserProgress } from '../services/database';
import type { SleepRecord, Task, UserProgress } from '../types/database';
import { getSleepinImageFileName } from '../constants/SleepinPrompts';
import { getImageKeyFromFileName, getSleepinImageUriSync } from '../constants/SleepinImages';
import { isImageGenerated } from '../services/sleepinImageGenerator';

interface Props {
  navigation: HomeScreenNavigationProp;
}

/**
 * ホーム画面
 * - 睡眠スコア表示（円形ゲージ）✅ DB連携済み
 * - 今日の気分
 * - キャラクター「スリーピン」✅ スコアに応じた表情変化
 * - 今日のタスク一覧 ✅ DB連携済み
 */
export default function HomeScreen({ navigation }: Props) {
  const [sleepRecord, setSleepRecord] = useState<SleepRecord | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [sleepinImageUri, setSleepinImageUri] = useState<string | null>(null);

  // アニメーション用
  const sizeAnim = useRef(new Animated.Value(80)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const todayDate = new Date().toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  /**
   * データを取得する関数
   */
  const loadData = async () => {
    try {
      setLoading(true);

      // 最新の睡眠記録を取得
      const latestSleep = await getLatestSleepRecord();
      setSleepRecord(latestSleep);

      // 今日のタスクを取得
      const todayTasks = await getTodayTasks();
      setTasks(todayTasks);

      // ユーザー進捗を取得
      const progress = await getUserProgress();
      setUserProgress(progress);

      // スリーピン画像URIを取得
      const fileName = getSleepinImageFileName(
        latestSleep?.score,
        progress?.total_growth_points || 0
      );
      const imageKey = getImageKeyFromFileName(fileName);
      const imageExists = await isImageGenerated(fileName);

      if (imageExists) {
        const uri = getSleepinImageUriSync(imageKey);
        setSleepinImageUri(uri);
      } else {
        setSleepinImageUri(null);
      }
    } catch (error) {
      console.error('❌ Failed to load home screen data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初回マウント時にデータを取得
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 画面にフォーカスが当たるたびにデータを再取得
   * （他の画面でデータが更新された場合に反映）
   */
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  /**
   * スリーピンサイズが変更されたときにアニメーション実行
   */
  useEffect(() => {
    if (userProgress) {
      // サイズアニメーション
      Animated.spring(sizeAnim, {
        toValue: userProgress.sleepin_size,
        friction: 3,
        tension: 40,
        useNativeDriver: false,
      }).start();

      // 成長時のパルスアニメーション
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 3,
          tension: 40,
          useNativeDriver: false, // fontSizeと一緒に使うためfalseに変更
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: false, // fontSizeと一緒に使うためfalseに変更
        }),
      ]).start();
    }
  }, [userProgress?.sleepin_size]);

  /**
   * 睡眠スコアに基づいてキャラクターの表情を決定
   */
  const getCharacterEmoji = (): string => {
    if (!sleepRecord) return '😴'; // データなし

    const score = sleepRecord.score;
    if (score >= 90) return '😊'; // 優秀
    if (score >= 80) return '🙂'; // 良好
    if (score >= 70) return '😐'; // 普通
    if (score >= 60) return '😟'; // やや低い
    return '😫'; // 要改善
  };

  /**
   * 睡眠スコアに基づいてラベルを決定
   */
  const getScoreLabel = (): string => {
    if (!sleepRecord) return 'データがありません';

    const score = sleepRecord.score;
    if (score >= 90) return 'とても良い睡眠です！';
    if (score >= 80) return '良好な睡眠です';
    if (score >= 70) return 'まずまずの睡眠です';
    if (score >= 60) return '睡眠を改善しましょう';
    return '睡眠の質を見直しましょう';
  };

  /**
   * タスクの完了進捗を計算
   */
  const getTaskProgress = () => {
    if (tasks.length === 0) return { completed: 0, total: 0 };

    const completed = tasks.filter(task => task.status === 'done').length;
    return { completed, total: tasks.length };
  };

  const sleepScore = sleepRecord?.score || 0;
  const { completed, total } = getTaskProgress();

  // ローディング中の表示
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

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
          {sleepinImageUri ? (
            // ローカルストレージから画像を表示
            <Animated.Image
              source={{ uri: sleepinImageUri }}
              style={[
                styles.characterImage,
                {
                  width: sizeAnim,
                  height: sizeAnim,
                  transform: [{ scale: scaleAnim }],
                }
              ]}
              resizeMode="contain"
            />
          ) : (
            // フォールバック：絵文字表示
            <Animated.Text style={[
              styles.characterEmoji,
              {
                fontSize: sizeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}>
              {getCharacterEmoji()}
            </Animated.Text>
          )}
          <Text style={styles.characterName}>スリーピン</Text>
          {userProgress && (
            <View style={styles.progressInfo}>
              <Text style={styles.levelText}>Lv.{userProgress.level}</Text>
              <Text style={styles.pointsText}>{userProgress.total_growth_points}pt</Text>
            </View>
          )}
          {sleepRecord && (
            <Text style={styles.characterScore}>睡眠スコア: {sleepScore}点</Text>
          )}
        </View>
      </View>

      {/* Sleep Score Card */}
      <TouchableOpacity
        style={styles.scoreCard}
        onPress={() => navigation.navigate('SleepTracker')}
        accessibilityLabel="睡眠スコアカード。タップして睡眠記録画面へ"
      >
        <Text style={styles.scoreTitle}>昨日の睡眠スコア</Text>
        {sleepRecord ? (
          <>
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
                    { backgroundColor: i < Math.floor((sleepScore / 100) * 7) ? Colors.accent : Colors.border },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.scoreLabel}>{getScoreLabel()}</Text>
            <Text style={styles.scoreDetail}>
              睡眠時間: {sleepRecord.total_hours.toFixed(1)}時間
            </Text>
          </>
        ) : (
          <Text style={styles.noDataText}>まだ睡眠記録がありません{'\n'}記録を追加しましょう</Text>
        )}
      </TouchableOpacity>

      {/* Today's Tasks Section */}
      <View style={styles.tasksSection}>
        <View style={styles.tasksSectionHeader}>
          <Text style={styles.tasksTitle}>今日のタスク</Text>
          <Text style={styles.tasksProgress}>{completed}/{total} 完了</Text>
        </View>

        {/* Task Items */}
        {tasks.length > 0 ? (
          <>
            {tasks.slice(0, 3).map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={[
                  styles.taskCheckbox,
                  task.status === 'done' ? {} : styles.taskCheckboxEmpty
                ]}>
                  {task.status === 'done' && (
                    <Text style={styles.taskCheckMark}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.taskText,
                  task.status === 'done' && styles.taskTextCompleted
                ]}>
                  {task.title}
                </Text>
                {task.emotion && (
                  <Text style={styles.taskEmoji}>{task.emotion}</Text>
                )}
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noDataText}>今日のタスクはまだありません</Text>
        )}

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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  noDataText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 20,
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
  characterImage: {
    marginBottom: 8,
  },
  characterName: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  characterScore: {
    ...Typography.caption,
    color: Colors.accent,
    marginTop: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
  levelText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 14,
  },
  pointsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 14,
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
  scoreDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 8,
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
