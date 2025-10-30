# Mindful Rhythm クイックスタートガイド

このドキュメントは、Mindful Rhythmアプリを起動するための手順をまとめています。

---

## ✅ 完了した環境構築

以下の環境構築は完了しています：

- ✅ React Native (Expo SDK 50) インストール済み
- ✅ すべての必要な依存関係インストール済み
- ✅ 基本画面レイアウト作成済み
- ✅ データベース初期化スクリプト作成済み
- ✅ アセットファイル（icon, splash）作成済み

---

## 🚀 アプリの起動方法

### 1. すべてのExpoプロセスを停止

```bash
# ターミナルで実行
pkill -9 -f "expo"
pkill -9 -f "metro"
```

### 2. キャッシュをクリア

```bash
rm -rf .expo node_modules/.cache
```

### 3. Expoを起動

```bash
npx expo start
```

または、キャッシュをクリアして起動：

```bash
npx expo start --clear
```

### 4. アプリをデバイスで開く

Expoが起動すると、QRコードが表示されます：

**スマートフォンの場合**：
1. Expo Goアプリをインストール（初回のみ）
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Expo Goアプリで QRコードをスキャン

**シミュレータの場合**：
- iOS: Expo CLIで `i` キーを押す
- Android: Expo CLIで `a` キーを押す

---

## 🐛 トラブルシューティング

### エラー: "Cannot read property 'create' of undefined"

**原因**: StyleSheetのインポートエラーまたは複数のExpoプロセスが競合

**解決方法**:
```bash
# 1. すべてのプロセスを停止
pkill -9 -f "expo"
pkill -9 -f "metro"

# 2. キャッシュをクリア
rm -rf .expo node_modules/.cache

# 3. 再起動
npx expo start --clear
```

---

### エラー: "main" has not been registered

**原因**: Metro bundlerの起動失敗またはモジュール解決エラー

**解決方法**:
```bash
# 1. ポート8081が使用されているか確認
lsof -ti:8081

# 2. 使用されている場合は停止
kill -9 $(lsof -ti:8081)

# 3. Expoを再起動
npx expo start --clear
```

---

### エラー: Unable to resolve module

**原因**: 依存関係がインストールされていない

**解決方法**:
```bash
# 依存関係を再インストール
npm install --legacy-peer-deps

# Expoを再起動
npx expo start
```

---

### Metroバンドラーが起動しない

**原因**: ポート競合またはキャッシュ問題

**解決方法**:
```bash
# 1. すべての関連プロセスを停止
pkill -9 -f "node"
sleep 3

# 2. ポート8081, 8082, 19000, 19001をクリア
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8082 | xargs kill -9 2>/dev/null
lsof -ti:19000 | xargs kill -9 2>/dev/null
lsof -ti:19001 | xargs kill -9 2>/dev/null

# 3. 完全なキャッシュクリア
rm -rf .expo node_modules/.cache
rm -rf /tmp/metro-* /tmp/haste-* 2>/dev/null
rm -rf ~/Library/Caches/Expo 2>/dev/null

# 4. node_modulesを再インストール（最終手段）
rm -rf node_modules
npm install --legacy-peer-deps

# 5. Expoを起動
npx expo start --clear
```

---

### 依存関係のバージョン警告

Expoが以下の警告を表示する場合があります：

```
The following packages should be updated for best compatibility...
```

**現在のバージョン**（正常動作確認済み）:
```json
{
  "expo": "~50.0.0",
  "expo-sqlite": "~13.4.0",
  "expo-sensors": "~12.9.1",
  "react-native": "0.73.6",
  "@react-native-community/datetimepicker": "7.7.0",
  "react-native-gesture-handler": "~2.14.0"
}
```

警告が出ても、これらのバージョンで動作します。

---

## 📊 データベースの初期化

初回起動時またはデータをリセットしたい場合：

### データベースを初期化

```bash
npx ts-node scripts/initDatabase.ts
```

### テストデータを投入

```bash
npx ts-node scripts/seedTestData.ts
```

詳細は [scripts/README.md](scripts/README.md) を参照してください。

---

## 📁 プロジェクト構成

```
Mindful_Rhythm/
├── assets/                      # アプリアイコン・スプラッシュ画像
├── src/
│   ├── screens/                 # 画面コンポーネント
│   │   ├── HomeScreen.tsx       # ホーム画面
│   │   ├── SleepTrackerScreen.tsx  # 睡眠記録画面
│   │   └── TaskJournalScreen.tsx   # タスク管理画面
│   ├── services/                # ビジネスロジック
│   │   ├── database.ts          # データベース操作
│   │   ├── sleepScoreCalculator.ts  # スコア計算
│   │   └── adviceGenerator.ts   # アドバイス生成
│   ├── components/              # 共通コンポーネント
│   │   └── EmotionPicker.tsx    # 感情選択モーダル
│   ├── navigation/              # ナビゲーション
│   │   └── TabNavigator.tsx     # タブナビゲーション
│   ├── constants/               # 定数定義
│   └── utils/                   # ユーティリティ
├── scripts/                     # データベーススクリプト
│   ├── initDatabase.ts          # 初期化
│   ├── resetDatabase.ts         # リセット
│   └── seedTestData.ts          # テストデータ投入
├── docs/                        # ドキュメント
│   └── tasks/                   # 実装タスクガイド
├── App.tsx                      # アプリエントリーポイント
├── app.json                     # Expo設定
└── package.json                 # 依存関係定義
```

---

## 🎯 次のステップ

### 動作確認

1. **ホーム画面**の表示確認
2. **睡眠記録画面**でデータ入力
3. **タスク管理画面**でタスク追加
4. データベースの動作確認

### 実装タスク

増田さん・藤川さん向けの詳細なタスクガイドは [docs/tasks/README.md](docs/tasks/README.md) を参照してください。

---

## 📞 サポート

問題が解決しない場合：

1. **エラーメッセージを確認**: ターミナルとExpo Goアプリ両方のエラーを確認
2. **ログを確認**: `npx expo start` の出力を確認
3. **完全リセット**: 上記のトラブルシューティング手順をすべて実行

---

**作成日**: 2025年10月30日
