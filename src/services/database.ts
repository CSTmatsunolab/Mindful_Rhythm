/**
 * データベース管理モジュール
 *
 * 機能: SQLite データベースの初期化、CRUD操作
 * 使用ライブラリ: expo-sqlite
 *
 * 担当: 共通（増田さん・藤川さんで協力）
 */

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { SleepRecord, Task, DailyMission, Alarm, UserProgress } from '../types/database';

let db: SQLite.SQLiteDatabase | null = null;
const isWeb = Platform.OS === 'web';

// Web用のメモリデータベース（開発用）
let webDB: {
  sleep_records: any[];
  tasks: any[];
  user_mood: any[];
  ai_advice: any[];
  daily_missions: any[];
  alarms: any[];
} = {
  sleep_records: [],
  tasks: [],
  user_mood: [],
  ai_advice: [],
  daily_missions: [],
  alarms: [],
};

/**
 * Helper: execAsync for SDK 54+ (直接使用)
 */
async function execAsync(database: SQLite.SQLiteDatabase, sqlStatement: string): Promise<void> {
  await database.execAsync(sqlStatement);
}

/**
 * Helper: runAsync for SDK 54+ (直接使用)
 */
async function runAsync(database: SQLite.SQLiteDatabase, sql: string, params: any[]): Promise<SQLite.SQLiteRunResult> {
  return await database.runAsync(sql, params);
}

/**
 * Helper: getAllAsync for SDK 54+ (直接使用)
 */
async function getAllAsync<T>(database: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<T[]> {
  return await database.getAllAsync<T>(sql, params);
}

/**
 * Helper: getFirstAsync for SDK 54+ (直接使用)
 */
async function getFirstAsync<T>(database: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<T | null> {
  return await database.getFirstAsync<T>(sql, params);
}

/**
 * データベースを開く（初回のみ初期化実行）
 *
 * 使い方:
 * const database = await openDatabase();
 *
 * App.tsx の useEffect で呼び出すこと:
 * useEffect(() => { openDatabase(); }, []);
 */
export async function openDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  // Web環境の場合、メモリDBを初期化するだけ
  if (isWeb) {
    console.log('📦 Opening database (Web mode - using in-memory storage)...');
    await initializeWebDatabase();
    console.log('✅ Database opened successfully (Web mode)');
    return null;
  }

  if (db) return db;

  console.log('📦 Opening database...');

  try {
    // expo-sqlite 15.0.0 の新しい API を使用（SDK 54対応）
    db = await SQLite.openDatabaseAsync('mindful_rhythm.db');
    await initializeDatabase();
    console.log('✅ Database opened successfully');
  } catch (error) {
    console.error('❌ Database opening failed:', error);
    throw new Error(`Database initialization failed: ${error}`);
  }

  return db;
}

/**
 * Web用データベース初期化
 */
async function initializeWebDatabase(): Promise<void> {
  console.log('🔧 Initializing web database...');

  // 初期データ投入（初回のみ）
  if (webDB.daily_missions.length === 0) {
    console.log('📝 Inserting initial daily missions...');
    webDB.daily_missions = [
      { id: 1, mission_text: '寝る1時間前はスマホ・PC禁止', category: 'sleep_hygiene' },
      { id: 2, mission_text: 'カフェインは15時以降摂取しない', category: 'sleep_hygiene' },
      { id: 3, mission_text: '就寝2時間前に軽い運動（ストレッチ・散歩）', category: 'exercise' },
      { id: 4, mission_text: '寝室の温度を18～22℃に保つ', category: 'environment' },
      { id: 5, mission_text: '就寝前に入浴（38～40℃、15分）', category: 'relaxation' },
      { id: 6, mission_text: '毎日同じ時刻に就寝・起床する', category: 'sleep_hygiene' },
      { id: 7, mission_text: '昼寝は15分以内、15時前に済ませる', category: 'sleep_hygiene' },
      { id: 8, mission_text: '寝室を暗く静かに保つ（遮光カーテン・耳栓）', category: 'environment' },
      { id: 9, mission_text: '就寝前にリラクゼーション（深呼吸・瞑想）', category: 'relaxation' },
      { id: 10, mission_text: '寝る前にアルコール・タバコを避ける', category: 'sleep_hygiene' },
    ];
  }

  console.log('✅ Web database initialized successfully');
}

/**
 * データベース初期化（全テーブル作成）
 *
 * 自動実行されるため、直接呼び出す必要なし
 */
async function initializeDatabase(): Promise<void> {
  if (!db) return;

  console.log('🔧 Initializing database tables...');

  // ========================================
  // 1. sleep_records テーブル（睡眠記録）
  // 担当: 増田さん
  // ========================================
  await execAsync(db, `
    CREATE TABLE IF NOT EXISTS sleep_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,              -- YYYY-MM-DD
      bedtime TEXT NOT NULL,                  -- HH:MM
      waketime TEXT NOT NULL,                 -- HH:MM
      total_hours REAL,                       -- 睡眠時間（時間単位）
      score INTEGER,                          -- 睡眠スコア 0～100
      sleep_quality TEXT CHECK (sleep_quality IN ('よく眠れた', '普通', '浅かった')),
      awakenings INTEGER DEFAULT 0,          -- 中途覚醒回数
      sleep_latency INTEGER,                  -- 入眠潜時（分）
      tags TEXT,                              -- JSON配列 ["運動", "入浴"]
      dream TEXT,                             -- 見た夢（睡眠日記用）
      mood TEXT,                              -- 今日の気分（睡眠日記用）
      recording_start_time INTEGER,           -- 記録開始時刻（UNIX timestamp）
      recording_end_time INTEGER,             -- 記録終了時刻（UNIX timestamp）
      recording_status TEXT CHECK (recording_status IN ('idle', 'recording', 'completed')),
      snoring_count INTEGER DEFAULT 0,        -- いびき検出回数
      snoring_duration_minutes REAL DEFAULT 0, -- いびき総時間（分）
      snoring_average_volume REAL DEFAULT 0,  -- いびき平均音量（dB）
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_sleep_date ON sleep_records(date DESC);

    CREATE TRIGGER IF NOT EXISTS update_sleep_timestamp
    AFTER UPDATE ON sleep_records
    BEGIN
      UPDATE sleep_records SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
    END;
  `);

  // ========================================
  // 2. tasks テーブル（タスク管理）
  // 担当: 藤川さん
  // ========================================
  await execAsync(db, `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,                     -- YYYY-MM-DD
      title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
      status TEXT CHECK (status IN ('pending', 'done')) DEFAULT 'pending',
      emotion TEXT,                           -- 絵文字（😊 😌 😫 😡 😭 😴）
      is_daily_mission BOOLEAN DEFAULT 0,     -- 睡眠改善課題フラグ
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date DESC);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

    CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp
    AFTER UPDATE ON tasks
    BEGIN
      UPDATE tasks SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
    END;
  `);

  // ========================================
  // 3. user_mood テーブル（気分記録）
  // 担当: 増田さん（睡眠日記機能）
  // ========================================
  await execAsync(db, `
    CREATE TABLE IF NOT EXISTS user_mood (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,              -- YYYY-MM-DD
      morning_mood TEXT,                      -- 朝の気分（絵文字）
      night_mood TEXT,                        -- 夜の気分（絵文字）
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_user_mood_date ON user_mood(date DESC);
  `);

  // ========================================
  // 4. ai_advice テーブル（AIアドバイス履歴）
  // 担当: 増田さん
  // ========================================
  await execAsync(db, `
    CREATE TABLE IF NOT EXISTS ai_advice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,                     -- YYYY-MM-DD
      advice_text TEXT NOT NULL,
      advice_type TEXT CHECK (advice_type IN ('breathing', 'bgm', 'stretch', 'sleep_hygiene')),
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_ai_advice_date ON ai_advice(date DESC);
  `);

  // ========================================
  // 5. daily_missions テーブル（マスタデータ）
  // 担当: 増田さん（睡眠改善課題機能）
  // ========================================
  await execAsync(db, `
    CREATE TABLE IF NOT EXISTS daily_missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_text TEXT NOT NULL UNIQUE,
      category TEXT CHECK (category IN ('sleep_hygiene', 'exercise', 'relaxation', 'environment'))
    );
  `);

  // 初期データ投入（INSERT OR IGNORE で重複を防止）
  console.log('📝 Inserting initial daily missions (if not exists)...');
  await execAsync(db, `
    INSERT OR IGNORE INTO daily_missions (mission_text, category) VALUES
    ('寝る1時間前はスマホ・PC禁止', 'sleep_hygiene'),
    ('カフェインは15時以降摂取しない', 'sleep_hygiene'),
    ('就寝2時間前に軽い運動（ストレッチ・散歩）', 'exercise'),
    ('寝室の温度を18～22℃に保つ', 'environment'),
    ('就寝前に入浴（38～40℃、15分）', 'relaxation'),
    ('毎日同じ時刻に就寝・起床する', 'sleep_hygiene'),
    ('昼寝は15分以内、15時前に済ませる', 'sleep_hygiene'),
    ('寝室を暗く静かに保つ（遮光カーテン・耳栓）', 'environment'),
    ('就寝前にリラクゼーション（深呼吸・瞑想）', 'relaxation'),
    ('寝る前にアルコール・タバコを避ける', 'sleep_hygiene');
  `);

  // ========================================
  // 6. alarms テーブル（アラーム設定）
  // ========================================
  await execAsync(db, `
    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alarm_time TEXT NOT NULL,               -- HH:MM
      enabled BOOLEAN DEFAULT 1,              -- 有効/無効
      repeat_days TEXT,                       -- JSON配列 ["mon","tue","wed",...]
      label TEXT,                             -- ラベル（例: "平日の起床"）
      sound TEXT DEFAULT 'default',           -- 音源ファイル名
      snooze_enabled BOOLEAN DEFAULT 1,       -- スヌーズ有効
      snooze_minutes INTEGER DEFAULT 5,       -- スヌーズ時間（分）
      smart_wakeup BOOLEAN DEFAULT 0,         -- スマートウェイクアップ
      notification_id TEXT,                   -- expo-notifications の通知ID
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_alarms_enabled ON alarms(enabled);

    CREATE TRIGGER IF NOT EXISTS update_alarms_timestamp
    AFTER UPDATE ON alarms
    BEGIN
      UPDATE alarms SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
    END;
  `);

  // ========================================
  // 7. user_progress テーブル（スリーピン育成）
  // ========================================
  await execAsync(db, `
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_growth_points INTEGER NOT NULL DEFAULT 0,  -- 累計成長ポイント
      sleepin_size INTEGER NOT NULL DEFAULT 80,        -- スリーピンサイズ（px）
      level INTEGER NOT NULL DEFAULT 1,                -- レベル
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TRIGGER IF NOT EXISTS update_user_progress_timestamp
    AFTER UPDATE ON user_progress
    BEGIN
      UPDATE user_progress SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
    END;
  `);

  // 初期データ投入（ユーザー進捗レコード1件のみ）
  console.log('📝 Initializing user progress...');
  await execAsync(db, `
    INSERT OR IGNORE INTO user_progress (id, total_growth_points, sleepin_size, level)
    VALUES (1, 0, 80, 1);
  `);

  console.log('✅ Database initialized successfully');
}

// ========================================
// 睡眠記録 CRUD操作（増田さん担当）
// ========================================

/**
 * 睡眠記録を保存
 *
 * @example
 * await saveSleepRecord({
 *   date: '2025-10-30',
 *   bedtime: '22:30',
 *   waketime: '07:00',
 *   score: 85,
 *   sleep_quality: 'よく眠れた',
 *   awakenings: 0,
 *   sleep_latency: 15,
 *   tags: ['運動', '入浴'],
 * });
 */
export async function saveSleepRecord(record: Omit<SleepRecord, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  if (isWeb) {
    // Web用実装
    const existingIndex = webDB.sleep_records.findIndex(r => r.date === record.date);
    const newRecord = {
      id: existingIndex >= 0 ? webDB.sleep_records[existingIndex].id : webDB.sleep_records.length + 1,
      ...record,
      created_at: existingIndex >= 0 ? webDB.sleep_records[existingIndex].created_at : Date.now(),
      updated_at: Date.now(),
    };

    if (existingIndex >= 0) {
      webDB.sleep_records[existingIndex] = newRecord;
    } else {
      webDB.sleep_records.push(newRecord);
    }
    console.log(`✅ Sleep record saved for ${record.date}`);
    return;
  }

  const database = await openDatabase();
  try {
    await runAsync(
      database!,
      `INSERT OR REPLACE INTO sleep_records
       (date, bedtime, waketime, total_hours, score, sleep_quality, awakenings, sleep_latency, tags, dream, mood)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.date,
        record.bedtime,
        record.waketime,
        record.total_hours ?? null,
        record.score ?? null,
        record.sleep_quality ?? null,
        record.awakenings ?? 0,
        record.sleep_latency ?? null,
        record.tags ? JSON.stringify(record.tags) : null,
        record.dream ?? null,
        record.mood ?? null,
      ]
    );
    console.log(`✅ Sleep record saved for ${record.date}`);
  } catch (error) {
    console.error('❌ Error saving sleep record:', error);
    throw error;
  }
}

/**
 * 指定日の睡眠記録を取得
 *
 * @example
 * const record = await getSleepRecord('2025-10-30');
 * if (record) {
 *   console.log('Sleep score:', record.score);
 * }
 */
export async function getSleepRecord(date: string): Promise<SleepRecord | null> {
  if (isWeb) {
    // Web用実装
    return webDB.sleep_records.find(r => r.date === date) || null;
  }

  const database = await openDatabase();
  const result = await getFirstAsync<any>(
    database!,
    'SELECT * FROM sleep_records WHERE date = ?',
    [date]
  );

  if (!result) return null;

  // JSON文字列をパース
  return {
    ...result,
    tags: result.tags ? JSON.parse(result.tags) : [],
  };
}

/**
 * 最新N日分の睡眠記録を取得（グラフ用）
 *
 * @example
 * const records = await getRecentSleepRecords(7);
 * console.log('Last 7 days:', records);
 */
export async function getRecentSleepRecords(days: number = 7): Promise<SleepRecord[]> {
  if (isWeb) {
    // Web用実装
    return webDB.sleep_records
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days);
  }

  const database = await openDatabase();
  const results = await getAllAsync<any>(
    database!,
    'SELECT * FROM sleep_records ORDER BY date DESC LIMIT ?',
    [days]
  );

  return results.map(row => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
  }));
}

/**
 * 睡眠記録を更新（睡眠日記用）
 *
 * @example
 * await updateSleepRecord('2025-10-30', {
 *   dream: '空を飛ぶ夢を見た',
 *   mood: '😊'
 * });
 */
export async function updateSleepRecord(date: string, updates: Partial<SleepRecord>): Promise<void> {
  if (isWeb) {
    // Web用実装
    const record = webDB.sleep_records.find(r => r.date === date);
    if (record) {
      if (updates.dream !== undefined) record.dream = updates.dream;
      if (updates.mood !== undefined) record.mood = updates.mood;
      record.updated_at = Date.now();
    }
    console.log(`✅ Sleep record updated for ${date}`);
    return;
  }

  const database = await openDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.dream !== undefined) {
    fields.push('dream = ?');
    values.push(updates.dream);
  }
  if (updates.mood !== undefined) {
    fields.push('mood = ?');
    values.push(updates.mood);
  }

  if (fields.length === 0) return;

  values.push(date);

  await runAsync(
    database!,
    `UPDATE sleep_records SET ${fields.join(', ')} WHERE date = ?`,
    values
  );
  console.log(`✅ Sleep record updated for ${date}`);
}

// ========================================
// タスク CRUD操作（藤川さん担当）
// ========================================

/**
 * タスクを追加 ✨ v0.2更新: deadline, difficulty対応
 *
 * @example
 * await addTask('買い物に行く');
 * await addTask('レポート提出', { deadline: '2025-11-15', difficulty: 4 });
 */
export async function addTask(
  taskText: string,
  options?: {
    deadline?: string | null;
    difficulty?: number | null;
  }
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const deadline = options?.deadline || null;
  const difficulty = options?.difficulty || 3; // デフォルト: 普通

  if (isWeb) {
    // Web用実装
    const newTask: any = {
      id: webDB.tasks.length + 1,
      date: today,
      title: taskText,
      status: 'pending',
      emotion: null,
      deadline,
      difficulty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    webDB.tasks.push(newTask);
    console.log(`✅ Task added: ${taskText}`);
    return;
  }

  const database = await openDatabase();
  try {
    await runAsync(
      database!,
      'INSERT INTO tasks (date, title, status, deadline, difficulty) VALUES (?, ?, ?, ?, ?)',
      [today, taskText, 'pending', deadline, difficulty]
    );
    console.log(`✅ Task added: ${taskText} (deadline: ${deadline}, difficulty: ${difficulty})`);
  } catch (error) {
    console.error('❌ Error adding task:', error);
    throw error;
  }
}

/**
 * 指定日のタスク一覧を取得
 *
 * @example
 * const tasks = await getTasksByDate('2025-10-30');
 * console.log('Today tasks:', tasks);
 */
export async function getTasksByDate(date: string): Promise<Task[]> {
  if (isWeb) {
    // Web用実装
    return webDB.tasks.filter(t => t.date === date).sort((a, b) => a.created_at - b.created_at);
  }

  const database = await openDatabase();
  const results = await getAllAsync<Task>(
    database!,
    'SELECT * FROM tasks WHERE date = ? ORDER BY created_at ASC',
    [date]
  );

  return results;
}

/**
 * タスクステータスを更新（完了+感情記録）
 *
 * @example
 * await updateTaskStatus(1, 'done', '😊');
 */
export async function updateTaskStatus(
  taskId: number,
  status: 'pending' | 'done',
  emotion?: string
): Promise<void> {
  if (isWeb) {
    // Web用実装
    const task = webDB.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.emotion = emotion ?? null;
      task.updated_at = new Date().toISOString();
    }
    console.log(`✅ Task ${taskId} updated to ${status}`);
    return;
  }

  const database = await openDatabase();
  await runAsync(
    database!,
    'UPDATE tasks SET status = ?, emotion = ? WHERE id = ?',
    [status, emotion ?? null, taskId]
  );
  console.log(`✅ Task ${taskId} updated to ${status}`);
}

/**
 * タスクを削除
 *
 * @example
 * await deleteTask(1);
 */
export async function deleteTask(taskId: number): Promise<void> {
  if (isWeb) {
    // Web用実装
    const index = webDB.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      webDB.tasks.splice(index, 1);
    }
    console.log(`✅ Task ${taskId} deleted`);
    return;
  }

  const database = await openDatabase();
  await runAsync(database!, 'DELETE FROM tasks WHERE id = ?', [taskId]);
  console.log(`✅ Task ${taskId} deleted`);
}

/**
 * 今日の完了タスク数を取得
 *
 * @example
 * const completed = await getTodayCompletedCount();
 * console.log('Completed today:', completed);
 */
export async function getTodayCompletedCount(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  if (isWeb) {
    // Web用実装
    return webDB.tasks.filter(t => t.date === today && t.status === 'done').length;
  }

  const database = await openDatabase();
  const result = await getFirstAsync<{count: number}>(
    database!,
    'SELECT COUNT(*) as count FROM tasks WHERE date = ? AND status = ?',
    [today, 'done']
  );

  return result?.count ?? 0;
}

// ========================================
// 睡眠改善課題マスタ操作（増田さん担当）
// ========================================

/**
 * ランダムな睡眠改善課題を1件取得
 *
 * @example
 * const mission = await getRandomMission();
 * console.log('Today mission:', mission.mission_text);
 */
export async function getRandomMission(): Promise<DailyMission | null> {
  if (isWeb) {
    // Web用実装
    if (webDB.daily_missions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * webDB.daily_missions.length);
    return webDB.daily_missions[randomIndex];
  }

  const database = await openDatabase();
  const result = await getFirstAsync<DailyMission>(
    database!,
    'SELECT * FROM daily_missions ORDER BY RANDOM() LIMIT 1'
  );

  return result ?? null;
}

/**
 * 全ての睡眠改善課題を取得
 */
export async function getAllMissions(): Promise<DailyMission[]> {
  if (isWeb) {
    // Web用実装
    return webDB.daily_missions.sort((a, b) => {
      if (a.category === b.category) return a.id - b.id;
      return a.category.localeCompare(b.category);
    });
  }

  const database = await openDatabase();
  const results = await getAllAsync<DailyMission>(
    database!,
    'SELECT * FROM daily_missions ORDER BY category, id'
  );

  return results;
}

// ========================================
// ホーム画面用のデータ取得関数
// ========================================

/**
 * 最新の睡眠記録を取得（ホーム画面用）
 *
 * @returns 最新の睡眠記録、なければnull
 */
export async function getLatestSleepRecord(): Promise<SleepRecord | null> {
  if (isWeb) {
    // Web用実装
    if (webDB.sleep_records.length === 0) return null;

    const sorted = [...webDB.sleep_records].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return sorted[0];
  }

  const database = await openDatabase();
  const result = await getFirstAsync<SleepRecord>(
    database!,
    `SELECT * FROM sleep_records
     ORDER BY date DESC, created_at DESC
     LIMIT 1`
  );

  return result ?? null;
}

/**
 * 今日のタスクを取得（ホーム画面用）
 *
 * @returns 今日のタスク一覧
 */
export async function getTodayTasks(): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];

  if (isWeb) {
    // Web用実装
    return webDB.tasks
      .filter(task => task.date === today)
      .sort((a, b) => {
        if (a.status === b.status) return a.id - b.id;
        return a.status === 'done' ? 1 : -1;
      });
  }

  const database = await openDatabase();
  const results = await getAllAsync<Task>(
    database!,
    `SELECT * FROM tasks
     WHERE date = ?
     ORDER BY
       CASE WHEN status = 'done' THEN 1 ELSE 0 END,
       created_at ASC`,
    [today]
  );

  return results;
}

// ========================================
// アラーム CRUD操作
// ========================================

/**
 * アラームを保存（新規作成または更新）
 */
export async function saveAlarm(alarm: {
  id?: number;
  alarm_time: string;
  enabled?: boolean;
  repeat_days?: string[];
  label?: string;
  sound?: string;
  snooze_enabled?: boolean;
  snooze_minutes?: number;
  smart_wakeup?: boolean;
  notification_id?: string;
}): Promise<number> {
  if (isWeb) {
    // Web用実装
    if (alarm.id) {
      const index = webDB.alarms.findIndex(a => a.id === alarm.id);
      if (index !== -1) {
        webDB.alarms[index] = {
          ...webDB.alarms[index],
          ...alarm,
          repeat_days: alarm.repeat_days ? JSON.stringify(alarm.repeat_days) : null,
          updated_at: Math.floor(Date.now() / 1000),
        };
        return alarm.id;
      }
    }
    const newId = webDB.alarms.length > 0 ? Math.max(...webDB.alarms.map(a => a.id)) + 1 : 1;
    webDB.alarms.push({
      id: newId,
      alarm_time: alarm.alarm_time,
      enabled: alarm.enabled ?? true,
      repeat_days: alarm.repeat_days ? JSON.stringify(alarm.repeat_days) : null,
      label: alarm.label ?? null,
      sound: alarm.sound ?? 'default',
      snooze_enabled: alarm.snooze_enabled ?? true,
      snooze_minutes: alarm.snooze_minutes ?? 5,
      smart_wakeup: alarm.smart_wakeup ?? false,
      notification_id: alarm.notification_id ?? null,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    });
    return newId;
  }

  const database = await openDatabase();

  if (alarm.id) {
    // 更新
    await runAsync(
      database!,
      `UPDATE alarms SET
        alarm_time = ?,
        enabled = ?,
        repeat_days = ?,
        label = ?,
        sound = ?,
        snooze_enabled = ?,
        snooze_minutes = ?,
        smart_wakeup = ?,
        notification_id = ?
      WHERE id = ?`,
      [
        alarm.alarm_time,
        alarm.enabled ?? true,
        alarm.repeat_days ? JSON.stringify(alarm.repeat_days) : null,
        alarm.label ?? null,
        alarm.sound ?? 'default',
        alarm.snooze_enabled ?? true,
        alarm.snooze_minutes ?? 5,
        alarm.smart_wakeup ?? false,
        alarm.notification_id ?? null,
        alarm.id,
      ]
    );
    return alarm.id;
  } else {
    // 新規作成
    const result = await runAsync(
      database!,
      `INSERT INTO alarms (
        alarm_time, enabled, repeat_days, label, sound,
        snooze_enabled, snooze_minutes, smart_wakeup, notification_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alarm.alarm_time,
        alarm.enabled ?? true,
        alarm.repeat_days ? JSON.stringify(alarm.repeat_days) : null,
        alarm.label ?? null,
        alarm.sound ?? 'default',
        alarm.snooze_enabled ?? true,
        alarm.snooze_minutes ?? 5,
        alarm.smart_wakeup ?? false,
        alarm.notification_id ?? null,
      ]
    );
    return result.lastInsertRowId;
  }
}

/**
 * すべてのアラームを取得
 */
export async function getAlarms(): Promise<Alarm[]> {
  if (isWeb) {
    return webDB.alarms.map(a => ({
      ...a,
      repeat_days: a.repeat_days ? JSON.parse(a.repeat_days) : undefined,
    }));
  }

  const database = await openDatabase();
  const results = await getAllAsync<any>(
    database!,
    'SELECT * FROM alarms ORDER BY alarm_time ASC'
  );

  return results.map(a => ({
    ...a,
    enabled: Boolean(a.enabled),
    snooze_enabled: Boolean(a.snooze_enabled),
    smart_wakeup: Boolean(a.smart_wakeup),
    repeat_days: a.repeat_days ? JSON.parse(a.repeat_days) : undefined,
  }));
}

/**
 * 特定のアラームを取得
 */
export async function getAlarm(id: number): Promise<Alarm | null> {
  if (isWeb) {
    const alarm = webDB.alarms.find(a => a.id === id);
    if (!alarm) return null;
    return {
      ...alarm,
      repeat_days: alarm.repeat_days ? JSON.parse(alarm.repeat_days) : undefined,
    };
  }

  const database = await openDatabase();
  const result = await getFirstAsync<any>(
    database!,
    'SELECT * FROM alarms WHERE id = ?',
    [id]
  );

  if (!result) return null;

  return {
    ...result,
    enabled: Boolean(result.enabled),
    snooze_enabled: Boolean(result.snooze_enabled),
    smart_wakeup: Boolean(result.smart_wakeup),
    repeat_days: result.repeat_days ? JSON.parse(result.repeat_days) : undefined,
  };
}

/**
 * アラームを削除
 */
export async function deleteAlarm(id: number): Promise<void> {
  if (isWeb) {
    webDB.alarms = webDB.alarms.filter(a => a.id !== id);
    return;
  }

  const database = await openDatabase();
  await runAsync(database!, 'DELETE FROM alarms WHERE id = ?', [id]);
}

/**
 * アラームの有効/無効を切り替え
 */
export async function toggleAlarm(id: number, enabled: boolean): Promise<void> {
  if (isWeb) {
    const alarm = webDB.alarms.find(a => a.id === id);
    if (alarm) {
      alarm.enabled = enabled;
      alarm.updated_at = Math.floor(Date.now() / 1000);
    }
    return;
  }

  const database = await openDatabase();
  await runAsync(
    database!,
    'UPDATE alarms SET enabled = ? WHERE id = ?',
    [enabled, id]
  );
}

// ========================================
// ユーザー成長進捗 CRUD操作
// ========================================

/**
 * ユーザー進捗を取得
 */
export async function getUserProgress(): Promise<UserProgress> {
  if (isWeb) {
    // Web用実装（デフォルト値返す）
    return {
      id: 1,
      total_growth_points: 0,
      sleepin_size: 80,
      level: 1,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };
  }

  const database = await openDatabase();
  const result = await getFirstAsync<UserProgress>(
    database!,
    'SELECT * FROM user_progress WHERE id = 1'
  );

  // レコードが存在しない場合は初期値を返す
  if (!result) {
    return {
      id: 1,
      total_growth_points: 0,
      sleepin_size: 80,
      level: 1,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };
  }

  return result;
}

/**
 * 成長ポイントを加算
 * @param points 加算するポイント数
 */
export async function addGrowthPoints(points: number): Promise<UserProgress> {
  if (isWeb) {
    // Web用実装（仮）
    return {
      id: 1,
      total_growth_points: points,
      sleepin_size: 80 + points * 2,
      level: Math.floor(points / 10) + 1,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };
  }

  const database = await openDatabase();

  // 現在のポイントを取得
  const current = await getUserProgress();
  const newTotalPoints = current.total_growth_points + points;

  // スリーピンサイズを計算（初期80px + ポイント×2px、上限なし）
  const newSize = 80 + newTotalPoints * 2;

  // レベルを計算（10ポイントで1レベル）
  const newLevel = Math.floor(newTotalPoints / 10) + 1;

  // 更新
  await runAsync(
    database!,
    `UPDATE user_progress SET
      total_growth_points = ?,
      sleepin_size = ?,
      level = ?
    WHERE id = 1`,
    [newTotalPoints, newSize, newLevel]
  );

  return await getUserProgress();
}

/**
 * タスク完了時に難易度に応じた成長ポイントを加算
 * @param difficulty タスクの難易度（1-5）
 */
export async function addTaskGrowthPoints(difficulty: number | null): Promise<UserProgress> {
  // 難易度に応じたポイント計算
  // 難易度1: 1pt, 難易度2: 2pt, 難易度3: 3pt, 難易度4: 5pt, 難易度5: 8pt
  const pointsMap: Record<number, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 5,
    5: 8,
  };

  const points = difficulty ? (pointsMap[difficulty] || 1) : 1;
  return await addGrowthPoints(points);
}

// ========================================
// デバッグ用関数
// ========================================

/**
 * データベース内容を表示（開発時のみ使用）
 */
export async function debugDatabase(): Promise<void> {
  console.log('\n=== DEBUG: Database Contents ===');

  if (isWeb) {
    // Web用実装
    console.log('Sleep records:', webDB.sleep_records);
    console.log('Tasks:', webDB.tasks);
    console.log('Daily missions:', webDB.daily_missions);
    console.log('================================\n');
    return;
  }

  const database = await openDatabase();
  const sleepRecords = await getAllAsync(database!, 'SELECT * FROM sleep_records');
  console.log('Sleep records:', sleepRecords);

  const tasks = await getAllAsync(database!, 'SELECT * FROM tasks');
  console.log('Tasks:', tasks);

  const missions = await getAllAsync(database!, 'SELECT * FROM daily_missions');
  console.log('Daily missions:', missions);

  console.log('================================\n');
}
