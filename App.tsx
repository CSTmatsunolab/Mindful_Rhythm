import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Mindful Rhythm - メインアプリエントリーポイント
 *
 * 睡眠・感情・行動の相関分析と改善支援アプリ
 * CBT-I（認知行動療法）理論に基づく睡眠スコアアルゴリズム
 */
export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
