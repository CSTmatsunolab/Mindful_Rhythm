/**
 * タスク管理画面
 *
 * 機能:
 * - タスクの追加・削除
 * - タスク完了時の感情記録（6種類の絵文字）
 * - 締め切り日設定 ✨ v0.2追加
 * - 難易度設定（1-5段階） ✨ v0.2追加
 * - 今日のタスク一覧表示
 * - 完了/未完了の切り替え
 *
 * 担当: 藤川さん
 * Week: 3-4, 4 (v0.2)
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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  // 締め切り日 ✨ v0.2追加
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  // 難易度（1-5） ✨ v0.2追加
  const [difficulty, setDifficulty] = useState<number>(3); // デフォルト: 普通

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
   * 締め切り日変更ハンドラ ✨ v0.2追加
   */
  const handleDeadlineChange = (event: any, selectedDate?: Date) => {
    setShowDeadlinePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  /**
   * タスクを追加 ✨ v0.2更新: deadline, difficulty対応
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
      // 締め切り日をYYYY-MM-DD形式に変換
      const deadlineStr = deadline ? deadline.toISOString().split('T')[0] : null;

      await addTask(trimmedText, {
        deadline: deadlineStr,
        difficulty: difficulty,
      });

      // 入力欄をクリア
      setNewTaskText('');
      setDeadline(null);
      setDifficulty(3); // デフォルトに戻す

      await loadTasks(); // 一覧を再読み込み
      console.log('✅ Task added:', trimmedText, 'deadline:', deadlineStr, 'difficulty:', difficulty);
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
      await updateTaskStatus(taskId, 'pending');
      await loadTasks();
      console.log(`✅ Task ${taskId} marked as pending`);
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
   * 難易度を表示する関数 ✨ v0.2追加
   */
  const renderDifficulty = (difficulty?: number | null) => {
    if (!difficulty) return null;
    return '⚡'.repeat(difficulty);
  };

  /**
   * 締め切り日の緊急度を判定 ✨ v0.2追加
   */
  const getDeadlineUrgency = (deadline?: string | null): 'urgent' | 'warning' | 'normal' | null => {
    if (!deadline) return null;

    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'urgent'; // 期限切れ
    if (diffDays === 0) return 'urgent'; // 今日が締め切り
    if (diffDays <= 3) return 'warning'; // 3日以内
    return 'normal';
  };

  /**
   * タスクアイテムをレンダリング ✨ v0.2更新
   */
  const renderTask = ({ item }: { item: Task }) => {
    const isDone = item.status === 'done';
    const urgency = getDeadlineUrgency(item.deadline);

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

        {/* タスク内容 */}
        <View style={styles.taskContent}>
          {/* タスクタイトル */}
          <Text
            style={[
              styles.taskText,
              isDone && styles.taskTextCompleted,
            ]}
          >
            {item.title}
          </Text>

          {/* 締め切り日と難易度 ✨ v0.2追加 */}
          <View style={styles.taskMeta}>
            {item.deadline && (
              <Text
                style={[
                  styles.deadlineText,
                  urgency === 'urgent' && styles.deadlineUrgent,
                  urgency === 'warning' && styles.deadlineWarning,
                ]}
              >
                {urgency === 'urgent' && '🔴 '}
                {urgency === 'warning' && '🟡 '}
                📅 {item.deadline}
              </Text>
            )}
            {item.difficulty && (
              <Text style={styles.difficultyText}>
                {renderDifficulty(item.difficulty)}
              </Text>
            )}
          </View>

          {/* 感情表示 */}
          {item.emotion && (
            <Text style={styles.emotionDisplay}>{item.emotion}</Text>
          )}
        </View>

        {/* 削除ボタン */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item.id, item.title)}
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

      {/* タスク追加フォーム ✨ v0.2更新 */}
      <ScrollView style={styles.inputSection} horizontal={false}>
        {/* タスク名入力 */}
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

        {/* 締め切り日と難易度 */}
        <View style={styles.taskOptionsRow}>
          {/* 締め切り日選択 */}
          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>📅 締め切り</Text>
            <TouchableOpacity
              style={styles.dateSelectButton}
              onPress={() => setShowDeadlinePicker(true)}
            >
              <Text style={styles.dateSelectText}>
                {deadline
                  ? deadline.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
                  : 'なし'}
              </Text>
            </TouchableOpacity>
            {deadline && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setDeadline(null)}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 難易度選択 */}
          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>⚡ 難易度</Text>
            <View style={styles.difficultyButtons}>
              {[1, 2, 3, 4, 5].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty === level && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      difficulty === level && styles.difficultyButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 追加ボタン */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>タスクを追加</Text>
        </TouchableOpacity>

        {/* DateTimePicker */}
        {showDeadlinePicker && (
          <DateTimePicker
            value={deadline || new Date()}
            mode="date"
            display="default"
            onChange={handleDeadlineChange}
            minimumDate={new Date()}
          />
        )}
      </ScrollView>

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
    paddingHorizontal: 20,
    paddingBottom: 16,
    maxHeight: 280,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  taskOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  optionItem: {
    flex: 1,
  },
  optionLabel: {
    ...Typography.caption,
    color: Colors.text,
    marginBottom: 6,
    fontWeight: '600',
  },
  dateSelectButton: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateSelectText: {
    ...Typography.body,
    color: Colors.text,
    fontSize: 14,
  },
  clearButton: {
    position: 'absolute',
    top: 28,
    right: 8,
    backgroundColor: Colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  difficultyButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  difficultyButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  difficultyButtonTextActive: {
    color: Colors.primary,
  },
  addButton: {
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  },
  taskText: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: 4,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  deadlineText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  deadlineUrgent: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  deadlineWarning: {
    color: '#FFA500',
    fontWeight: '600',
  },
  difficultyText: {
    ...Typography.caption,
    color: Colors.accent,
    fontSize: 12,
  },
  emotionDisplay: {
    fontSize: 24,
    marginTop: 4,
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
