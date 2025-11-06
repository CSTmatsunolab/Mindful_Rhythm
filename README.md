# Mindful Rhythm（マインドフル・リズム）

**CBT-I理論に基づく睡眠改善支援モバイルアプリ**

心と体のリズムを整え、毎日をより充実させるための、あなただけのウェルネスコンシェルジュ。

---

## 📱 プロジェクト概要

### 背景
- 日本人の約20%が不眠症状を抱える
- 睡眠負債による経済損失は年間15兆円
- 従来アプリは単なる記録にとどまり、行動変容につながりにくい

### 目的
1. **教育的目的**: React Native (Expo) によるモバイルアプリ開発スキル習得
2. **研究的目的**: CBT-I理論に基づく睡眠スコアアルゴリズムの設計・検証
3. **実用的目的**: ユーザーの睡眠・感情・行動の相関理解と生活リズム改善支援

### 主要機能
- 🌙 **睡眠記録**: 就寝・起床時間の記録、睡眠スコア算出（0～100点）
  - ✨ **v0.2追加**: 任意日付での記録（過去7日間対応）
- ✅ **タスク管理**: ToDoリスト、感情付き完了、睡眠改善課題の自動提示
  - ✨ **v0.2追加**: 締め切り日設定、難易度設定（1-5段階）、緊急度別色分け表示
- 📊 **グラフ分析**: 週/月単位のスコア推移、睡眠時間グラフ
- 📝 **睡眠日記**: 夢・不安・感情の記録（CBT-I支援）
- 🎨 **キャラクター**: スリーピンがスコアに応じて表情変化

---

## 🚀 セットアップ

### 前提条件
- Node.js 18以降
- npm または yarn
- Expo CLI

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/matsulab/Mindful_Rhythm.git
cd Mindful_Rhythm

# 依存関係をインストール
npm install

# Expo CLIをグローバルインストール（未インストールの場合）
npm install -g expo-cli
```

### 起動方法

```bash
# 開発サーバー起動
npx expo start

# キャッシュをクリアして起動（推奨）
npx expo start --clear

# iOS シミュレータで起動
npx expo start --ios

# Android エミュレータで起動
npx expo start --android
```

### トラブルシューティング

問題が発生した場合は [QUICK_START.md](./QUICK_START.md) の詳細なトラブルシューティングガイドを参照してください。

**クイックフィックス**:
```bash
# すべてのプロセスを停止
pkill -9 -f "expo"

# キャッシュをクリア
rm -rf .expo node_modules/.cache

# 再起動
npx expo start --clear
```

### Expo Go での動作確認

1. スマートフォンに [Expo Go](https://expo.dev/client) をインストール
2. `npm start` 実行後に表示されるQRコードをスキャン
3. アプリが起動

---

## 📁 プロジェクト構造

```
Mindful_Rhythm/
├── src/
│   ├── screens/              # 画面コンポーネント
│   │   ├── HomeScreen.tsx              ✅ 実装済み（DB連携はWeek 4）
│   │   ├── SleepTrackerScreen.tsx      ✅ 完全実装済み（増田さん担当）
│   │   ├── TaskJournalScreen.tsx       ✅ 完全実装済み（藤川さん担当）
│   │   ├── StatisticsScreen.tsx        ⏳ Week 5-6で実装予定
│   │   └── SettingsScreen.tsx          ⏳ Week 5-6で実装予定
│   ├── components/           # 共通コンポーネント
│   │   └── EmotionPicker.tsx           ✅ 完全実装済み（藤川さん担当）
│   ├── navigation/           # ナビゲーション設定
│   │   ├── AppNavigator.tsx            ✅ 実装済み
│   │   └── TabNavigator.tsx            ✅ 実装済み
│   ├── services/             # ビジネスロジック
│   │   ├── database.ts                 ✅ 完全実装済み（CRUD操作）
│   │   ├── sleepScoreCalculator.ts     ✅ 完全実装済み（増田さん担当）
│   │   └── adviceGenerator.ts          ✅ 完全実装済み（増田さん担当）
│   ├── types/                # TypeScript型定義
│   │   ├── database.ts                 ✅ 実装済み
│   │   └── navigation.ts               ✅ 実装済み
│   ├── utils/                # ユーティリティ
│   │   └── dateFormatter.ts            ✅ 完全実装済み
│   └── constants/            # 定数
│       ├── Colors.ts                   ✅ 実装済み
│       └── Typography.ts               ✅ 実装済み
├── assets/                   # 画像・フォント
├── docs/                     # ドキュメント
│   ├── 002-requirements_definition_v0.1.md  ✅ 要件定義書
│   ├── 実装タスクリスト_増田藤川.md            ✅ タスクリスト
│   └── 実装ガイド_増田藤川.md                  ✅ 実装手順書
├── App.tsx                   # エントリーポイント（✅ DB初期化済み）
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 テスト

```bash
# ユニットテスト実行
npm test

# カバレッジレポート生成
npm test -- --coverage

# Watch モード
npm test -- --watch
```

### テストカバレッジ目標
- ロジック層（services/）: 90%以上
- コンポーネント層: 70%以上
- 全体: 70%以上

---

## 🎨 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|----------|
| フレームワーク | React Native | 0.81.5 |
| 開発環境 | Expo | SDK 54 |
| 言語 | TypeScript | 5.9+ |
| ナビゲーション | React Navigation | 7.x |
| データベース | expo-sqlite | 16.0.9 |
| グラフ | Victory Native | 36.x |
| センサー | expo-sensors | 15.0.7 |
| 暗号化 | expo-secure-store | 15.0.7 |
| 通知 | expo-notifications | 0.32.12 |
| テスト | Jest + RNTL | 29.x |
| React | React | 19.1.0 |

---

## 📊 開発進捗

### Week 1-2: 環境構築・基礎学習 ✅ 完了
- [x] Expo環境構築
- [x] React Navigation設定
- [x] TypeScript型定義
- [x] 基本画面レイアウト
- [x] SQLite初期化スクリプト ✅ **NEW**
- [x] 日付ユーティリティ関数 ✅ **NEW**

### Week 3-4: コア機能実装 ✅ 100%完了
- [x] 睡眠記録画面 ✅ **完全実装済み（増田さん担当）**
- [x] 睡眠スコア算出ロジック ✅ **完全実装済み（増田さん担当）**
- [x] タスク管理画面 ✅ **完全実装済み（藤川さん担当）**
- [x] 感情選択モーダル ✅ **完全実装済み（藤川さん担当）**
- [x] データベースCRUD操作 ✅ **完全実装済み**
- [x] ホーム画面とDB連携 ✅ **完全実装済み（リアルタイム更新対応）**

### Week 4: v0.2機能拡張 ✅ 100%完了
- [x] データベースマイグレーション（deadline, difficulty追加）
- [x] 睡眠記録の任意日付選択（過去7日間）
- [x] タスク締め切り日設定・緊急度表示
- [x] タスク難易度設定（1-5段階）
- [x] UI/UX改善（色分け表示、直感的入力）

### Week 5-6: 拡張機能実装（予定）
- [ ] グラフ分析画面
- [ ] 睡眠日記画面
- [ ] AIアドバイス生成
- [ ] キャラクター表情変化
- [ ] ホーム画面背景変化

---

## 🔬 研究計画

### 睡眠スコアアルゴリズム
5指標の重み付け評価:
- 睡眠時間（30%）
- 深睡眠比率（25%）
- 中途覚醒（20%）
- 入眠潜時（15%）
- 環境要因（10%）

### 妥当性検証
- PSQI（Pittsburgh Sleep Quality Index）との相関分析
- 被験者: 10名、期間: 2週間
- 目標: Pearson相関係数 r ≥ 0.7

---

## 👥 開発チーム

| 役割 | 担当者 | 責務 |
|------|--------|------|
| プロジェクトマネージャ | 増田 | 設計・進行管理・研究方針 |
| UI/UXデザイナ | 藤川 | 画面設計・アニメーション |
| モバイルエンジニア | 立川 | React Native実装・DB設計 |

---

## 📄 ドキュメント

### 要件定義フェーズ
- [要件定義書](./docs/002-requirements_definition_v0.1.md) - 全機能の詳細仕様
- [企画・範囲確定](./docs/001-plan_v0.1.md)
- [現状分析](./docs/004-current_state_v0.1.md)
- [ギャップ分析](./docs/005-gap_analysis_v0.1.md)
- [実現可能性評価](./docs/006-feasibility_v0.1.md)
- [価値評価](./docs/007-value_eval_v0.1.md)

### 実装フェーズ ✅ **NEW**
- [実装タスクリスト（増田さん・藤川さん）](./docs/実装タスクリスト_増田藤川.md) - 20タスクの詳細リスト
- [実装ガイド（増田さん・藤川さん）](./docs/実装ガイド_増田藤川.md) - ステップバイステップ手順書
- [実装完了レポート v0.2](./docs/IMPLEMENTATION_REPORT_v0.2.md) - Week 4 機能拡張の実装詳細

### その他
- [用語集](./docs/用語集.md)

---

## 📝 ライセンス

本プロジェクトは教育目的のため、現時点ではライセンスを設定していません。

---

## 🌟 今後の展望

### 拡張機能（MVP後）
- クラウド同期（Firebase / Supabase）
- Apple Watch / Fitbit連携
- ChatGPT APIによる自然対話
- 多言語対応（英語・中国語）

### ビジネス展開
- B2C: 個人ユーザー向けフリーミアムモデル
- B2B: 企業の健康経営支援ツール

---

**Mindful Rhythm** - あなたの睡眠、もっと豊かに。
