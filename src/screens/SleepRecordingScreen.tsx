/**
 * 睡眠記録画面
 *
 * 機能:
 * - 睡眠記録の開始・停止（START/STOPボタン）
 * - リアルタイム経過時間表示
 * - いびき検出状況表示
 * - 記録結果の保存
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useSleepRecording } from '../contexts/SleepRecordingContext';
import { saveSleepRecord } from '../services/database';

/**
 * 経過時間を HH:MM:SS 形式でフォーマット
 */
function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 睡眠記録画面
 */
export default function SleepRecordingScreen() {
  const {
    isRecording,
    recordingStartTime,
    elapsedSeconds,
    snoringCount,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  } = useSleepRecording();

  const [isSaving, setIsSaving] = useState(false);

  /**
   * 記録開始ボタンを押した時
   */
  const handleStartRecording = async () => {
    try {
      await startRecording();
      Alert.alert(
        '睡眠記録開始',
        'いびきの検出を開始しました。\nおやすみなさい 😴'
      );
    } catch (err) {
      Alert.alert(
        'エラー',
        err instanceof Error ? err.message : '記録の開始に失敗しました'
      );
    }
  };

  /**
   * 記録停止ボタンを押した時
   */
  const handleStopRecording = async () => {
    try {
      setIsSaving(true);

      // 記録を停止して結果を取得
      const result = await stopRecording();

      // データベースに保存
      const date = result.startTime.toISOString().split('T')[0];
      const bedtime = result.startTime.toTimeString().slice(0, 5);
      const waketime = result.endTime.toTimeString().slice(0, 5);

      await saveSleepRecord({
        date,
        bedtime,
        waketime,
        total_hours: result.durationHours,
        recording_start_time: Math.floor(result.startTime.getTime() / 1000),
        recording_end_time: Math.floor(result.endTime.getTime() / 1000),
        recording_status: 'completed',
        snoring_count: result.snoringStats.totalEvents,
        snoring_duration_minutes: result.snoringStats.totalDurationMinutes,
        snoring_average_volume: result.snoringStats.averageVolume,
      });

      // 完了メッセージ
      Alert.alert(
        '記録完了',
        `睡眠時間: ${result.durationHours.toFixed(1)}時間\nいびき: ${result.snoringStats.totalEvents}回\n\nおはようございます！ ☀️`,
        [
          {
            text: 'OK',
            onPress: () => {
              // ホーム画面に戻る（navigation.goBack() が必要）
            },
          },
        ]
      );

    } catch (err) {
      Alert.alert(
        'エラー',
        err instanceof Error ? err.message : '記録の保存に失敗しました'
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * キャンセルボタンを押した時
   */
  const handleCancelRecording = () => {
    Alert.alert(
      '記録をキャンセル',
      '記録を中止してもよろしいですか？\nこれまでのデータは保存されません。',
      [
        { text: 'いいえ', style: 'cancel' },
        {
          text: 'はい',
          style: 'destructive',
          onPress: async () => {
            await cancelRecording();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* タイトル */}
        <Text style={styles.title}>睡眠記録</Text>

        {/* 記録状態表示 */}
        {!isRecording ? (
          <View style={styles.idleContainer}>
            <Text style={styles.statusEmoji}>🌙</Text>
            <Text style={styles.statusText}>睡眠記録を開始してください</Text>
            <Text style={styles.statusDescription}>
              いびきを自動検出します
            </Text>
          </View>
        ) : (
          <View style={styles.recordingContainer}>
            {/* 経過時間 */}
            <Text style={styles.timerLabel}>経過時間</Text>
            <Text style={styles.timerValue}>{formatElapsedTime(elapsedSeconds)}</Text>

            {/* いびき検出状況 */}
            <View style={styles.snoringIndicator}>
              <Text style={styles.snoringLabel}>いびき検出</Text>
              <View style={styles.snoringCountBox}>
                <Text style={styles.snoringEmoji}>💤</Text>
                <Text style={styles.snoringCount}>{snoringCount}回</Text>
              </View>
            </View>

            {/* 記録開始時刻 */}
            {recordingStartTime && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>開始時刻</Text>
                <Text style={styles.infoValue}>
                  {recordingStartTime.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* エラー表示 */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ボタン */}
        <View style={styles.buttonContainer}>
          {!isRecording ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStartRecording}
            >
              <Text style={styles.buttonText}>😴 睡眠開始</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.stopButton, { marginBottom: 12 }]}
                onPress={handleStopRecording}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>☀️ 起床</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelRecording}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 説明 */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>💡 使い方</Text>
          <Text style={styles.descriptionText}>
            1. 「睡眠開始」ボタンを押してください{'\n'}
            2. 就寝してください（アプリは開いたままで大丈夫です）{'\n'}
            3. 起床したら「起床」ボタンを押してください{'\n'}
            4. 自動的にいびきが検出され、記録されます
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },

  // 待機状態
  idleContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  statusEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  statusText: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 10,
  },
  statusDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // 記録中状態
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  timerLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  timerValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 30,
  },

  // いびき検出インジケータ
  snoringIndicator: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  snoringLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  snoringCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snoringEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  snoringCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },

  // 情報ボックス
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  infoValue: {
    ...Typography.h3,
    color: Colors.text,
  },

  // エラーボックス
  errorBox: {
    backgroundColor: '#FF3B3030',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  errorText: {
    ...Typography.body,
    color: '#FF6B6B',
    textAlign: 'center',
  },

  // ボタン
  buttonContainer: {
    marginTop: 40,
  },
  button: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  startButton: {
    backgroundColor: Colors.primary,
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButtonText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // 説明ボックス
  descriptionBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 40,
  },
  descriptionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});
