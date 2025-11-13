/**
 * 睡眠記録画面
 *
 * 機能:
 * - 任意日付での記録（過去7日間） ✨ v0.2追加
 * - 就寝・起床時間入力
 * - 睡眠の質選択（よく眠れた/普通/浅かった）
 * - 中途覚醒回数・入眠潜時入力
 * - 睡眠環境タグ選択
 * - 睡眠スコア自動計算・保存
 *
 * 担当: 増田さん
 * Week: 3-4, 4 (v0.2)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { getToday, formatTime } from '../utils/dateFormatter';
import { calculateSleepScore } from '../services/sleepScoreCalculator';
import { saveSleepRecord } from '../services/database';
import type { SleepTrackerNavigationProp } from '../types/navigation';

/**
 * 睡眠環境タグ一覧
 */
const ENVIRONMENT_TAGS = [
  '運動',
  'カフェインなし',
  '入浴',
  '室温適正',
  'アルコールなし',
  'スマホ制限',
  '瞑想',
  '早めの夕食',
];

export default function SleepTrackerScreen() {
  // ========================================
  // Navigation
  // ========================================
  const navigation = useNavigation<SleepTrackerNavigationProp>();

  // ========================================
  // State管理
  // ========================================

  // 記録日付（デフォルトは今日） ✨ v0.2追加
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 就寝時間（デフォルト22:00）
  const [bedtime, setBedtime] = useState(new Date(2025, 9, 30, 22, 0));
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);

  // 起床時間（デフォルト07:00）
  const [waketime, setWaketime] = useState(new Date(2025, 9, 31, 7, 0));
  const [showWaketimePicker, setShowWaketimePicker] = useState(false);

  // 睡眠の質
  const [sleepQuality, setSleepQuality] = useState<'よく眠れた' | '普通' | '浅かった'>('普通');

  // 中途覚醒回数
  const [awakenings, setAwakenings] = useState('0');

  // 入眠潜時（分）
  const [sleepLatency, setSleepLatency] = useState('15');

  // 選択された環境タグ
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 保存中フラグ
  const [isSaving, setIsSaving] = useState(false);

  // ========================================
  // イベントハンドラ
  // ========================================

  /**
   * 記録日付変更 ✨ v0.2追加
   * 過去7日間のみ選択可能
   */
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // 過去7日間かチェック
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      if (selectedDate > today) {
        Alert.alert('エラー', '未来の日付は選択できません');
        return;
      }

      if (selectedDate < sevenDaysAgo) {
        Alert.alert('エラー', '過去7日間の日付のみ選択可能です');
        return;
      }

      setRecordDate(selectedDate);
    }
  };

  /**
   * 就寝時間変更
   */
  const handleBedtimeChange = (event: any, selectedDate?: Date) => {
    setShowBedtimePicker(Platform.OS === 'ios'); // iOSは常に表示
    if (selectedDate) {
      setBedtime(selectedDate);
    }
  };

  /**
   * 起床時間変更
   */
  const handleWaketimeChange = (event: any, selectedDate?: Date) => {
    setShowWaketimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setWaketime(selectedDate);
    }
  };

  /**
   * 環境タグのトグル
   */
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  /**
   * 睡眠記録を保存
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // バリデーション
      const awakeningsNum = parseInt(awakenings, 10);
      const latencyNum = parseInt(sleepLatency, 10);

      if (isNaN(awakeningsNum) || awakeningsNum < 0) {
        Alert.alert('エラー', '中途覚醒回数は0以上の数字を入力してください');
        return;
      }

      if (isNaN(latencyNum) || latencyNum < 0) {
        Alert.alert('エラー', '入眠潜時は0以上の数字を入力してください');
        return;
      }

      // スコア計算
      const scoreResult = calculateSleepScore({
        bedtime: formatTime(bedtime),
        waketime: formatTime(waketime),
        sleep_quality: sleepQuality,
        awakenings: awakeningsNum,
        sleep_latency: latencyNum,
        tags: selectedTags,
      });

      // 選択した日付をYYYY-MM-DD形式に変換 ✨ v0.2更新
      const recordDateStr = recordDate.toISOString().split('T')[0];

      // データベースに保存
      await saveSleepRecord({
        date: recordDateStr,
        bedtime: formatTime(bedtime),
        waketime: formatTime(waketime),
        total_hours: scoreResult.totalHours,
        score: scoreResult.totalScore,
        sleep_quality: sleepQuality,
        awakenings: awakeningsNum,
        sleep_latency: latencyNum,
        tags: selectedTags,
      });

      Alert.alert(
        '保存完了',
        `睡眠スコア: ${scoreResult.totalScore}点\n記録を保存しました！`,
        [{ text: 'OK', onPress: () => console.log('Record saved') }]
      );

      console.log('✅ Sleep record saved:', scoreResult);

    } catch (error) {
      console.error('❌ Error saving sleep record:', error);
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================
  // レンダリング
  // ========================================

  // 選択した日付を日本語形式で表示
  const formatRecordDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <Text style={styles.title}>睡眠記録</Text>
        <Text style={styles.subtitle}>記録を追加</Text>

        {/* リアルタイム記録ボタン */}
        <TouchableOpacity
          style={styles.realtimeButton}
          onPress={() => navigation.navigate('SleepRecording')}
        >
          <Text style={styles.realtimeButtonEmoji}>🎤</Text>
          <View style={styles.realtimeButtonTextContainer}>
            <Text style={styles.realtimeButtonTitle}>リアルタイム睡眠記録</Text>
            <Text style={styles.realtimeButtonSubtitle}>
              いびき検出付き・自動記録
            </Text>
          </View>
          <Text style={styles.realtimeButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* アラーム設定ボタン */}
        <TouchableOpacity
          style={styles.alarmButton}
          onPress={() => navigation.navigate('AlarmSetting')}
        >
          <Text style={styles.alarmButtonEmoji}>⏰</Text>
          <View style={styles.alarmButtonTextContainer}>
            <Text style={styles.alarmButtonTitle}>アラーム設定</Text>
            <Text style={styles.alarmButtonSubtitle}>
              起床時間を設定
            </Text>
          </View>
          <Text style={styles.alarmButtonArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>手動で記録を入力</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* 記録日付選択 ✨ v0.2追加 */}
        <View style={styles.section}>
          <Text style={styles.label}>📅 記録日を選択</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatRecordDate(recordDate)}</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>※ 過去7日間の日付を選択できます</Text>
          {showDatePicker && (
            <DateTimePicker
              value={recordDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={(() => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return sevenDaysAgo;
              })()}
            />
          )}
        </View>

        {/* 就寝時間 */}
        <View style={styles.section}>
          <Text style={styles.label}>就寝時間</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowBedtimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(bedtime)}</Text>
          </TouchableOpacity>
          {showBedtimePicker && (
            <DateTimePicker
              value={bedtime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleBedtimeChange}
            />
          )}
        </View>

        {/* 起床時間 */}
        <View style={styles.section}>
          <Text style={styles.label}>起床時間</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowWaketimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(waketime)}</Text>
          </TouchableOpacity>
          {showWaketimePicker && (
            <DateTimePicker
              value={waketime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleWaketimeChange}
            />
          )}
        </View>

        {/* 睡眠の質 */}
        <View style={styles.section}>
          <Text style={styles.label}>睡眠の質</Text>
          <View style={styles.qualityContainer}>
            {(['よく眠れた', '普通', '浅かった'] as const).map(quality => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.qualityButton,
                  sleepQuality === quality && styles.qualityButtonActive,
                ]}
                onPress={() => setSleepQuality(quality)}
              >
                <Text
                  style={[
                    styles.qualityText,
                    sleepQuality === quality && styles.qualityTextActive,
                  ]}
                >
                  {quality === 'よく眠れた' && '😊 '}
                  {quality === '普通' && '😌 '}
                  {quality === '浅かった' && '😫 '}
                  {quality}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 中途覚醒回数 */}
        <View style={styles.section}>
          <Text style={styles.label}>中途覚醒回数（回）</Text>
          <TextInput
            style={styles.input}
            value={awakenings}
            onChangeText={setAwakenings}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* 入眠潜時 */}
        <View style={styles.section}>
          <Text style={styles.label}>入眠潜時（分）</Text>
          <TextInput
            style={styles.input}
            value={sleepLatency}
            onChangeText={setSleepLatency}
            keyboardType="number-pad"
            placeholder="15"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* 睡眠環境タグ */}
        <View style={styles.section}>
          <Text style={styles.label}>睡眠環境タグ（複数選択可）</Text>
          <View style={styles.tagsContainer}>
            {ENVIRONMENT_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  selectedTags.includes(tag) && styles.tagButtonActive,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 保存ボタン */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? '保存中...' : '記録を保存'}
          </Text>
        </TouchableOpacity>

        {/* 説明テキスト */}
        <Text style={styles.helpText}>
          ※ 記録を保存すると、自動的に睡眠スコアが計算されます
        </Text>
      </View>
    </ScrollView>
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
  content: {
    padding: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  dateText: {
    ...Typography.h3,
    color: Colors.accent,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  timeButton: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeText: {
    ...Typography.h2,
    color: Colors.accent,
  },
  qualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: Colors.accent,
  },
  qualityText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  qualityTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagButtonActive: {
    backgroundColor: Colors.success,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  tagTextActive: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Colors.accent,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  helpText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },

  // リアルタイム記録ボタン
  realtimeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  realtimeButtonEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  realtimeButtonTextContainer: {
    flex: 1,
  },
  realtimeButtonTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  realtimeButtonSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  realtimeButtonArrow: {
    fontSize: 24,
    color: Colors.accent,
    fontWeight: 'bold',
  },

  // アラーム設定ボタン
  alarmButton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  alarmButtonEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  alarmButtonTextContainer: {
    flex: 1,
  },
  alarmButtonTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alarmButtonSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  alarmButtonArrow: {
    fontSize: 24,
    color: Colors.accent,
    fontWeight: 'bold',
  },

  // 区切り線
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginHorizontal: 12,
  },
});
