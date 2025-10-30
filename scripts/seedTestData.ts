/**
 * テストデータ投入スクリプト
 *
 * このスクリプトは以下を実行します：
 * 1. 30日分の睡眠記録データを生成
 * 2. 様々なパターンのタスクデータを生成
 * 3. 気分記録データを生成
 * 4. AIアドバイスデータを生成
 *
 * 使用方法:
 * npx ts-node scripts/seedTestData.ts
 *
 * オプション:
 * --days <number>     生成する睡眠記録の日数（デフォルト: 30）
 * --tasks <number>    生成するタスクの数（デフォルト: 20）
 */

import * as SQLite from 'expo-sqlite';

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * ランダムな整数を生成
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * ランダムな要素を選択
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

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
 * 睡眠記録のテストデータを生成
 */
async function seedSleepRecords(
  database: SQLite.SQLiteDatabase,
  days: number = 30
): Promise<void> {
  console.log(`📥 Seeding ${days} days of sleep records...`);

  const sleepQualities = ['よく眠れた', '普通', '浅かった'];
  const tagOptions = [
    ['運動', '入浴', 'カフェインなし'],
    ['運動', 'カフェインなし'],
    ['入浴', '暗い部屋'],
    ['運動', '入浴', '暗い部屋', 'カフェインなし'],
    ['カフェイン', 'ストレス'],
    ['運動', 'ストレス'],
    [],
  ];

  const dreams = [
    '楽しい夢を見た',
    '仕事の夢を見た',
    '旅行の夢を見た',
    null,
    null,
    null, // 多くの場合は夢を記録しない
  ];

  const moods = ['😊', '😌', '😐', '😟', '😫'];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // 睡眠の質に応じてパターンを変える
    const qualityIndex = i % 3;
    const quality = sleepQualities[qualityIndex];

    let bedtime: string;
    let waketime: string;
    let totalHours: number;
    let awakenings: number;
    let sleepLatency: number;
    let tags: string;

    if (quality === 'よく眠れた') {
      // 良い睡眠パターン
      bedtime = `${randomInt(22, 23)}:${randomInt(0, 59).toString().padStart(2, '0')}`;
      waketime = `${randomInt(6, 7)}:${randomInt(0, 59).toString().padStart(2, '0')}`;
      totalHours = randomInt(70, 85) / 10; // 7.0-8.5時間
      awakenings = randomInt(0, 1);
      sleepLatency = randomInt(5, 15);
      tags = randomChoice(tagOptions.slice(0, 4)).join(',');
    } else if (quality === '普通') {
      // 普通の睡眠パターン
      bedtime = `${randomInt(23, 24)}:${randomInt(0, 59).toString().padStart(2, '0')}`;
      waketime = `${randomInt(6, 8)}:${randomInt(0, 59).toString().padStart(2, '0')}`;
      totalHours = randomInt(60, 75) / 10; // 6.0-7.5時間
      awakenings = randomInt(1, 2);
      sleepLatency = randomInt(10, 25);
      tags = randomChoice(tagOptions).join(',');
    } else {
      // 悪い睡眠パターン
      bedtime = `${randomInt(0, 2)}:${randomInt(0, 59).toString().padStart(2, '0')}`;
      waketime = `${randomInt(5, 7)}:${randomInt(0, 59).toString().padStart(2, '0')}`;
      totalHours = randomInt(40, 60) / 10; // 4.0-6.0時間
      awakenings = randomInt(3, 6);
      sleepLatency = randomInt(30, 60);
      tags = randomChoice(tagOptions.slice(4, 7)).join(',');
    }

    // スコアを計算（簡易版）
    const score = Math.max(
      40,
      Math.min(
        100,
        Math.round(
          (totalHours / 8.0) * 30 +
            (quality === 'よく眠れた' ? 25 : quality === '普通' ? 17 : 10) +
            Math.max(0, 20 - awakenings * 3) +
            Math.max(0, 15 - (sleepLatency - 15) * 0.3) +
            (tags.length > 0 ? 10 : 0)
        )
      )
    );

    try {
      await database.runAsync(
        `INSERT OR REPLACE INTO sleep_records
         (date, bedtime, waketime, total_hours, score, sleep_quality, awakenings, sleep_latency, tags, dream, mood)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          formatDate(date),
          bedtime,
          waketime,
          totalHours,
          score,
          quality,
          awakenings,
          sleepLatency,
          tags,
          randomChoice(dreams),
          randomChoice(moods),
        ]
      );
    } catch (error) {
      console.warn(`  ⚠️  Failed to insert sleep record for ${formatDate(date)}:`, error);
    }
  }

  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sleep_records'
  );

  console.log(`✅ ${count?.count || 0} sleep records seeded`);
}

/**
 * タスクのテストデータを生成
 */
async function seedTasks(
  database: SQLite.SQLiteDatabase,
  taskCount: number = 20
): Promise<void> {
  console.log(`📥 Seeding ${taskCount} tasks...`);

  const taskTitles = [
    '朝のストレッチ',
    '日記を書く',
    '瞑想10分',
    '散歩30分',
    'カフェイン制限',
    '夜の読書',
    '寝室の掃除',
    '温度調整',
    '深呼吸練習',
    'アロマテラピー',
    '音楽リラクゼーション',
    'ヨガ',
    'プログレッシブリラクセーション',
    '入浴タイム',
    'デジタルデトックス',
  ];

  const statuses: Array<'pending' | 'done'> = ['pending', 'done'];
  const emotions = ['😊', '😌', '😫', '😡', '😭', '😴', null];

  for (let i = 0; i < taskCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - randomInt(0, 7)); // 過去1週間のランダムな日

    const status = randomChoice(statuses);
    const emotion = status === 'done' ? randomChoice(emotions.slice(0, -1)) : null;

    try {
      await database.runAsync(
        `INSERT INTO tasks (title, date, status, emotion)
         VALUES (?, ?, ?, ?)`,
        [randomChoice(taskTitles), formatDate(date), status, emotion]
      );
    } catch (error) {
      console.warn(`  ⚠️  Failed to insert task:`, error);
    }
  }

  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tasks'
  );

  console.log(`✅ ${count?.count || 0} tasks seeded`);
}

/**
 * 気分記録のテストデータを生成
 */
async function seedUserMood(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('📥 Seeding user mood records...');

  const moods = ['😊', '😌', '😐', '😟', '😫'];
  const notes = [
    'とても良い気分',
    '普通の一日',
    '少し疲れた',
    'ストレスを感じる',
    'リラックスできた',
    null,
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // 1日に2-3回記録
    const recordsPerDay = randomInt(2, 3);
    for (let j = 0; j < recordsPerDay; j++) {
      const hour = j === 0 ? randomInt(8, 12) : j === 1 ? randomInt(13, 18) : randomInt(19, 22);
      const minute = randomInt(0, 59);
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      try {
        await database.runAsync(
          `INSERT INTO user_mood (date, time, mood, note)
           VALUES (?, ?, ?, ?)`,
          [formatDate(date), time, randomChoice(moods), randomChoice(notes)]
        );
      } catch (error) {
        console.warn(`  ⚠️  Failed to insert mood record:`, error);
      }
    }
  }

  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_mood'
  );

  console.log(`✅ ${count?.count || 0} mood records seeded`);
}

/**
 * AIアドバイスのテストデータを生成
 */
async function seedAIAdvice(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('📥 Seeding AI advice records...');

  const adviceTypes = ['sleep_hygiene', 'activity', 'diet', 'mental', 'routine'];
  const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];

  const adviceContent = {
    sleep_hygiene: [
      '寝室の温度を18-22度に保ちましょう',
      '就寝1時間前からブルーライトを避けましょう',
      '毎日同じ時刻に就寝・起床しましょう',
    ],
    activity: [
      '午前中に軽い運動をすると睡眠の質が向上します',
      '日中に体を動かす時間を増やしましょう',
      '就寝3時間前までに運動を済ませましょう',
    ],
    diet: [
      'カフェイン摂取は14時までに制限しましょう',
      '就寝2-3時間前までに夕食を済ませましょう',
      'アルコールは睡眠の質を低下させます',
    ],
    mental: [
      '寝る前に心配事を書き出してみましょう',
      '瞑想や深呼吸でリラックスしましょう',
      'ポジティブな考えに意識を向けましょう',
    ],
    routine: [
      '就寝前のルーティンを確立しましょう',
      '昼寝は15時前、30分以内にしましょう',
      '週末も同じ睡眠スケジュールを保ちましょう',
    ],
  };

  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() - randomInt(0, 30));

    const type = randomChoice(adviceTypes);
    const content = randomChoice(adviceContent[type as keyof typeof adviceContent]);
    const priority = randomChoice(priorities);

    try {
      await database.runAsync(
        `INSERT INTO ai_advice (date, advice_type, content, priority)
         VALUES (?, ?, ?, ?)`,
        [formatDate(date), type, content, priority]
      );
    } catch (error) {
      console.warn(`  ⚠️  Failed to insert advice:`, error);
    }
  }

  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM ai_advice'
  );

  console.log(`✅ ${count?.count || 0} advice records seeded`);
}

/**
 * データベースの状態を表示
 */
async function showDatabaseStatus(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('\n📊 Database status after seeding:');

  const tables = [
    'sleep_records',
    'tasks',
    'user_mood',
    'ai_advice',
    'daily_missions',
  ];

  for (const table of tables) {
    const result = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${table}`
    );
    console.log(`  - ${table}: ${result?.count || 0} records`);
  }
}

/**
 * コマンドライン引数を解析
 */
function parseArgs(): { days: number; tasks: number } {
  const args = process.argv.slice(2);
  let days = 30;
  let tasks = 20;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) {
      days = parseInt(args[i + 1], 10);
    }
    if (args[i] === '--tasks' && args[i + 1]) {
      tasks = parseInt(args[i + 1], 10);
    }
  }

  return { days, tasks };
}

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  console.log('🚀 Starting test data seeding...\n');

  const { days, tasks } = parseArgs();

  console.log(`Configuration:
  - Sleep records: ${days} days
  - Tasks: ${tasks} items
`);

  try {
    const database = await openDatabase();

    await seedSleepRecords(database, days);
    await seedTasks(database, tasks);
    await seedUserMood(database);
    await seedAIAdvice(database);
    await showDatabaseStatus(database);

    console.log('\n✅ Test data seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Test data seeding failed:', error);
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
  seedSleepRecords,
  seedTasks,
  seedUserMood,
  seedAIAdvice,
  showDatabaseStatus,
  main as seedTestData,
};
