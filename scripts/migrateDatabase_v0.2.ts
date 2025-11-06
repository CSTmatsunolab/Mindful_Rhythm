/**
 * データベースマイグレーションスクリプト v0.2
 *
 * 目的: tasks テーブルに deadline と difficulty カラムを追加
 *
 * 実行方法:
 *   npx ts-node scripts/migrateDatabase_v0.2.ts
 *
 * 変更内容:
 *   - deadline: TEXT (YYYY-MM-DD形式)
 *   - difficulty: INTEGER (1-5の範囲、デフォルト3)
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'mindful_rhythm.db';

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  return await SQLite.openDatabaseAsync(DB_NAME);
}

async function checkColumnExists(
  db: SQLite.SQLiteDatabase,
  tableName: string,
  columnName: string
): Promise<boolean> {
  try {
    const result = await db.getFirstAsync<{ name: string }>(
      `PRAGMA table_info(${tableName})`
    );

    const allColumns = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${tableName})`
    );

    return allColumns.some(col => col.name === columnName);
  } catch (error) {
    console.error(`Error checking column ${columnName}:`, error);
    return false;
  }
}

async function migrateDatabase() {
  console.log('🚀 Starting database migration v0.2...\n');

  try {
    const db = await openDatabase();
    console.log('✅ Database opened successfully\n');

    // tasks テーブルの現在の構造を確認
    console.log('📊 Current tasks table structure:');
    const currentColumns = await db.getAllAsync<{ name: string; type: string }>(
      'PRAGMA table_info(tasks)'
    );
    currentColumns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    console.log('');

    // task カラムを title にリネーム、status制約を更新（v0.2統一）
    const hasTitle = await checkColumnExists(db, 'tasks', 'title');
    const hasTask = await checkColumnExists(db, 'tasks', 'task');

    if (!hasTitle && hasTask) {
      console.log('🔄 Recreating tasks table with updated schema...');
      console.log('   - Renaming "task" to "title"');
      console.log('   - Updating status constraint: "todo" → "pending"');

      // 新しいテーブルを作成
      await db.execAsync(`
        CREATE TABLE tasks_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
          status TEXT CHECK (status IN ('pending', 'done')) DEFAULT 'pending',
          emotion TEXT,
          is_daily_mission BOOLEAN DEFAULT 0,
          created_at INTEGER DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
      `);

      // 既存データをコピー（task → title, todo → pending）
      await db.execAsync(`
        INSERT INTO tasks_new (id, date, title, status, emotion, is_daily_mission, created_at, updated_at)
        SELECT id, date, task,
               CASE WHEN status = 'todo' THEN 'pending' ELSE status END,
               emotion, is_daily_mission, created_at, updated_at
        FROM tasks;
      `);

      // 古いテーブルを削除
      await db.execAsync('DROP TABLE tasks;');

      // 新しいテーブルをリネーム
      await db.execAsync('ALTER TABLE tasks_new RENAME TO tasks;');

      console.log('✅ Tasks table recreated successfully\n');
    } else if (hasTitle) {
      console.log('⏭️  "title" column already exists, skipping table recreation\n');
    }

    // deadline カラムの追加
    const hasDeadline = await checkColumnExists(db, 'tasks', 'deadline');
    if (!hasDeadline) {
      console.log('➕ Adding "deadline" column to tasks table...');
      await db.execAsync('ALTER TABLE tasks ADD COLUMN deadline TEXT;');
      console.log('✅ "deadline" column added successfully\n');
    } else {
      console.log('⏭️  "deadline" column already exists, skipping\n');
    }

    // difficulty カラムの追加
    const hasDifficulty = await checkColumnExists(db, 'tasks', 'difficulty');
    if (!hasDifficulty) {
      console.log('➕ Adding "difficulty" column to tasks table...');
      await db.execAsync('ALTER TABLE tasks ADD COLUMN difficulty INTEGER DEFAULT 3;');
      console.log('✅ "difficulty" column added successfully\n');
    } else {
      console.log('⏭️  "difficulty" column already exists, skipping\n');
    }

    // 更新後のテーブル構造を確認
    console.log('📊 Updated tasks table structure:');
    const updatedColumns = await db.getAllAsync<{ name: string; type: string }>(
      'PRAGMA table_info(tasks)'
    );
    updatedColumns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    console.log('');

    // 既存データの確認
    const taskCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks'
    );
    console.log(`📝 Total tasks in database: ${taskCount?.count || 0}`);

    // 既存タスクのサンプルを表示
    if (taskCount && taskCount.count > 0) {
      console.log('📋 Sample task after migration:');
      const sampleTask = await db.getFirstAsync(
        'SELECT id, title, deadline, difficulty, status FROM tasks LIMIT 1'
      );
      console.log(JSON.stringify(sampleTask, null, 2));
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Update Task type definition in src/types/database.ts');
    console.log('   2. Update CRUD operations in src/services/database.ts');
    console.log('   3. Update UI components to use new fields');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// スクリプトとして直接実行された場合
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('\n✅ Script execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script execution failed:', error);
      process.exit(1);
    });
}

export { migrateDatabase };
