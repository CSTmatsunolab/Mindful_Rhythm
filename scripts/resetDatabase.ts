/**
 * データベースリセットスクリプト
 *
 * このスクリプトは以下を実行します：
 * 1. 全テーブルのデータを削除
 * 2. テーブル構造はそのまま維持
 * 3. デイリーミッションの初期データを再投入
 *
 * 使用方法:
 * npx ts-node scripts/resetDatabase.ts
 *
 * 警告: このスクリプトはすべてのデータを削除します！
 */

import * as SQLite from 'expo-sqlite';
import * as readline from 'readline';

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
 * 全テーブルのデータを削除
 */
async function clearAllTables(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🗑️  Clearing all tables...');

  const tables = [
    'sleep_records',
    'tasks',
    'user_mood',
    'ai_advice',
    'daily_missions',
  ];

  for (const table of tables) {
    try {
      const result = await database.runAsync(`DELETE FROM ${table}`);
      console.log(`  ✅ ${table}: ${result.changes} records deleted`);
    } catch (error) {
      console.warn(`  ⚠️  Failed to clear ${table}:`, error);
    }
  }

  console.log('✅ All tables cleared successfully');
}

/**
 * テーブルを完全に削除（DROP）
 */
async function dropAllTables(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('💥 Dropping all tables...');

  const tables = [
    'sleep_records',
    'tasks',
    'user_mood',
    'ai_advice',
    'daily_missions',
  ];

  for (const table of tables) {
    try {
      await database.execAsync(`DROP TABLE IF EXISTS ${table}`);
      console.log(`  ✅ ${table} dropped`);
    } catch (error) {
      console.warn(`  ⚠️  Failed to drop ${table}:`, error);
    }
  }

  console.log('✅ All tables dropped successfully');
}

/**
 * VACUUMを実行してデータベースを最適化
 */
async function vacuumDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🧹 Vacuuming database...');
  try {
    await database.execAsync('VACUUM');
    console.log('✅ Database vacuumed successfully');
  } catch (error) {
    console.warn('⚠️  Failed to vacuum database:', error);
  }
}

/**
 * デイリーミッションの初期データを再投入
 */
async function reseedMissions(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('📥 Reseeding daily missions...');

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
        `INSERT INTO daily_missions (title, description, category, points)
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

  console.log(`✅ ${count?.count || 0} missions reseeded`);
}

/**
 * 現在のデータベース状態を表示
 */
async function showDatabaseStatus(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('\n📊 Current database status:');

  const tables = [
    'sleep_records',
    'tasks',
    'user_mood',
    'ai_advice',
    'daily_missions',
  ];

  for (const table of tables) {
    try {
      const result = await database.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      console.log(`  - ${table}: ${result?.count || 0} records`);
    } catch (error) {
      console.log(`  - ${table}: Table does not exist`);
    }
  }
}

/**
 * ユーザーに確認を求める
 */
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  console.log('⚠️  DATABASE RESET SCRIPT ⚠️\n');
  console.log('This script will DELETE ALL DATA in the database!\n');

  try {
    const database = await openDatabase();

    // 現在の状態を表示
    await showDatabaseStatus(database);

    // 確認を求める（Node.js環境でのみ有効）
    if (typeof process !== 'undefined' && process.stdin?.isTTY) {
      console.log('\n⚠️  WARNING: This will delete all data!');
      const confirmed = await askConfirmation('Are you sure you want to continue? (y/n): ');

      if (!confirmed) {
        console.log('❌ Reset cancelled');
        return;
      }
    }

    console.log('\n🚀 Starting database reset...\n');

    // オプション1: データのみクリア（テーブル構造は維持）
    await clearAllTables(database);
    await reseedMissions(database);
    await vacuumDatabase(database);

    // オプション2: テーブルごと削除（完全リセット）
    // 以下をコメント解除すると、テーブル構造も削除されます
    // await dropAllTables(database);
    // await createTables(database);
    // await createIndexes(database);
    // await reseedMissions(database);

    // 結果を表示
    await showDatabaseStatus(database);

    console.log('\n✅ Database reset completed successfully!');
  } catch (error) {
    console.error('\n❌ Database reset failed:', error);
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
  clearAllTables,
  dropAllTables,
  reseedMissions,
  vacuumDatabase,
  showDatabaseStatus,
  main as resetDatabase,
};
