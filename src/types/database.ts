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
  created_at: number;              // UNIX timestamp
  updated_at: number;              // UNIX timestamp
}

export interface Task {
  id: number;
  date: string;                    // YYYY-MM-DD
  task: string;
  status: 'todo' | 'done';
  emotion?: string;                // 絵文字
  is_daily_mission: boolean;       // 睡眠改善課題フラグ
  created_at: number;
  updated_at: number;
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
