/**
 * タスク管理画面
 *
 * 機能:
 * - タスクの追加・削除
 * - タスク完了時の感情記録（6種類の絵文字）
 * - 今日のタスク一覧表示
 * - 完了/未完了の切り替え
 *
 * 担当: 藤川さん
 * Week: 3-4
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { getToday } from '../utils/dateFormatter';
import {
  addTask,
  getTasksByDate,
  updateTaskStatus,
  deleteTask,
} from '../services/database';
import { Task } from '../types/database';
import EmotionPicker from '../components/EmotionPicker';

export default function TaskJournalScreen() {
  // ========================================
  // State管理
  // ========================================

  // タスク一覧
  const [tasks, setTasks] = useState<Task[]>([]);

  // 新規タスク入力
  const [newTaskText, setNewTaskText] = useState('');

  // 感情選択モーダル
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // 読み込み中フラグ
  const [isLoading, setIsLoading] = useState(true);

  // ========================================
  // 初期化・データ読み込み
  // ========================================

  useEffect(() => {
    loadTasks();
  }, []);

  /**
   * 今日のタスク一覧を読み込み
   */
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const today = getToday();
      const todayTasks = await getTasksByDate(today);
      setTasks(todayTasks);
      console.log(`✅ Loaded ${todayTasks.length} tasks for ${today}`);
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      Alert.alert('エラー', 'タスクの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // イベントハンドラ
  // ========================================

  /**
   * タスクを追加
   */
  const handleAddTask = async () => {
    const trimmedText = newTaskText.trim();

    // バリデーション
    if (trimmedText.length === 0) {
      Alert.alert('エラー', 'タスクを入力してください');
      return;
    }

    if (trimmedText.length > 200) {
      Alert.alert('エラー', 'タスクは200文字以内で入力してください');
      return;
    }

    try {
      await addTask(trimmedText);
      setNewTaskText(''); // 入力欄をクリア
      await loadTasks(); // 一覧を再読み込み
      console.log('✅ Task added:', trimmedText);
    } catch (error) {
      console.error('❌ Error adding task:', error);
      Alert.alert('エラー', 'タスクの追加に失敗しました');
    }
  };

  /**
   * タスクを完了する（感情選択モーダルを表示）
   */
  const handleCompleteTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setShowEmotionPicker(true);
  };

  /**
   * 感情を選択してタスクを完了
   */
  const handleEmotionSelect = async (emotion: string) => {
    if (selectedTaskId === null) return;

    try {
      await updateTaskStatus(selectedTaskId, 'done', emotion);
      await loadTasks();
      console.log(`✅ Task ${selectedTaskId} completed with emotion: ${emotion}`);
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      Alert.alert('エラー', 'タスクの更新に失敗しました');
    } finally {
      setSelectedTaskId(null);
    }
  };

  /**
   * タスクを未完了に戻す
   */
  const handleUndoTask = async (taskId: number) => {
    try {
      await updateTaskStatus(taskId, 'todo');
      await loadTasks();
      console.log(`✅ Task ${taskId} marked as todo`);
    } catch (error) {
      console.error('❌ Error undoing task:', error);
      Alert.alert('エラー', 'タスクの更新に失敗しました');
    }
  };

  /**
   * タスクを削除
   */
  const handleDeleteTask = (taskId: number, taskText: string) => {
    Alert.alert(
      'タスク削除',
      `「${taskText}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              await loadTasks();
              console.log(`✅ Task ${taskId} deleted`);
            } catch (error) {
              console.error('❌ Error deleting task:', error);
              Alert.alert('エラー', 'タスクの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  // ========================================
  // レンダリング関数
  // ========================================

  /**
   * タスクアイテムをレンダリング
   */
  const renderTask = ({ item }: { item: Task }) => {
    const isDone = item.status === 'done';

    return (
      <View style={styles.taskItem}>
        {/* チェックボックス */}
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => {
            if (isDone) {
              handleUndoTask(item.id);
            } else {
              handleCompleteTask(item.id);
            }
          }}
        >
          <View style={[styles.checkboxInner, isDone && styles.checkboxChecked]}>
            {isDone && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        {/* タスクテキスト */}
        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskText,
              isDone && styles.taskTextCompleted,
              item.is_daily_mission && styles.taskTextMission,
            ]}
          >
            {item.is_daily_mission && '🎯 '}
            {item.task}
          </Text>

          {/* 感情表示 */}
          {item.emotion && (
            <Text style={styles.emotionDisplay}>{item.emotion}</Text>
          )}
        </View>

        {/* 削除ボタン */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item.id, item.task)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ========================================
  // メインレンダリング
  // ========================================

  // 統計情報
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>タスク管理</Text>
        <Text style={styles.subtitle}>{getToday()}</Text>

        {/* 進捗表示 */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            完了: {completedTasks} / {totalTasks} ({completionRate}%)
          </Text>
        </View>
      </View>

      {/* タスク追加フォーム */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="新しいタスクを入力..."
          placeholderTextColor={Colors.textSecondary}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
          maxLength={200}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>追加</Text>
        </TouchableOpacity>
      </View>

      {/* タスク一覧 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyText}>タスクがありません</Text>
          <Text style={styles.emptySubtext}>上のフォームからタスクを追加しましょう</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 感情選択モーダル */}
      <EmotionPicker
        visible={showEmotionPicker}
        onSelect={handleEmotionSelect}
        onClose={() => setShowEmotionPicker(false)}
      />
    </View>
  );
}

// ========================================
// スタイル
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  statsText: {
    ...Typography.body,
    color: Colors.accent,
    textAlign: 'center',
  },
  inputSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
    opacity: 0.6,
  },
  taskTextMission: {
    fontWeight: 'bold',
  },
  emotionDisplay: {
    fontSize: 24,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
