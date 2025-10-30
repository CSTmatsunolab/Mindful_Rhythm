import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { openDatabase } from './src/services/database';

/**
 * Mindful Rhythm - メインアプリエントリーポイント
 *
 * 睡眠・感情・行動の相関分析と改善支援アプリ
 * CBT-I（認知行動療法）理論に基づく睡眠スコアアルゴリズム
 */
export default function App() {
  // データベース初期化（アプリ起動時に1回だけ実行）
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await openDatabase();
        console.log('✅ App initialized with database');
      } catch (error) {
        console.error('❌ Failed to initialize database:', error);
      }
    };

    initDatabase();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
