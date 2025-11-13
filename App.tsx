import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { openDatabase } from './src/services/database';
import { migrateDatabase } from './scripts/migrateDatabase_v0.2';
import { SleepRecordingProvider } from './src/contexts/SleepRecordingContext';
import { initializeNotifications, requestNotificationPermissions } from './src/services/notificationService';

/**
 * Mindful Rhythm - メインアプリエントリーポイント
 *
 * 睡眠・感情・行動の相関分析と改善支援アプリ
 * CBT-I（認知行動療法）理論に基づく睡眠スコアアルゴリズム
 */
export default function App() {
  // データベース・通知初期化（アプリ起動時に1回だけ実行）
  useEffect(() => {
    const initApp = async () => {
      try {
        // データベース初期化
        await openDatabase();
        console.log('✅ Database opened');

        // v0.2 マイグレーション実行
        await migrateDatabase();
        console.log('✅ Database migration v0.2 completed');

        // 通知システム初期化
        await initializeNotifications();
        console.log('✅ Notifications initialized');

        // 通知権限リクエスト
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          console.warn('⚠️ Notification permissions not granted');
        }

        console.log('✅ App initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
      }
    };

    initApp();
  }, []);

  return (
    <SleepRecordingProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </SleepRecordingProvider>
  );
}
