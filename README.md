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
- ✅ **タスク管理**: ToDoリスト、感情付き完了、睡眠改善課題の自動提示
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
npm start

# iOS シミュレータで起動
npm run ios

# Android エミュレータで起動
npm run android

# Webブラウザで起動
npm run web
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
│   │   ├── HomeScreen.tsx
│   │   ├── SleepTrackerScreen.tsx
│   │   ├── TaskJournalScreen.tsx
│   │   ├── StatisticsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/           # 共通コンポーネント
│   ├── navigation/           # ナビゲーション設定
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── services/             # ビジネスロジック
│   ├── types/                # TypeScript型定義
│   │   ├── database.ts
│   │   └── navigation.ts
│   ├── utils/                # ユーティリティ
│   └── constants/            # 定数
│       ├── Colors.ts
│       └── Typography.ts
├── assets/                   # 画像・フォント
├── docs/                     # ドキュメント
├── App.tsx                   # エントリーポイント
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
| フレームワーク | React Native | 0.73.0 |
| 開発環境 | Expo | SDK 50 (LTS) |
| 言語 | TypeScript | 5.1+ |
| ナビゲーション | React Navigation | 6.x |
| データベース | expo-sqlite | 13.0.0 |
| グラフ | Victory Native | 36.x |
| センサー | expo-sensors | 13.0.0 |
| 暗号化 | expo-secure-store | 12.8.1 |
| テスト | Jest + RNTL | 29.x |

---

## 📊 開発進捗

### Week 1-2: 環境構築・基礎学習 ✅
- [x] Expo環境構築
- [x] React Navigation設定
- [x] TypeScript型定義
- [x] 基本画面レイアウト
- [ ] SQLite初期化スクリプト

### Week 3-4: コア機能実装（予定）
- [ ] 睡眠記録画面
- [ ] 睡眠スコア算出ロジック
- [ ] タスク管理画面
- [ ] データベース連携

### Week 5-6: 拡張機能実装（予定）
- [ ] グラフ分析画面
- [ ] 睡眠日記画面
- [ ] AIアドバイス生成

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

- [要件定義書](./002-requirements_definition_v0.1.md)
- [企画・範囲確定](./001-plan_v0.1.md)
- [現状分析](./004-current_state_v0.1.md)
- [ギャップ分析](./005-gap_analysis_v0.1.md)
- [実現可能性評価](./006-feasibility_v0.1.md)
- [価値評価](./007-value_eval_v0.1.md)
- [用語集](./用語集.md)

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
