# データベーススクリプト集

このディレクトリには、Mindful RhythmアプリのSQLiteデータベースを管理するスクリプトが含まれています。

---

## 📁 スクリプト一覧

| スクリプト | 説明 | 用途 |
|----------|------|------|
| [initDatabase.ts](#initdatabasets) | データベース初期化 | 初回セットアップ、テーブル作成 |
| [resetDatabase.ts](#resetdatabasets) | データベースリセット | 全データ削除、クリーンアップ |
| [seedTestData.ts](#seedtestdatats) | テストデータ投入 | 開発・デバッグ用データ生成 |

---

## 🚀 クイックスタート

### 初回セットアップ

```bash
# 1. データベースの初期化（テーブル作成 + 初期データ）
npx ts-node scripts/initDatabase.ts
```

### 開発時の使用

```bash
# テストデータを投入
npx ts-node scripts/seedTestData.ts

# データベースをリセット（データのみ削除）
npx ts-node scripts/resetDatabase.ts
```

---

## 📋 詳細ガイド

### initDatabase.ts

**目的**: データベースの初期化とテーブル作成

**実行内容**:
1. `mindful_rhythm.db` データベースファイルを作成
2. 5つのテーブルを作成:
   - `sleep_records` - 睡眠記録
   - `tasks` - タスク管理
   - `user_mood` - 気分記録
   - `ai_advice` - AIアドバイス
   - `daily_missions` - デイリーミッション
3. インデックスを作成（パフォーマンス最適化）
4. デイリーミッションの初期データ（10件）を投入

**使用タイミング**:
- アプリの初回起動前
- データベース構造を変更した後
- 完全に新しいデータベースを作成したい時

**実行方法**:
```bash
npx ts-node scripts/initDatabase.ts
```

**出力例**:
```
🚀 Starting database initialization...

📂 Opening database...
✅ Database opened successfully
🔨 Creating tables...
  ✅ sleep_records table created
  ✅ tasks table created
  ✅ user_mood table created
  ✅ ai_advice table created
  ✅ daily_missions table created
✅ All tables created successfully
🔍 Creating indexes...
  ✅ Index on sleep_records.date created
  ✅ Index on tasks.date created
  ✅ Index on user_mood.date created
✅ All indexes created successfully
📥 Seeding initial data...
✅ Initial data seeded: 10 missions

📋 Tables:
  - sleep_records
  - tasks
  - user_mood
  - ai_advice
  - daily_missions

📊 Record counts:
  - sleep_records: 0 records
  - tasks: 0 records
  - user_mood: 0 records
  - ai_advice: 0 records
  - daily_missions: 10 records

✅ Database initialization completed successfully!
📝 Database file: mindful_rhythm.db
```

---

### resetDatabase.ts

**目的**: データベースのリセット（データ削除）

**実行内容**:
1. 全テーブルのデータを削除（`DELETE FROM`）
2. テーブル構造は維持
3. デイリーミッションの初期データを再投入
4. `VACUUM`でデータベースを最適化

**使用タイミング**:
- テストデータをクリアしたい時
- 開発中にデータをリセットしたい時
- データベースのサイズを縮小したい時

**実行方法**:
```bash
npx ts-node scripts/resetDatabase.ts
```

**インタラクティブモード**:
スクリプトは確認を求めます：
```
⚠️  DATABASE RESET SCRIPT ⚠️

This script will DELETE ALL DATA in the database!

📊 Current database status:
  - sleep_records: 30 records
  - tasks: 20 records
  - user_mood: 90 records
  - ai_advice: 15 records
  - daily_missions: 10 records

⚠️  WARNING: This will delete all data!
Are you sure you want to continue? (y/n):
```

**⚠️ 注意事項**:
- このスクリプトは**すべてのデータを削除**します
- 実行前にデータのバックアップを推奨
- 本番環境では使用しないでください

**出力例**:
```
🚀 Starting database reset...

🗑️  Clearing all tables...
  ✅ sleep_records: 30 records deleted
  ✅ tasks: 20 records deleted
  ✅ user_mood: 90 records deleted
  ✅ ai_advice: 15 records deleted
  ✅ daily_missions: 10 records deleted
✅ All tables cleared successfully
📥 Reseeding daily missions...
✅ 10 missions reseeded
🧹 Vacuuming database...
✅ Database vacuumed successfully

📊 Current database status:
  - sleep_records: 0 records
  - tasks: 0 records
  - user_mood: 0 records
  - ai_advice: 0 records
  - daily_missions: 10 records

✅ Database reset completed successfully!
```

---

### seedTestData.ts

**目的**: 開発・テスト用のサンプルデータを投入

**実行内容**:
1. 30日分の睡眠記録を生成（様々なパターン）
2. 20個のタスクを生成
3. 気分記録を生成（1日2-3回 × 30日）
4. AIアドバイスを15件生成

**使用タイミング**:
- 開発中の動作確認
- UI/UXのテスト
- デモ・プレゼンテーション準備
- パフォーマンステスト

**実行方法**:
```bash
# デフォルト設定（30日分の睡眠記録、20個のタスク）
npx ts-node scripts/seedTestData.ts

# カスタム設定
npx ts-node scripts/seedTestData.ts --days 60 --tasks 50
```

**オプション**:
- `--days <number>`: 生成する睡眠記録の日数（デフォルト: 30）
- `--tasks <number>`: 生成するタスクの数（デフォルト: 20）

**出力例**:
```
🚀 Starting test data seeding...

Configuration:
  - Sleep records: 30 days
  - Tasks: 20 items

📂 Opening database...
✅ Database opened successfully
📥 Seeding 30 days of sleep records...
✅ 30 sleep records seeded
📥 Seeding 20 tasks...
✅ 20 tasks seeded
📥 Seeding user mood records...
✅ 90 mood records seeded
📥 Seeding AI advice records...
✅ 15 advice records seeded

📊 Database status after seeding:
  - sleep_records: 30 records
  - tasks: 20 records
  - user_mood: 90 records
  - ai_advice: 15 records
  - daily_missions: 10 records

✅ Test data seeding completed successfully!
```

**生成されるデータの特徴**:
- **睡眠記録**: 良好・普通・不良の3パターンをランダムに生成
- **タスク**: 様々な状態（完了/未完了）と感情を含む
- **気分記録**: 1日に複数回の記録
- **AIアドバイス**: 5つのカテゴリ（睡眠衛生、活動、食事、メンタル、ルーティン）

---

## 🔄 一般的なワークフロー

### 新規開発の開始

```bash
# 1. データベース初期化
npx ts-node scripts/initDatabase.ts

# 2. テストデータ投入
npx ts-node scripts/seedTestData.ts

# 3. アプリ起動
npx expo start
```

---

### 開発中のデータリセット

```bash
# 1. データをリセット
npx ts-node scripts/resetDatabase.ts

# 2. 新しいテストデータを投入
npx ts-node scripts/seedTestData.ts --days 7 --tasks 10

# 3. アプリを再起動（リロード）
```

---

### デモ準備

```bash
# リアルなデータで準備
npx ts-node scripts/resetDatabase.ts
npx ts-node scripts/seedTestData.ts --days 60 --tasks 30
```

---

## 🐛 トラブルシューティング

### エラー: "Cannot find module 'expo-sqlite'"

**原因**: 依存関係がインストールされていない

**解決方法**:
```bash
npm install expo-sqlite --legacy-peer-deps
```

---

### エラー: "Database file not found"

**原因**: データベースファイルが存在しない

**解決方法**:
```bash
# データベースを初期化
npx ts-node scripts/initDatabase.ts
```

---

### エラー: "Table already exists"

**原因**: データベースが既に初期化されている

**解決方法**:
```bash
# オプション1: リセットしてから初期化
npx ts-node scripts/resetDatabase.ts
npx ts-node scripts/initDatabase.ts

# オプション2: 既存のDBをそのまま使用
# （エラーは無視してOK）
```

---

### Expo環境での実行方法

これらのスクリプトはNode.js環境で実行されますが、Expo環境でも同様の処理を行いたい場合：

**App.tsx で実行**:
```typescript
import { initializeDatabase } from './scripts/initDatabase';
import { seedTestData } from './scripts/seedTestData';

useEffect(() => {
  const setupDatabase = async () => {
    try {
      await initializeDatabase();

      // 開発環境でのみテストデータを投入
      if (__DEV__) {
        await seedTestData();
      }

      console.log('✅ Database setup complete');
    } catch (error) {
      console.error('❌ Database setup failed:', error);
    }
  };

  setupDatabase();
}, []);
```

---

## 📊 データベーススキーマ

### sleep_records テーブル

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INTEGER | 主キー |
| date | TEXT | 日付（YYYY-MM-DD） |
| bedtime | TEXT | 就寝時刻（HH:MM） |
| waketime | TEXT | 起床時刻（HH:MM） |
| total_hours | REAL | 総睡眠時間 |
| score | INTEGER | 睡眠スコア（0-100） |
| sleep_quality | TEXT | 睡眠の質 |
| awakenings | INTEGER | 中途覚醒回数 |
| sleep_latency | INTEGER | 入眠潜時（分） |
| tags | TEXT | 環境タグ（カンマ区切り） |
| dream | TEXT | 夢の内容 |
| mood | TEXT | 起床時の気分 |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

---

### tasks テーブル

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INTEGER | 主キー |
| title | TEXT | タスク名 |
| date | TEXT | 日付（YYYY-MM-DD） |
| status | TEXT | 状態（pending/done） |
| emotion | TEXT | 完了時の感情 |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

---

### user_mood テーブル

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INTEGER | 主キー |
| date | TEXT | 日付（YYYY-MM-DD） |
| time | TEXT | 時刻（HH:MM） |
| mood | TEXT | 気分（絵文字） |
| note | TEXT | メモ |
| created_at | TEXT | 作成日時 |

---

### ai_advice テーブル

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INTEGER | 主キー |
| date | TEXT | 日付（YYYY-MM-DD） |
| advice_type | TEXT | アドバイスの種類 |
| content | TEXT | アドバイス内容 |
| priority | TEXT | 優先度（high/medium/low） |
| created_at | TEXT | 作成日時 |

---

### daily_missions テーブル

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INTEGER | 主キー |
| title | TEXT | ミッション名 |
| description | TEXT | 説明 |
| category | TEXT | カテゴリ |
| points | INTEGER | ポイント |
| created_at | TEXT | 作成日時 |

---

## 🔒 セキュリティ注意事項

- **本番環境では使用禁止**: これらのスクリプトは開発・テスト専用です
- **データバックアップ**: リセット前に重要なデータはバックアップしてください
- **アクセス制御**: 本番データベースへのアクセスは厳格に制限してください

---

## 📚 関連ドキュメント

- [src/services/database.ts](../src/services/database.ts) - データベースサービス実装
- [docs/tasks/common/database_verification.md](../docs/tasks/common/database_verification.md) - データベース検証テスト
- [SQLite公式ドキュメント](https://www.sqlite.org/docs.html)
- [expo-sqlite ドキュメント](https://docs.expo.dev/versions/latest/sdk/sqlite/)

---

**作成日**: 2025年10月30日
**最終更新**: 2025年10月30日
