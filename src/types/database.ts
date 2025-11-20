/**
 * データベース型定義
 * SQLiteテーブルのTypeScript型
 */

export interface SleepRecord {
  id: number;
  date: string;                    // YYYY-MM-DD
  bedtime: string;                 // HH:MM
  waketime: string;                // HH:MM
  total_hours?: number;            // 計算値
  score?: number;                  // 0～100
  sleep_quality?: 'よく眠れた' | '普通' | '浅かった';
  awakenings?: number;             // 覚醒回数
  sleep_latency?: number;          // 入眠潜時（分）
  tags?: string[];                 // 環境タグ（JSONパース後）
  dream?: string;                  // 夢の記録
  mood?: string;                   // 絵文字
  recording_start_time?: number;   // 記録開始時刻（UNIX timestamp）
  recording_end_time?: number;     // 記録終了時刻（UNIX timestamp）
  recording_status?: 'idle' | 'recording' | 'completed';
  snoring_count?: number;          // いびき検出回数
  snoring_duration_minutes?: number; // いびき総時間（分）
  snoring_average_volume?: number; // いびき平均音量（dB）
  created_at: number;              // UNIX timestamp
  updated_at: number;              // UNIX timestamp
}

export interface Task {
  id: number;
  title: string;                   // タスク名
  date: string;                    // YYYY-MM-DD
  status: 'pending' | 'done';      // ステータス
  emotion?: string | null;         // 絵文字
  deadline?: string | null;        // 締め切り日（YYYY-MM-DD）✨ v0.2追加
  difficulty?: number | null;      // 難易度（1-5）✨ v0.2追加
  created_at: string;              // ISO timestamp
  updated_at: string;              // ISO timestamp
}

export interface UserMood {
  id: number;
  date: string;                    // YYYY-MM-DD
  morning_mood?: string;           // 朝の気分（絵文字）
  night_mood?: string;             // 夜の気分（絵文字）
  created_at: number;
  updated_at: number;
}

export interface AIAdvice {
  id: number;
  date: string;                    // YYYY-MM-DD
  advice_text: string;
  advice_type: 'breathing' | 'bgm' | 'stretch' | 'sleep_hygiene';
  created_at: number;
}

export interface DailyMission {
  id: number;
  mission_text: string;
  category: 'sleep_hygiene' | 'exercise' | 'relaxation' | 'environment';
}

/**
 * アラーム設定
 */
export interface Alarm {
  id: number;
  alarm_time: string;              // HH:MM
  enabled: boolean;                // 有効/無効
  repeat_days?: string[];          // ["mon","tue","wed",...] JSONパース後
  label?: string;                  // アラームラベル
  sound?: string;                  // 音源ファイル名
  snooze_enabled?: boolean;        // スヌーズ有効
  snooze_minutes?: number;         // スヌーズ時間（分）
  smart_wakeup?: boolean;          // スマートウェイクアップ
  notification_id?: string;        // expo-notifications の通知ID
  created_at: number;              // UNIX timestamp
  updated_at: number;              // UNIX timestamp
}

/**
 * いびきイベント詳細（オプション）
 */
export interface SnoringEvent {
  timestamp: number;               // いびき発生時刻（UNIX timestamp）
  duration: number;                // 継続時間（ミリ秒）
  peakVolume: number;              // ピーク音量（dBFS）
}

/**
 * 睡眠データ入力用の型
 */
export interface SleepDataInput {
  bedtime: string;
  waketime: string;
  sleepQuality: 'よく眠れた' | '普通' | '浅かった';
  awakenings: number;
  sleep_latency: number;
  tags: string[];
  dream?: string;
  mood?: string;
}

/**
 * スコア算出結果の型
 */
export interface SleepScoreResult {
  totalScore: number;
  breakdown: {
    sleepTime: number;
    deepSleep: number;
    awakenings: number;
    latency: number;
    environment: number;
  };
}

/**
 * ユーザー成長進捗（スリーピン育成）
 */
export interface UserProgress {
  id: number;
  total_growth_points: number;     // 累計成長ポイント
  sleepin_size: number;             // スリーピンのサイズ（計算用）
  level: number;                    // レベル（オプション）
  created_at: number;               // UNIX timestamp
  updated_at: number;               // UNIX timestamp
}
