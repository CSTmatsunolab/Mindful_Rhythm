/**
 * データベース初期化スクリプト
 *
 * このスクリプトは以下を実行します：
 * 1. データベースの作成
 * 2. 全テーブルの作成
 * 3. 初期データの投入（daily_missions）
 *
 * 使用方法:
 * npx ts-node scripts/initDatabase.ts
 */

import * as SQLite from 'expo-sqlite';

/**
 * データベースを開く
 */
async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  console.log('📂 Opening database...');
  const database = await SQLite.openDatabaseAsync('mindful_rhythm.db');
  console.log('✅ Database opened successfully');
  return database;
}

/**
 * 全テーブルを作成
 */
async function createTables(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🔨 Creating tables...');

  // 1. 睡眠記録テーブル
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS sleep_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      bedtime TEXT NOT NULL,
      waketime TEXT NOT NULL,
      total_hours REAL NOT NULL,
      score INTEGER NOT NULL,
      sleep_quality TEXT NOT NULL,
      awakenings INTEGER DEFAULT 0,
      sleep_latency INTEGER DEFAULT 0,
      tags TEXT,
      dream TEXT,
      mood TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('  ✅ sleep_records table created');

  // 2. タスクテーブル
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      emotion TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('  ✅ tasks table created');

  // 3. ユーザー気分記録テーブル
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_mood (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      mood TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('  ✅ user_mood table created');

  // 4. AIアドバイステーブル
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ai_advice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      advice_type TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('  ✅ ai_advice table created');

  // 5. デイリーミッションテーブル
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      points INTEGER DEFAULT 10,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('  ✅ daily_missions table created');

  console.log('✅ All tables created successfully');
}

/**
 * インデックスを作成
 */
async function createIndexes(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🔍 Creating indexes...');

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_sleep_records_date
    ON sleep_records(date);
  `);
  console.log('  ✅ Index on sleep_records.date created');

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_tasks_date
    ON tasks(date);
  `);
  console.log('  ✅ Index on tasks.date created');

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_user_mood_date
    ON user_mood(date);
  `);
  console.log('  ✅ Index on user_mood.date created');

  console.log('✅ All indexes created successfully');
}

/**
 * 初期データを投入（デイリーミッション）
 */
async function seedInitialData(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('📥 Seeding initial data...');

  const missions = [
    { title: '朝日を浴びる', description: '起床後30分以内に太陽光を浴びる', category: 'sleep_hygiene' },
    { title: '15分の軽い運動', description: '散歩やストレッチなど軽い運動をする', category: 'activity' },
    { title: 'カフェイン制限', description: '14時以降カフェイン摂取を控える', category: 'diet' },
    { title: '入浴タイム', description: '就寝1-2時間前に入浴する', category: 'sleep_hygiene' },
    { title: '画面オフタイム', description: '就寝1時間前にデジタル機器を見ない', category: 'sleep_hygiene' },
    { title: '日記を書く', description: '今日の出来事や感情を記録する', category: 'mental' },
    { title: '瞑想・深呼吸', description: '5分間の瞑想または深呼吸を行う', category: 'mental' },
    { title: '睡眠環境チェック', description: '寝室の温度・照明・音を最適化', category: 'sleep_hygiene' },
    { title: '固定就寝時刻', description: '同じ時刻に就寝する', category: 'routine' },
    { title: '昼寝コントロール', description: '昼寝は15時前まで、30分以内に', category: 'routine' },
  ];

  for (const mission of missions) {
    try {
      await database.runAsync(
        `INSERT OR IGNORE INTO daily_missions (title, description, category, points)
         VALUES (?, ?, ?, ?)`,
        [mission.title, mission.description, mission.category, 10]
      );
    } catch (error) {
      console.warn(`  ⚠️  Failed to insert mission: ${mission.title}`, error);
    }
  }

  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM daily_missions'
  );

  console.log(`✅ Initial data seeded: ${count?.count || 0} missions`);
}

/**
 * データベーススキーマを検証
 */
async function verifySchema(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🔍 Verifying database schema...');

  // テーブル一覧
  const tables = await database.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );

  console.log('\n📋 Tables:');
  tables.forEach((table) => {
    console.log(`  - ${table.name}`);
  });

  // 各テーブルのレコード数
  console.log('\n📊 Record counts:');
  for (const table of tables) {
    const result = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${table.name}`
    );
    console.log(`  - ${table.name}: ${result?.count || 0} records`);
  }

  console.log('\n✅ Schema verification complete');
}

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  console.log('🚀 Starting database initialization...\n');

  try {
    const database = await openDatabase();

    await createTables(database);
    await createIndexes(database);
    await seedInitialData(database);
    await verifySchema(database);

    console.log('\n✅ Database initialization completed successfully!');
    console.log('📝 Database file: mindful_rhythm.db');
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    throw error;
  }
}

// スクリプトとして実行された場合のみ実行
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// モジュールとしてエクスポート
export {
  openDatabase,
  createTables,
  createIndexes,
  seedInitialData,
  verifySchema,
  main as initializeDatabase,
};
