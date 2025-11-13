/**
 * 通知・アラームサービス
 *
 * 機能: expo-notifications を使用してアラーム機能を提供
 * - アラームのスケジュール
 * - 通知権限の管理
 * - スヌーズ機能
 * - 繰り返し設定
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * 曜日の型定義
 */
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/**
 * アラーム設定
 */
export interface AlarmConfig {
  time: string;                // HH:MM
  label?: string;              // アラームラベル
  repeatDays?: WeekDay[];      // 繰り返し曜日
  soundFile?: string;          // 音源ファイル名
  snoozeEnabled?: boolean;     // スヌーズ有効
  snoozeMinutes?: number;      // スヌーズ時間（分）
}

/**
 * 通知ハンドラーを設定（アプリがフォアグラウンドにある時の動作）
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 通知サービスの初期化
 * Android 8.0+ では通知チャンネルが必要
 */
export async function initializeNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    // アラーム用チャンネル
    await Notifications.setNotificationChannelAsync('alarms', {
      name: '起床アラーム',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      enableLights: true,
      lightColor: '#6366F1',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true, // Do Not Disturb をバイパス
    });

    // リマインダー用チャンネル
    await Notifications.setNotificationChannelAsync('reminders', {
      name: '就寝リマインダー',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });

    console.log('✅ Notification channels initialized (Android)');
  }
}

/**
 * 通知権限をリクエスト
 * @returns 権限が許可されたかどうか
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // シミュレータでは通知が動作しない
  if (!Device.isDevice) {
    console.warn('⚠️ Notifications only work on physical devices');
    return false;
  }

  try {
    // 現在の権限状態を確認
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 権限が付与されていない場合、リクエスト
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return false;
    }

    console.log('✅ Notification permission granted');
    return true;

  } catch (error) {
    console.error('❌ Failed to request notification permissions:', error);
    return false;
  }
}

/**
 * アラームをスケジュール
 * @param config アラーム設定
 * @returns 通知ID
 */
export async function scheduleAlarm(config: AlarmConfig): Promise<string> {
  try {
    // 時刻をパース（HH:MM）
    const [hours, minutes] = config.time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format. Use HH:MM (e.g., "07:00")');
    }

    // 次のトリガー時刻を計算
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hours, minutes, 0, 0);

    // もし設定時刻が既に過ぎていたら、翌日に設定
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1);
    }

    // 通知をスケジュール
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ 起床時間です',
        body: config.label || 'おはようございます！',
        sound: config.soundFile || 'default',
        data: {
          type: 'alarm',
          alarmConfig: config,
        },
        categoryIdentifier: 'alarm',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        channelId: 'alarms',
        date: trigger,
        repeats: config.repeatDays && config.repeatDays.length > 0,
      },
    });

    console.log('✅ Alarm scheduled:', notificationId);
    console.log('   Time:', config.time);
    console.log('   Next trigger:', trigger.toLocaleString('ja-JP'));
    console.log('   Repeats:', config.repeatDays ? config.repeatDays.join(',') : 'No');

    return notificationId;

  } catch (error) {
    console.error('❌ Failed to schedule alarm:', error);
    throw error;
  }
}

/**
 * アラームをキャンセル
 * @param notificationId 通知ID
 */
export async function cancelAlarm(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('✅ Alarm cancelled:', notificationId);
  } catch (error) {
    console.error('❌ Failed to cancel alarm:', error);
    throw error;
  }
}

/**
 * 全てのアラームをキャンセル
 */
export async function cancelAllAlarms(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All alarms cancelled');
  } catch (error) {
    console.error('❌ Failed to cancel all alarms:', error);
    throw error;
  }
}

/**
 * スケジュール済みの通知一覧を取得
 */
export async function getScheduledAlarms(): Promise<Notifications.NotificationRequest[]> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled;
  } catch (error) {
    console.error('❌ Failed to get scheduled alarms:', error);
    return [];
  }
}

/**
 * スヌーズ機能（指定分後に再通知）
 * @param minutes スヌーズ時間（分）
 * @param originalConfig 元のアラーム設定
 */
export async function snoozeAlarm(
  minutes: number,
  originalConfig: AlarmConfig
): Promise<string> {
  try {
    const trigger = new Date();
    trigger.setMinutes(trigger.getMinutes() + minutes);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ スヌーズアラーム',
        body: originalConfig.label || 'もう一度起床時間です',
        sound: originalConfig.soundFile || 'default',
        data: {
          type: 'snooze',
          originalConfig,
        },
      },
      trigger: {
        channelId: 'alarms',
        date: trigger,
      },
    });

    console.log(`✅ Snoozed for ${minutes} minutes:`, notificationId);
    return notificationId;

  } catch (error) {
    console.error('❌ Failed to snooze alarm:', error);
    throw error;
  }
}

/**
 * 就寝リマインダーをスケジュール
 * @param bedtime 就寝時刻（HH:MM）
 * @param minutesBefore 何分前に通知するか
 */
export async function scheduleBedtimeReminder(
  bedtime: string,
  minutesBefore: number = 30
): Promise<string> {
  try {
    const [hours, minutes] = bedtime.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error('Invalid bedtime format');
    }

    // リマインダー時刻を計算
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

    // 既に過ぎていたら翌日
    const now = new Date();
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 就寝時間が近づいています',
        body: `${minutesBefore}分後に就寝時刻です。準備を始めましょう。`,
        sound: 'default',
        data: {
          type: 'bedtime_reminder',
          bedtime,
        },
      },
      trigger: {
        channelId: 'reminders',
        date: reminderTime,
        repeats: true, // 毎日繰り返す
      },
    });

    console.log('✅ Bedtime reminder scheduled:', notificationId);
    return notificationId;

  } catch (error) {
    console.error('❌ Failed to schedule bedtime reminder:', error);
    throw error;
  }
}

/**
 * アラーム応答リスナーを設定
 * @param onDismiss アラームを解除した時のコールバック
 * @param onSnooze スヌーズボタンを押した時のコールバック
 */
export function setupAlarmResponseListener(
  onDismiss?: (notification: Notifications.Notification) => void,
  onSnooze?: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const { actionIdentifier, notification } = response;
    const { type } = notification.request.content.data as any;

    if (type === 'alarm' || type === 'snooze') {
      if (actionIdentifier === 'snooze' && onSnooze) {
        onSnooze(notification);
      } else if (onDismiss) {
        onDismiss(notification);
      }
    }
  });
}

/**
 * 通知をすぐに表示（テスト用）
 */
export async function showTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'テスト通知',
      body: '通知が正常に動作しています',
      data: { type: 'test' },
    },
    trigger: null, // すぐに表示
  });
}
