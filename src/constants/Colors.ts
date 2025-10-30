/**
 * カラーパレット定義
 * ダークトーン + 柔らかい配色（夜間利用重視）
 */

export const Colors = {
  // Primary Colors
  primary: '#0F172A',      // 夜ネイビー
  accent: '#F59E0B',       // 朝オレンジ

  // Status Colors
  success: '#22C55E',      // 緑
  warning: '#F59E0B',      // オレンジ
  error: '#EF4444',        // 赤
  info: '#3B82F6',         // 青

  // Background Colors
  background: '#1E293B',   // ダークグレー
  surface: '#334155',      // カード背景
  surfaceLight: '#475569', // ライトカード背景

  // Text Colors
  text: '#F1F5F9',         // 白テキスト
  textSecondary: '#94A3B8',// グレーテキスト
  textDisabled: '#64748B', // 無効テキスト

  // Border Colors
  border: '#475569',       // ボーダー
  borderLight: '#64748B',  // ライトボーダー

  // Tab Bar
  tabBarActive: '#F59E0B', // アクティブタブ
  tabBarInactive: '#94A3B8', // 非アクティブタブ

  // Score Colors (グラデーション)
  scoreExcellent: '#22C55E', // 80-100点
  scoreGood: '#F59E0B',      // 60-79点
  scorePoor: '#EF4444',      // 0-59点

  // Character Mood Colors
  moodHappy: '#22C55E',
  moodNeutral: '#F59E0B',
  moodSad: '#EF4444',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

/**
 * スコアに応じた色を取得
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return Colors.scoreExcellent;
  if (score >= 60) return Colors.scoreGood;
  return Colors.scorePoor;
};
