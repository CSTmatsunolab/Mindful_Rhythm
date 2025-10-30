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
import { SleepRecord, Task, DailyMission } from '../types/database';

let db: SQLite.SQLiteDatabase | null = null;
const isWeb = Platform.OS === 'web';

// Web用のメモリデータベース（開発用）
let webDB: {
  sleep_records: any[];
  tasks: any[];
  user_mood: any[];
  ai_advice: any[];
  daily_missions: any[];
} = {
  sleep_records: [],
  tasks: [],
  user_mood: [],
  ai_advice: [],
  daily_missions: [],
};

/**
 * Helper: execAsync互換のPromiseラッパー（Legacy API用）
 */
function execAsync(database: SQLite.SQLiteDatabase, sqlStatement: string): Promise<void> {
  return new Promise((resolve, reject) => {
    database.exec([{ sql: sqlStatement, args: [] }], false, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Helper: runAsync互換のPromiseラッパー（Legacy API用）
 */
function runAsync(database: SQLite.SQLiteDatabase, sql: string, params: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

/**
 * Helper: getAllAsync互換のPromiseラッパー（Legacy API用）
 */
function getAllAsync<T>(database: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, { rows }) => resolve(rows._array as T[]),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

/**
 * Helper: getFirstAsync互換のPromiseラッパー（Legacy API用）
 */
function getFirstAsync<T>(database: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, { rows }) => resolve(rows.length > 0 ? (rows._array[0] as T) : null),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
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
    // expo-sqlite の従来の API を使用（Native のみ）
    db = SQLite.openDatabase('mindful_rhythm.db');
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
      task TEXT NOT NULL CHECK (length(task) >= 1 AND length(task) <= 200),
      status TEXT CHECK (status IN ('todo', 'done')) DEFAULT 'todo',
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

  // 初期データ投入（初回のみ）
  const count = await getFirstAsync<{count: number}>(db, 'SELECT COUNT(*) as count FROM daily_missions');
  if (count?.count === 0) {
    console.log('📝 Inserting initial daily missions...');
    await execAsync(db, `
      INSERT INTO daily_missions (mission_text, category) VALUES
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
  }

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
 * タスクを追加
 *
 * @example
 * await addTask('買い物に行く');
 * await addTask('レポート提出', true); // 睡眠改善課題として追加
 */
export async function addTask(taskText: string, isDailyMission: boolean = false): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  if (isWeb) {
    // Web用実装
    const newTask = {
      id: webDB.tasks.length + 1,
      date: today,
      task: taskText,
      status: 'todo',
      emotion: null,
      is_daily_mission: isDailyMission,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    webDB.tasks.push(newTask);
    console.log(`✅ Task added: ${taskText}`);
    return;
  }

  const database = await openDatabase();
  try {
    await runAsync(
      database!,
      'INSERT INTO tasks (date, task, status, is_daily_mission) VALUES (?, ?, ?, ?)',
      [today, taskText, 'todo', isDailyMission ? 1 : 0]
    );
    console.log(`✅ Task added: ${taskText}`);
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
  status: 'todo' | 'done',
  emotion?: string
): Promise<void> {
  if (isWeb) {
    // Web用実装
    const task = webDB.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.emotion = emotion ?? null;
      task.updated_at = Date.now();
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
