# Mindful Rhythm 要件定義書

**プロジェクト名**: Mindful Rhythm（マインドフル・リズム）
**作成日**: 2025年10月30日
**バージョン**: v0.1
**作成者**: 短期大学部ゼミ開発チーム + Claude AI支援
**文書種別**: 最終要件定義書（調査方針プロセス: Phase 3）

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [機能要件](#2-機能要件)
3. [非機能要件](#3-非機能要件)
4. [睡眠スコアアルゴリズム詳細](#4-睡眠スコアアルゴリズム詳細)
5. [データベース設計](#5-データベース設計)
6. [UI/UX設計](#6-uiux設計)
7. [技術仕様](#7-技術仕様)
8. [開発計画](#8-開発計画)
9. [テスト戦略](#9-テスト戦略)
10. [リスク管理](#10-リスク管理)
11. [研究計画](#11-研究計画)
12. [成功基準](#12-成功基準)

---

## 1. プロジェクト概要

### 1.1 背景と目的

**背景**:
- 日本人の約20%が不眠症状を抱える（厚生労働省調査）
- 睡眠負債による経済損失は年間15兆円（ランド研究所）
- 従来の睡眠アプリは単なる記録にとどまり、行動変容につながりにくい

**目的**:
1. **教育的目的**: React Native (Expo) によるモバイルアプリ開発スキル習得
2. **研究的目的**: CBT-I理論に基づく睡眠スコアアルゴリズムの設計・検証
3. **実用的目的**: ユーザーの睡眠・感情・行動の相関理解と生活リズム改善支援

### 1.2 コンセプト

「心と体のリズムを整え、毎日をより充実させるための、あなただけのウェルネスコンシェルジュ。」

### 1.3 ターゲットユーザー

**主要ターゲット**: 20～30代の社会人・学生（睡眠習慣改善に関心のある層）

**ペルソナ**:
- **氏名**: 田中 美咲（25歳、会社員）
- **課題**: 不規則な勤務で睡眠不足、朝の目覚めが悪い、日中の集中力低下
- **ニーズ**: 睡眠の質を可視化し、具体的な改善行動を知りたい
- **利用シーン**: 就寝前・起床後の記録、通勤中のグラフ確認

### 1.4 研究価値

**新規性**:
- CBT-I理論に基づく睡眠スコア算出アルゴリズム
- 睡眠・感情・行動の統合的相関分析
- センサーフュージョンによる睡眠状態推定（将来拡張）

**妥当性検証**:
- PSQI（Pittsburgh Sleep Quality Index）との相関分析
- 被験者10名、期間2週間、目標相関係数 r ≥ 0.7

**価値評価**: 研究価値⭐⭐⭐⭐、教育価値⭐⭐⭐⭐⭐、実用価値⭐⭐⭐⭐（総合4.6/5.0）

---

## 2. 機能要件

### 2.1 機能一覧（優先度付き）

| ID | 機能区分 | 機能名 | 概要 | 優先度 | MVP |
|----|---------|--------|------|--------|-----|
| **F-SL-01** | 睡眠管理 | 睡眠記録 | 就寝・起床時間の入力または自動検知 | 高 | ✅ |
| **F-SL-02** | 睡眠管理 | 睡眠スコア計算 | 5指標（時間・深睡眠・覚醒・入眠潜時・環境）から0～100点算出 | 高 | ✅ |
| **F-SL-03** | 睡眠管理 | 睡眠環境日記 | 運動・カフェイン・入浴・室温等のタグ記録 | 高 | ✅ |
| **F-SL-04** | 睡眠管理 | アドバイス提示 | スコアに基づくルールベースアドバイス | 中 | ✅ |
| **F-TM-01** | タスク管理 | ToDoリスト | タスクのCRUD操作 | 高 | ✅ |
| **F-TM-02** | タスク管理 | 感情付き完了 | タスク完了時に6種類の絵文字で感情記録 | 高 | ✅ |
| **F-TM-03** | タスク管理 | 睡眠改善課題 | 毎日1件の行動課題を自動提示 | 中 | ✅ |
| **F-CB-01** | CBT-I支援 | 睡眠日記 | 夢・不安・感情をテキスト／音声で入力 | 中 | ✅ |
| **F-CB-02** | CBT-I支援 | AIインサイト | 睡眠・感情・行動の相関を自動分析・可視化 | 低 | ❌ |
| **F-UI-01** | UI/UX | キャラクター成長 | スリーピンがスコアに応じて表情変化 | 中 | ✅ |
| **F-UI-02** | UI/UX | ホーム背景変化 | 睡眠状態に応じて太陽／月／曇り表示 | 低 | ✅ |
| **F-GR-01** | グラフ分析 | スコア推移グラフ | 週/月単位の折れ線グラフ | 中 | ✅ |
| **F-GR-02** | グラフ分析 | 睡眠時間グラフ | 棒グラフで時間推移表示 | 中 | ✅ |
| **F-GR-03** | グラフ分析 | 相関散布図 | タスク達成率×スコアの散布図 | 低 | ❌ |

**MVP範囲**: ✅マーク11機能（F-CB-02, F-GR-03は拡張機能）

### 2.2 機能詳細仕様

#### 2.2.1 F-SL-02: 睡眠スコア計算

**入力**:
- 就寝時刻（bedtime）: HH:MM形式
- 起床時刻（waketime）: HH:MM形式
- 中途覚醒回数（awakenings）: 整数（手入力）
- 入眠潜時（sleep_latency）: 分単位（手入力）
- 環境タグ（tags）: ["運動", "カフェインなし", "入浴", "室温適正"]

**出力**:
- 睡眠スコア（score）: 0～100点の整数

**詳細アルゴリズムは [4. 睡眠スコアアルゴリズム詳細](#4-睡眠スコアアルゴリズム詳細) 参照**

---

#### 2.2.2 F-TM-03: 睡眠改善課題

**課題リスト** ※初期データとしてDBに登録:
1. 寝る1時間前はスマホ・PC禁止
2. カフェインは15時以降摂取しない
3. 就寝2時間前に軽い運動（ストレッチ・散歩）
4. 寝室の温度を18～22℃に保つ
5. 就寝前に入浴（38～40℃、15分）
6. 毎日同じ時刻に就寝・起床する
7. 昼寝は15分以内、15時前に済ませる
8. 寝室を暗く静かに保つ（遮光カーテン・耳栓）
9. 就寝前にリラクゼーション（深呼吸・瞑想）
10. 寝る前にアルコール・タバコを避ける

**提示ロジック**:
- 毎日ランダムに1件を選択（前日と同じ課題は避ける）
- タスク管理画面上部に「今日の睡眠改善課題」として表示

---

## 3. 非機能要件

### 3.1 パフォーマンス

| 項目 | 目標値 | 測定方法 | 測定対象操作 |
|------|--------|---------|-------------|
| 起動速度 | 5秒以内 | Expo Performance Monitor | アプリ起動～ホーム画面表示 |
| 操作レスポンス | 1秒以内 | 実測（10操作平均） | ボタンタップ～画面遷移 |
| スコア算出速度 | 0.5秒以内 | 実測 | 「スコア計算」ボタン押下～表示 |
| グラフ描画速度 | 2秒以内 | 実測 | グラフ画面表示（30日分データ） |
| データベースクエリ | 0.1秒以内 | SQLite EXPLAIN QUERY PLAN | 1000件のSELECT |

**測定対象10操作**:
1. ホーム→睡眠記録画面
2. 睡眠記録→スコア計算
3. タスク追加→保存
4. タスク完了→感情選択
5. グラフ画面表示
6. 週/月タブ切替
7. 睡眠日記入力→保存
8. 設定画面表示
9. データエクスポート
10. 通知設定変更

### 3.2 セキュリティ

| 項目 | 要件 | 実装方法 |
|------|------|---------|
| データ暗号化 | 夢・日記の記録を暗号化保存 | expo-secure-storeでキー管理 → AES暗号化 |
| プライバシー | センサー利用の明示的同意取得 | 初回起動時に同意画面表示 |
| データバックアップ | ユーザーがJSON形式でエクスポート可能 | 設定画面の「データエクスポート」機能 |
| アクセス制御 | 端末ロック解除者のみアクセス可 | OSのロック機能に依存 |

### 3.3 ユーザビリティ

| 項目 | 要件 |
|------|------|
| 初回利用 | チュートリアルなしで基本操作理解可能 |
| エラーメッセージ | 具体的な対処方法を提示（「起床時刻は就寝時刻より後に設定」等） |
| 入力支援 | デフォルト値設定（覚醒回数0回、入眠潜時15分） |
| コントラスト比 | 主要テキストで4.5:1以上（WCAG 2.1 Level AA） |
| accessibilityLabel | 重要要素に必須設定 |

### 3.4 保守性

| 項目 | 要件 |
|------|------|
| コンポーネント分割 | 画面単位でファイル分割（screens/）、共通コンポーネント（components/） |
| コードカバレッジ | 70%以上（ロジック層は90%以上） |
| ドキュメント | README.md、API仕様書、コンポーネント説明 |
| TypeScript | 型定義によるコード品質向上 |

### 3.5 互換性

| 項目 | 要件 |
|------|------|
| iOS | iOS 13以降 |
| Android | Android 8（API 26）以降 |
| 画面サイズ | 4.7インチ～6.7インチ対応 |
| 言語 | 日本語のみ（MVP）、将来的に英語対応 |

---

## 4. 睡眠スコアアルゴリズム詳細

### 4.1 算出式

```
睡眠スコア = Σ(各指標スコア × 重み係数)

= 睡眠時間スコア × 0.30
  + 深睡眠スコア × 0.25
  + 中途覚醒スコア × 0.20
  + 入眠潜時スコア × 0.15
  + 環境スコア × 0.10
```

### 4.2 各指標の計算方法

#### 4.2.1 睡眠時間スコア（重み30%）

**計算式**:
```javascript
const totalHours = (waketime - bedtime) / 3600; // 秒→時間
const sleepTimeScore = Math.min((totalHours / 7.0) * 100, 100);
```

**根拠**: 推奨睡眠時間7時間（National Sleep Foundation）

**スコア例**:
- 5時間: 71点
- 7時間: 100点
- 8時間: 100点（上限）

---

#### 4.2.2 深睡眠スコア（重み25%）

**MVP版（簡易）**:
```javascript
// 手入力: 「よく眠れた」「普通」「浅かった」
const deepSleepScore = {
  'よく眠れた': 100,
  '普通': 70,
  '浅かった': 40
}[userInput];
```

**将来版（センサー）**:
```javascript
// 加速度センサーで体動検知
const magnitude = Math.sqrt(x*x + y*y + z*z);
const movementRatio = (高活動時間 / 総睡眠時間);
const deepSleepScore = Math.max(100 - movementRatio * 200, 0);
```

**根拠**: 深睡眠比率20%が理想（Sleep Foundation）

---

#### 4.2.3 中途覚醒スコア（重み20%）

**計算式**:
```javascript
const awakeningsScore = Math.max(100 - (awakenings * 10), 0);
```

**スコア例**:
- 0回: 100点
- 1回: 90点
- 3回: 70点
- 10回以上: 0点

**根拠**: 覚醒回数が多いほど睡眠の質が低下（PSQI指標）

---

#### 4.2.4 入眠潜時スコア（重み15%）

**計算式**:
```javascript
const latencyScore = Math.max(100 - (sleep_latency - 15) * 2, 0);
```

**スコア例**:
- 10分: 110点 → 100点（上限）
- 15分: 100点（理想）
- 30分: 70点
- 50分以上: 0点

**根拠**: 15分以内の入眠が理想（Sleep Foundation）

---

#### 4.2.5 環境スコア（重み10%）

**計算式**:
```javascript
let envScore = 0;
if (tags.includes('運動')) envScore += 5;
if (tags.includes('カフェインなし')) envScore += 5;
if (tags.includes('入浴')) envScore += 3;
if (tags.includes('室温適正')) envScore += 2;
// 合計15点満点 → 100点満点に変換
envScore = (envScore / 15) * 100;
```

**根拠**: CBT-Iの睡眠衛生教育（AASM推奨）

---

### 4.3 実装例（TypeScript）

```typescript
interface SleepData {
  bedtime: string;      // "23:30"
  waketime: string;     // "06:45"
  sleepQuality: 'よく眠れた' | '普通' | '浅かった';
  awakenings: number;
  sleep_latency: number;
  tags: string[];
}

function calculateSleepScore(data: SleepData): number {
  // 睡眠時間計算（翌日またぎ対応）
  const bed = parseTime(data.bedtime);
  const wake = parseTime(data.waketime);
  let totalHours = (wake - bed) / 3600;
  if (totalHours < 0) totalHours += 24; // 翌日またぎ補正

  // 各指標スコア計算
  const sleepTimeScore = Math.min((totalHours / 7.0) * 100, 100);

  const deepSleepScore = {
    'よく眠れた': 100,
    '普通': 70,
    '浅かった': 40
  }[data.sleepQuality];

  const awakeningsScore = Math.max(100 - (data.awakenings * 10), 0);

  const latencyScore = Math.max(100 - (data.sleep_latency - 15) * 2, 0);

  let envScore = 0;
  if (data.tags.includes('運動')) envScore += 5;
  if (data.tags.includes('カフェインなし')) envScore += 5;
  if (data.tags.includes('入浴')) envScore += 3;
  if (data.tags.includes('室温適正')) envScore += 2;
  envScore = (envScore / 15) * 100;

  // 重み付け合計
  const totalScore =
    sleepTimeScore * 0.30 +
    deepSleepScore * 0.25 +
    awakeningsScore * 0.20 +
    latencyScore * 0.15 +
    envScore * 0.10;

  return Math.round(totalScore);
}
```

### 4.4 文献的根拠

| 指標 | 出典 | エビデンスレベル |
|------|------|----------------|
| 推奨睡眠時間7時間 | National Sleep Foundation | A（専門家コンセンサス） |
| 深睡眠比率20% | Sleep Foundation | A |
| PSQI（睡眠の質評価） | Buysse et al. (1989) | A（国際標準） |
| CBT-I（認知行動療法） | AASM Clinical Practice Guideline | A（推奨治療） |
| 入眠潜時15分 | Sleep Foundation | B（臨床研究） |

---

## 5. データベース設計

### 5.1 テーブル定義（DDL）

#### 5.1.1 sleep_records テーブル

```sql
CREATE TABLE sleep_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,           -- YYYY-MM-DD
  bedtime TEXT NOT NULL,                -- HH:MM
  waketime TEXT NOT NULL,               -- HH:MM
  total_hours REAL,                     -- 計算値
  score INTEGER CHECK (score >= 0 AND score <= 100),
  sleep_quality TEXT CHECK (sleep_quality IN ('よく眠れた', '普通', '浅かった')),
  awakenings INTEGER DEFAULT 0,
  sleep_latency INTEGER DEFAULT 15,    -- 入眠潜時（分）
  tags TEXT,                            -- JSON配列 ["運動", "カフェインなし"]
  dream TEXT,                           -- 夢の記録（暗号化対象）
  mood TEXT,                            -- 絵文字
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_sleep_records_date ON sleep_records(date DESC);

CREATE TRIGGER update_sleep_records_timestamp
AFTER UPDATE ON sleep_records
BEGIN
  UPDATE sleep_records SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;
```

---

#### 5.1.2 tasks テーブル

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                   -- YYYY-MM-DD
  task TEXT NOT NULL CHECK (length(task) >= 1 AND length(task) <= 200),
  status TEXT CHECK (status IN ('todo', 'done')) DEFAULT 'todo',
  emotion TEXT,                         -- 絵文字（😊 😌 😫 😡 😭 😴）
  is_daily_mission BOOLEAN DEFAULT 0,   -- 睡眠改善課題フラグ
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_tasks_date ON tasks(date DESC);
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE TRIGGER update_tasks_timestamp
AFTER UPDATE ON tasks
BEGIN
  UPDATE tasks SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;
```

---

#### 5.1.3 user_mood テーブル

```sql
CREATE TABLE user_mood (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,            -- YYYY-MM-DD
  morning_mood TEXT,                    -- 朝の気分（絵文字）
  night_mood TEXT,                      -- 夜の気分（絵文字）
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_user_mood_date ON user_mood(date DESC);

CREATE TRIGGER update_user_mood_timestamp
AFTER UPDATE ON user_mood
BEGIN
  UPDATE user_mood SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;
```

---

#### 5.1.4 ai_advice テーブル

```sql
CREATE TABLE ai_advice (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                   -- YYYY-MM-DD
  advice_text TEXT NOT NULL,
  advice_type TEXT CHECK (advice_type IN ('breathing', 'bgm', 'stretch', 'sleep_hygiene')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_ai_advice_date ON ai_advice(date DESC);
```

---

#### 5.1.5 daily_missions テーブル（マスタデータ）

```sql
CREATE TABLE daily_missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_text TEXT NOT NULL UNIQUE,
  category TEXT CHECK (category IN ('sleep_hygiene', 'exercise', 'relaxation', 'environment'))
);

-- 初期データINSERT
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
```

---

### 5.2 ER図

```
┌─────────────────┐
│ sleep_records   │
├─────────────────┤
│ id (PK)         │
│ date (UNIQUE)   │──┐
│ bedtime         │  │
│ waketime        │  │
│ score           │  │
│ ...             │  │
└─────────────────┘  │
                     │ 1:1
┌─────────────────┐  │
│ user_mood       │  │
├─────────────────┤  │
│ id (PK)         │  │
│ date (UNIQUE)   │──┘
│ morning_mood    │
│ night_mood      │
└─────────────────┘

┌─────────────────┐
│ tasks           │
├─────────────────┤
│ id (PK)         │
│ date            │──┐
│ task            │  │ 1:N
│ status          │  │
│ emotion         │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│ daily_missions  │  │
├─────────────────┤  │
│ id (PK)         │──┘ (参照のみ)
│ mission_text    │
│ category        │
└─────────────────┘
```

### 5.3 TypeScript型定義

```typescript
// src/types/database.ts

export interface SleepRecord {
  id: number;
  date: string;                    // YYYY-MM-DD
  bedtime: string;                 // HH:MM
  waketime: string;                // HH:MM
  total_hours?: number;
  score?: number;                  // 0～100
  sleep_quality?: 'よく眠れた' | '普通' | '浅かった';
  awakenings?: number;
  sleep_latency?: number;          // 分
  tags?: string[];                 // JSONパース後
  dream?: string;
  mood?: string;
  created_at: number;              // UNIX timestamp
  updated_at: number;
}

export interface Task {
  id: number;
  date: string;
  task: string;
  status: 'todo' | 'done';
  emotion?: string;
  is_daily_mission: boolean;
  created_at: number;
  updated_at: number;
}

export interface UserMood {
  id: number;
  date: string;
  morning_mood?: string;
  night_mood?: string;
  created_at: number;
  updated_at: number;
}

export interface AIAdvice {
  id: number;
  date: string;
  advice_text: string;
  advice_type: 'breathing' | 'bgm' | 'stretch' | 'sleep_hygiene';
  created_at: number;
}

export interface DailyMission {
  id: number;
  mission_text: string;
  category: 'sleep_hygiene' | 'exercise' | 'relaxation' | 'environment';
}
```

---

## 6. UI/UX設計

### 6.1 画面一覧

| 画面ID | 画面名 | ファイルパス | 主要機能 |
|-------|--------|------------|---------|
| SC-01 | 起動画面 | screens/SplashScreen.tsx | ロゴ表示・DB初期化 |
| SC-02 | ログイン | screens/AuthScreen.tsx | 名前・メール入力（将来機能） |
| SC-03 | ホーム | screens/HomeScreen.tsx | スコア表示・キャラクター・ナビゲーションハブ |
| SC-04 | 睡眠記録 | screens/SleepTrackerScreen.tsx | 睡眠入力・スコア算出・環境記録 |
| SC-05 | タスク管理 | screens/TaskJournalScreen.tsx | ToDo CRUD・感情入力・課題提示 |
| SC-06 | グラフ分析 | screens/StatisticsScreen.tsx | スコア推移・睡眠時間グラフ |
| SC-07 | 睡眠日記 | screens/SleepDiaryScreen.tsx | 夢・感情記録・履歴表示 |
| SC-08 | 設定 | screens/SettingsScreen.tsx | 通知・テーマ・データエクスポート |

### 6.2 共通デザイン仕様

**カラーパレット**:
```typescript
export const Colors = {
  primary: '#0F172A',      // 夜ネイビー
  accent: '#F59E0B',       // 朝オレンジ
  success: '#22C55E',      // 緑
  warning: '#F59E0B',      // オレンジ
  error: '#EF4444',        // 赤
  background: '#1E293B',   // ダークグレー
  surface: '#334155',      // カード背景
  text: '#F1F5F9',         // 白テキスト
  textSecondary: '#94A3B8' // グレーテキスト
};
```

**タイポグラフィ**:
```typescript
export const Typography = {
  h1: { fontSize: 24, fontWeight: '700', fontFamily: 'NotoSansJP-Bold' },
  h2: { fontSize: 20, fontWeight: '600', fontFamily: 'NotoSansJP-Medium' },
  h3: { fontSize: 18, fontWeight: '600', fontFamily: 'NotoSansJP-Medium' },
  body: { fontSize: 14, fontWeight: '400', fontFamily: 'NotoSansJP-Regular' },
  caption: { fontSize: 12, fontWeight: '400', fontFamily: 'NotoSansJP-Regular' }
};
```

**ナビゲーション**:
- Bottom Tab Navigation（5タブ: ホーム／睡眠／タスク／グラフ／設定）
- Stack Navigation（ログイン → ホーム → 詳細画面）
- Modal Navigation（感情選択・環境入力・アドバイス表示）

### 6.3 主要画面ワイヤーフレーム

**SC-03: ホーム画面**
```
┌──────────────────────────┐
│ [≡] Mindful Rhythm  [👤]│ ← Header
├──────────────────────────┤
│  おはよう、田中さん！      │
│                          │
│  ┌────────────────┐      │
│  │    スリーピン    │      │
│  │      😊         │      │ ← キャラクター
│  │                │      │
│  └────────────────┘      │
│                          │
│  ┌────────────────┐      │
│  │ 今日の睡眠スコア │      │
│  │      82点      │      │ ← 円形ゲージ
│  │   ●●●●●○○    │      │
│  └────────────────┘      │
│                          │
│  今日のタスク (2/5完了)   │
│  ☑ 寝る1時間前スマホ禁止  │ ← タスク一覧
│  ☐ 15時以降カフェイン禁止 │
│  ...                     │
├──────────────────────────┤
│ [🏠] [😴] [📝] [📊] [⚙️] │ ← Bottom Tab
└──────────────────────────┘
```

---

## 7. 技術仕様

### 7.1 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|----------|------|
| **フレームワーク** | React Native | 0.72+ | UI実装 |
| **開発環境** | Expo | SDK 50 (LTS) | 開発・ビルド・デプロイ |
| **言語** | TypeScript | 5.0+ | 型安全性 |
| **ナビゲーション** | React Navigation | 6.x | 画面遷移 |
| **データベース** | expo-sqlite | - | ローカルDB |
| **グラフ** | Victory Native | 36.x | データ可視化 |
| **センサー** | expo-sensors | - | 加速度検知 |
| **暗号化** | expo-secure-store | - | データ保護 |
| **通知** | expo-notifications | - | 就寝リマインダー |
| **テスト** | Jest + RNTL | - | ユニット・E2Eテスト |
| **バージョン管理** | Git / GitHub | - | コード管理 |

### 7.2 ディレクトリ構成

```
Mindful_Rhythm/
├── src/
│   ├── screens/              # 画面コンポーネント
│   │   ├── HomeScreen.tsx
│   │   ├── SleepTrackerScreen.tsx
│   │   ├── TaskJournalScreen.tsx
│   │   ├── StatisticsScreen.tsx
│   │   ├── SleepDiaryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/           # 共通コンポーネント
│   │   ├── ScoreGauge.tsx
│   │   ├── TaskCard.tsx
│   │   ├── EmotionPicker.tsx
│   │   └── CharacterAvatar.tsx
│   ├── navigation/           # ナビゲーション設定
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── services/             # ビジネスロジック
│   │   ├── database.ts
│   │   ├── sleepScoreCalculator.ts
│   │   ├── adviceGenerator.ts
│   │   └── sensorManager.ts
│   ├── types/                # TypeScript型定義
│   │   └── database.ts
│   ├── utils/                # ユーティリティ
│   │   ├── dateFormatter.ts
│   │   └── encryption.ts
│   ├── constants/            # 定数
│   │   ├── Colors.ts
│   │   └── Typography.ts
│   └── App.tsx               # エントリーポイント
├── assets/                   # 画像・フォント
│   ├── images/
│   └── fonts/
├── __tests__/                # テストファイル
│   ├── sleepScoreCalculator.test.ts
│   └── database.test.ts
├── app.json                  # Expo設定
├── package.json
├── tsconfig.json
└── README.md
```

### 7.3 データフロー

```
[User Input]
    ↓
[Screen Component]
    ↓
[Service Layer (sleepScoreCalculator.ts)]
    ↓
[Database Layer (database.ts)]
    ↓
[SQLite (expo-sqlite)]
    ↓
[Service Layer] ← データ取得
    ↓
[Screen Component] ← 表示更新
    ↓
[User View]
```

---

## 8. 開発計画

### 8.1 開発体制

| 役割 | 担当者 | 主な責務 |
|------|--------|---------|
| プロジェクトマネージャ | 増田 | 設計・進行管理・研究方針・睡眠スコアアルゴリズム |
| UI/UXデザイナ | 藤川 | 画面設計・スタイリング・アニメーション |
| モバイルエンジニア | 立川 | React Native実装・DB設計・センサー連携 |
| AI機能調査 | 全員 | ChatGPT/Claude活用・AIアドバイス生成 |

### 8.2 開発スケジュール（8週間）

#### Week 1-2: 環境構築・基礎学習

**マイルストーンM1**: 開発環境完全構築

**タスク**:
- [ ] Expo CLI インストール、Hello World動作確認（立川）
- [ ] React Navigation 学習・実装（Bottom Tab）（全員）
- [ ] SQLite DDL実装・初期化スクリプト作成（立川）
- [ ] Victory ライブラリ動作確認（立川）
- [ ] ホーム画面モックアップ実装（藤川+立川）
- [ ] Git/GitHub リポジトリ設定・ブランチ戦略確立（全員）
- [ ] TypeScript型定義作成（database.ts）（立川）

**成果物**: 環境構築完了、ホーム画面モック

---

#### Week 3-4: コア機能実装

**マイルストーンM2**: MVP動作確認

**タスク**:
- [ ] 睡眠記録画面UI実装（藤川+立川）
- [ ] 睡眠スコア算出ロジック実装（増田+AI → 立川が統合）
- [ ] データベースCRUD操作実装（立川）
- [ ] タスク管理画面UI実装（CRUD）（立川）
- [ ] 感情選択モーダル実装（藤川+立川）
- [ ] 睡眠改善課題の自動提示ロジック（増田+立川）
- [ ] ホーム画面とDB連携（スコア表示）（立川）

**成果物**: 睡眠記録・タスク管理の基本機能動作

---

#### Week 5-6: 拡張機能実装

**マイルストーンM3**: 全機能実装完了

**タスク**:
- [ ] グラフ分析画面実装（Victory統合）（立川）
- [ ] 週/月タブ切替実装（立川）
- [ ] 睡眠日記画面実装（テキスト入力・履歴）（立川）
- [ ] 設定画面実装（通知設定・データエクスポート）（立川）
- [ ] AIアドバイス生成ロジック（ルールベース）（増田+AI）
- [ ] センサー統合（加速度センサー簡易版）（立川）
- [ ] キャラクター「スリーピン」のアニメーション（藤川）
- [ ] PSQI相関実験開始（被験者募集）（増田）

**成果物**: 全画面実装完了、実験開始

---

#### Week 7: 統合・最適化（バッファ週）

**マイルストーンM4**: リリース候補版完成

**タスク**:
- [ ] E2Eテスト実施（全画面遷移確認）（全員）
- [ ] パフォーマンス最適化（起動速度・操作レスポンス）（立川）
- [ ] UI/UX調整（ユーザビリティテスト）（藤川）
- [ ] バグ修正（優先度順）（全員）
- [ ] データベースインデックス最適化（立川）
- [ ] プライバシーポリシー策定（増田）
- [ ] PSQI相関実験データ収集完了（増田）

**成果物**: リリース候補版、実験データ

---

#### Week 8: 最終調整・プレゼン準備

**マイルストーンM5**: デモ準備完了

**タスク**:
- [ ] 最終動作確認（全機能テスト）（全員）
- [ ] PSQI相関分析（Excel/Python）（増田）
- [ ] ポスター作成（研究背景・手法・結果・考察）（全員）
- [ ] プレゼン資料作成（PowerPoint）（全員）
- [ ] デモ実演リハーサル（全員）
- [ ] README.md 完成版作成（立川）

**マイルストーンM6**: 発表会実施（12月26日）

**成果物**: ポスター、プレゼン資料、動作確認済みアプリ

---

### 8.3 工数見積もり

| 機能 | 見積工数 | 担当 |
|------|---------|------|
| 環境構築 | 4h | 立川 |
| DB設計・実装 | 12h | 立川 |
| ホーム画面 | 8h | 藤川+立川 |
| 睡眠記録画面 | 16h | 立川 |
| タスク管理画面 | 12h | 立川 |
| グラフ分析画面 | 10h | 立川 |
| 睡眠日記画面 | 8h | 立川 |
| 設定画面 | 4h | 立川 |
| モーダル | 6h | 藤川+立川 |
| AIロジック | 6h | 増田+AI |
| センサー統合 | 8h | 立川 |
| UI/UX | 16h | 藤川 |
| テスト | 12h | 全員 |
| バグ修正 | 16h | 全員 |
| ドキュメント | 12h | 全員 |
| **合計** | **150h** | - |

**リソース**: 3名 × 週10時間 × 8週間 = 240時間
**余裕率**: 60%（90時間バッファ）

---

## 9. テスト戦略

### 9.1 テストツール

- **ユニットテスト**: Jest
- **コンポーネントテスト**: React Native Testing Library (RNTL)
- **E2Eテスト**: 手動テスト（Expo Go）

### 9.2 テストカバレッジ目標

| レイヤー | カバレッジ目標 |
|---------|--------------|
| ロジック層（services/） | 90%以上 |
| コンポーネント層（components/） | 70%以上 |
| 画面層（screens/） | 50%以上 |
| **全体** | **70%以上** |

### 9.3 テストケース例

#### 9.3.1 sleepScoreCalculator.test.ts

```typescript
import { calculateSleepScore } from '../services/sleepScoreCalculator';

describe('睡眠スコア計算', () => {
  test('理想的な睡眠でスコア100点', () => {
    const data = {
      bedtime: '23:00',
      waketime: '06:00',
      sleepQuality: 'よく眠れた',
      awakenings: 0,
      sleep_latency: 15,
      tags: ['運動', 'カフェインなし', '入浴', '室温適正']
    };
    expect(calculateSleepScore(data)).toBeGreaterThanOrEqual(95);
  });

  test('睡眠不足でスコア低下', () => {
    const data = {
      bedtime: '02:00',
      waketime: '06:00',
      sleepQuality: '浅かった',
      awakenings: 3,
      sleep_latency: 40,
      tags: []
    };
    expect(calculateSleepScore(data)).toBeLessThan(50);
  });

  test('翌日またぎの睡眠時間計算', () => {
    const data = {
      bedtime: '23:30',
      waketime: '06:45',
      sleepQuality: '普通',
      awakenings: 1,
      sleep_latency: 20,
      tags: ['カフェインなし']
    };
    const score = calculateSleepScore(data);
    expect(score).toBeGreaterThan(60);
    expect(score).toBeLessThan(90);
  });
});
```

### 9.4 E2Eテストシナリオ

| ID | シナリオ | 期待結果 |
|----|---------|---------|
| E2E-01 | アプリ起動～ホーム画面表示 | 5秒以内にホーム画面表示 |
| E2E-02 | 睡眠記録入力～スコア表示 | スコアが正しく計算・表示される |
| E2E-03 | タスク追加～完了～感情入力 | タスクが保存され、感情が記録される |
| E2E-04 | グラフ画面表示～週/月切替 | グラフが正しく描画・切替される |
| E2E-05 | データエクスポート | JSONファイルが生成される |

---

## 10. リスク管理

### 10.1 リスク一覧

| ID | リスク | 発生確率 | 影響度 | 対策 | 担当 |
|----|--------|---------|--------|------|------|
| R-01 | React Native学習曲線 | 中 | 高 | AI支援・サンプルコード活用・事前学習 | 全員 |
| R-02 | センサー精度不足 | 中 | 中 | 手入力併用・実験的検証 | 立川 |
| R-03 | スケジュール遅延 | 中 | 高 | Week 7バッファ・機能削減（センサー除外） | 増田 |
| R-04 | DB設計ミス | 低 | 高 | Phase 3でDDL詳細化済み | 立川 |
| R-05 | PSQI相関が低い | 低 | 中 | アルゴリズム調整・重み係数最適化 | 増田 |
| R-06 | 被験者募集困難 | 中 | 中 | ゼミメンバー・友人を優先依頼 | 増田 |
| R-07 | バッテリー消費大 | 中 | 低 | センサーサンプリング間隔調整 | 立川 |
| R-08 | Expoバージョン更新 | 低 | 中 | Expo SDK 50 (LTS) 採用 | 立川 |

### 10.2 リスク対策詳細

#### R-01: React Native学習曲線

**対策**:
1. **Week 1前**: React Native公式チュートリアル完了（各自5時間）
2. **AI支援**: ChatGPT / Claude Codeでコード生成・デバッグ
3. **サンプルコード**: Expo公式サンプル・GitHub参照
4. **ペアプログラミング**: 立川が詰まった際は増田・藤川がサポート

---

#### R-03: スケジュール遅延

**早期警告指標**:
- Week 3末時点で累計工数が40h未満（標準: 60h）
- Week 5末時点でグラフ画面未実装

**対策**:
1. **Week 7バッファ**: 16時間分の調整時間
2. **機能削減**: センサー統合（8h）、高度UI（8h）を除外可能
3. **毎週レビュー**: 金曜日に進捗確認、問題早期検出

---

## 11. 研究計画

### 11.1 研究目的

睡眠スコアアルゴリズムの妥当性を、PSQI（Pittsburgh Sleep Quality Index）との相関分析により検証する。

### 11.2 研究仮説

「本アプリの睡眠スコアは、PSQIスコアと0.7以上の負の相関を示す」

※PSQI: スコアが高いほど睡眠の質が悪い（5点以上で睡眠障害の疑い）
※本アプリ: スコアが高いほど睡眠の質が良い
→ 負の相関が期待される

### 11.3 実験計画

**被験者**: 10名（学生・教員）
**期間**: 2週間（14日間）
**実施時期**: Week 4開始～Week 6末

**データ収集方法**:
1. **アプリでの記録**: 毎日の睡眠データ（就寝・起床・覚醒回数等）
2. **PSQIスコア**: 14日目に質問票回答（19項目）

**分析方法**:
- Pearsonの相関係数算出（Excel / Python）
- 散布図作成（本アプリスコア vs PSQIスコア）

**評価基準**:
- r ≥ 0.7（強い相関）: 妥当性高い
- 0.5 ≤ r < 0.7（中程度の相関）: 妥当性あり、改善余地
- r < 0.5（弱い相関）: アルゴリズム要見直し

### 11.4 倫理的配慮

- 被験者への説明・同意取得（インフォームドコンセント）
- データの匿名化（個人情報保護）
- 実験参加は任意・途中辞退可能

---

## 12. 成功基準

### 12.1 プロジェクト成功の最低条件

1. **MVPの全機能が動作**すること
2. **睡眠スコアアルゴリズムの理論的根拠が説明可能**であること
3. **研究発表資料（ポスター・プレゼン）が完成**していること
4. **デモ実演が成功**すること

### 12.2 定量的成功基準

| 指標 | 目標値 |
|------|--------|
| 起動速度 | 5秒以内 |
| 操作レスポンス | 1秒以内（10操作平均） |
| 睡眠スコア精度 | PSQI相関 r ≥ 0.7 |
| データ保存成功率 | 99%以上 |
| アプリクラッシュ率 | 1%未満 |
| コードカバレッジ | 70%以上 |

### 12.3 定性的成功基準

1. **ユーザビリティ**: 初回利用時に基本操作が理解できる
2. **研究評価**: 指導教員・審査員から高評価を得る
3. **実装品質**: コードが可読性高く、保守しやすい
4. **チーム協働**: 役割分担が機能し、スムーズに開発が進む

---

## 13. 付録

### 13.1 参考文献

1. Buysse, D.J. et al. (1989). "The Pittsburgh Sleep Quality Index: A new instrument for psychiatric practice and research." Psychiatry Research, 28(2), 193-213.
2. American Academy of Sleep Medicine (AASM). "Clinical Practice Guideline for the Treatment of Intrinsic Circadian Rhythm Sleep-Wake Disorders." https://aasm.org/
3. National Sleep Foundation. "How Much Sleep Do We Really Need?" https://www.sleepfoundation.org/
4. React Native公式ドキュメント. https://reactnative.dev/
5. Expo公式ドキュメント. https://docs.expo.dev/

### 13.2 関連ドキュメント

- [TodoList.md](./TodoList.md) - 進捗管理
- [001-plan_v0.1.md](./001-plan_v0.1.md) - 企画・範囲確定
- [004-current_state_v0.1.md](./004-current_state_v0.1.md) - 現状分析
- [005-gap_analysis_v0.1.md](./005-gap_analysis_v0.1.md) - ギャップ分析
- [006-feasibility_v0.1.md](./006-feasibility_v0.1.md) - 実現可能性評価
- [007-value_eval_v0.1.md](./007-value_eval_v0.1.md) - 価値評価
- [用語集.md](./用語集.md) - 技術用語定義

### 13.3 文書管理情報

- **作成日**: 2025年10月30日
- **最終更新日**: 2025年10月30日
- **バージョン**: v0.1
- **次回更新予定**: 人間レビュー後（v0.2）
- **承認者**: 増田（PM）、指導教員
- **保管場所**: `/Users/matsulab/GitHub/Mindful_Rhythm/002-requirements_definition_v0.1.md`

---

**本要件定義書は、調査方針v0.1.1に従った体系的プロセスの集大成であり、実装フェーズへの完全な指針を提供します。**
