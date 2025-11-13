/**
 * アラーム設定画面
 *
 * 機能:
 * - アラーム一覧表示
 * - アラームの追加・編集・削除
 * - アラームのON/OFF切り替え
 * - 繰り返し設定（曜日選択）
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Alarm } from '../types/database';
import {
  getAlarms,
  saveAlarm,
  deleteAlarm,
  toggleAlarm,
} from '../services/database';
import {
  scheduleAlarm,
  cancelAlarm,
} from '../services/notificationService';

type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const WEEKDAY_LABELS: Record<WeekDay, string> = {
  mon: '月',
  tue: '火',
  wed: '水',
  thu: '木',
  fri: '金',
  sat: '土',
  sun: '日',
};

export default function AlarmSettingScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  // 新規アラーム設定
  const [newAlarmTime, setNewAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    try {
      const loadedAlarms = await getAlarms();
      setAlarms(loadedAlarms);
    } catch (error) {
      console.error('Failed to load alarms:', error);
    }
  };

  const handleToggleAlarm = async (id: number, enabled: boolean) => {
    try {
      await toggleAlarm(id, enabled);

      // 通知の更新
      const alarm = alarms.find(a => a.id === id);
      if (alarm) {
        if (enabled) {
          // 通知をスケジュール
          const notificationId = await scheduleAlarm({
            time: alarm.alarm_time,
            label: alarm.label,
            repeatDays: alarm.repeat_days as WeekDay[] | undefined,
            soundFile: alarm.sound,
            snoozeEnabled: alarm.snooze_enabled,
            snoozeMinutes: alarm.snooze_minutes,
          });

          // notification_idを保存
          await saveAlarm({ ...alarm, notification_id: notificationId });
        } else {
          // 通知をキャンセル
          if (alarm.notification_id) {
            await cancelAlarm(alarm.notification_id);
          }
        }
      }

      await loadAlarms();
    } catch (error) {
      console.error('Failed to toggle alarm:', error);
      Alert.alert('エラー', 'アラームの切り替えに失敗しました');
    }
  };

  const handleDeleteAlarm = async (id: number) => {
    Alert.alert(
      'アラームを削除',
      '本当に削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const alarm = alarms.find(a => a.id === id);
              if (alarm?.notification_id) {
                await cancelAlarm(alarm.notification_id);
              }
              await deleteAlarm(id);
              await loadAlarms();
            } catch (error) {
              console.error('Failed to delete alarm:', error);
              Alert.alert('エラー', 'アラームの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const handleSaveNewAlarm = async () => {
    try {
      const timeStr = `${newAlarmTime.getHours().toString().padStart(2, '0')}:${newAlarmTime.getMinutes().toString().padStart(2, '0')}`;

      // 通知をスケジュール
      const notificationId = await scheduleAlarm({
        time: timeStr,
        label: '起床アラーム',
        repeatDays: selectedDays.length > 0 ? selectedDays : undefined,
      });

      // データベースに保存
      await saveAlarm({
        alarm_time: timeStr,
        enabled: true,
        repeat_days: selectedDays.length > 0 ? selectedDays : undefined,
        label: '起床アラーム',
        notification_id: notificationId,
      });

      setIsAdding(false);
      setSelectedDays([]);
      await loadAlarms();

      Alert.alert('成功', 'アラームを設定しました');
    } catch (error) {
      console.error('Failed to save alarm:', error);
      Alert.alert('エラー', 'アラームの保存に失敗しました');
    }
  };

  const toggleWeekday = (day: WeekDay) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewAlarmTime(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>アラーム設定</Text>

        {/* アラーム一覧 */}
        {alarms.length === 0 && !isAdding ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⏰</Text>
            <Text style={styles.emptyText}>アラームが設定されていません</Text>
          </View>
        ) : (
          alarms.map(alarm => (
            <View key={alarm.id} style={styles.alarmCard}>
              <View style={styles.alarmHeader}>
                <Text style={styles.alarmTime}>{alarm.alarm_time}</Text>
                <Switch
                  value={alarm.enabled}
                  onValueChange={(value) => handleToggleAlarm(alarm.id, value)}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor={alarm.enabled ? Colors.primary : '#f4f3f4'}
                />
              </View>

              {alarm.label && (
                <Text style={styles.alarmLabel}>{alarm.label}</Text>
              )}

              {alarm.repeat_days && alarm.repeat_days.length > 0 ? (
                <View style={styles.repeatDaysContainer}>
                  {(Object.keys(WEEKDAY_LABELS) as WeekDay[]).map(day => (
                    <View
                      key={day}
                      style={[
                        styles.dayBadge,
                        alarm.repeat_days?.includes(day) && styles.dayBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          alarm.repeat_days?.includes(day) && styles.dayTextActive,
                        ]}
                      >
                        {WEEKDAY_LABELS[day]}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.onceText}>1回のみ</Text>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAlarm(alarm.id)}
              >
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* 新規アラーム追加 */}
        {isAdding ? (
          <View style={styles.addAlarmCard}>
            <Text style={styles.addAlarmTitle}>新しいアラーム</Text>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                {`${newAlarmTime.getHours().toString().padStart(2, '0')}:${newAlarmTime.getMinutes().toString().padStart(2, '0')}`}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={newAlarmTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <Text style={styles.repeatLabel}>繰り返し</Text>
            <View style={styles.weekdaySelector}>
              {(Object.keys(WEEKDAY_LABELS) as WeekDay[]).map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.weekdayButton,
                    selectedDays.includes(day) && styles.weekdayButtonActive,
                  ]}
                  onPress={() => toggleWeekday(day)}
                >
                  <Text
                    style={[
                      styles.weekdayButtonText,
                      selectedDays.includes(day) && styles.weekdayButtonTextActive,
                    ]}
                  >
                    {WEEKDAY_LABELS[day]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.addAlarmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsAdding(false);
                  setSelectedDays([]);
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveNewAlarm}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
          >
            <Text style={styles.addButtonText}>+ アラームを追加</Text>
          </TouchableOpacity>
        )}
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
    marginBottom: 24,
  },

  // 空の状態
  emptyContainer: {
    alignItems: 'center',
    marginVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // アラームカード
  alarmCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alarmTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  alarmLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  repeatDaysContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dayBadgeActive: {
    backgroundColor: Colors.accent,
  },
  dayText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  dayTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  onceText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  deleteButtonText: {
    ...Typography.caption,
    color: '#FF6B6B',
  },

  // 新規追加
  addAlarmCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  addAlarmTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  timeButton: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  timeButtonText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  repeatLabel: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 12,
  },
  weekdaySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  weekdayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayButtonActive: {
    backgroundColor: Colors.accent,
  },
  weekdayButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  weekdayButtonTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  addAlarmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: Colors.accent,
  },
  saveButtonText: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
  },

  // 追加ボタン
  addButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    ...Typography.h3,
    color: Colors.accent,
    fontWeight: 'bold',
  },
});
