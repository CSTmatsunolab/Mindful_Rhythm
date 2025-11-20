# スリーピン画像生成システム実装ガイド

## 概要

アプリ内でOpenAI DALL-E 3を使用してスリーピン画像を自動生成し、ローカルストレージに保存する機能を実装しました。

## システム構成

### 1. 画像生成サービス (`sleepinImageGenerator.ts`)

**機能:**
- OpenAI DALL-E 3 APIを使用した画像生成
- ローカルストレージへの保存 (expo-file-system使用)
- 生成状況の管理と進捗追跡
- 画像の削除と再生成

**主要関数:**
```typescript
// すべての画像を生成（9枚）
generateAllSleepinImages(onProgress?: (current, total, message) => void)

// 単一の画像を生成
generateSingleImage(promptData: SleepinPrompt, onProgress?: (message) => void)

// 生成状況を取得
getGenerationStatus(): Promise<{ total, generated, percentage, missing }>

// 画像URIを取得
getSleepinImageUri(fileName: string): string

// 画像が存在するか確認
isImageGenerated(fileName: string): Promise<boolean>

// すべての画像を削除
deleteAllImages(): Promise<void>
```

### 2. 画像管理 (`SleepinImages.ts`)

**変更点:**
- 静的require()からURIベースの管理に変更
- 非同期で画像の存在確認
- ローカルストレージから画像URIを取得

```typescript
// 画像URIを取得（非同期）
getSleepinImageUri_Async(key: SleepinImageKey): Promise<string | null>

// 画像URIを取得（同期・存在確認なし）
getSleepinImageUriSync(key: SleepinImageKey): string

// 画像の存在確認
hasImage(key: SleepinImageKey): Promise<boolean>
```

### 3. ホーム画面 (`HomeScreen.tsx`)

**変更点:**
- URIベースの画像表示に対応
- 状態管理で画像URIを保持
- 画像未生成時は絵文字フォールバック

```typescript
const [sleepinImageUri, setSleepinImageUri] = useState<string | null>(null);

// データ取得時に画像URIを取得
const imageExists = await isImageGenerated(fileName);
if (imageExists) {
  const uri = getSleepinImageUriSync(imageKey);
  setSleepinImageUri(uri);
}

// 画像表示
<Animated.Image source={{ uri: sleepinImageUri }} />
```

### 4. 画像生成画面 (`SleepinGeneratorScreen.tsx`)

**機能:**
- 生成状況の表示（進捗バー、パーセンテージ）
- すべての画像を一括生成
- 生成進捗のリアルタイム表示
- 画像の削除機能
- 使い方の説明

### 5. 設定画面 (`SettingsScreen.tsx`)

**変更点:**
- 画像生成画面へのナビゲーションボタンを追加

## セットアップ手順

### 1. OpenAI API キーの取得

1. [OpenAI Platform](https://platform.openai.com/api-keys)でAPIキーを取得
2. プロジェクトルートに`.env`ファイルを作成:

```bash
cp .env.example .env
```

3. `.env`ファイルにAPIキーを設定:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 2. 画像生成の実行

1. アプリを起動
2. 「設定」タブに移動
3. 「画像生成」をタップ
4. 「すべて生成」ボタンをタップ
5. 約3-5分待機（9枚の画像生成）

## 画像生成の仕様

### 生成される画像

- **合計:** 9枚
- **種類:** 睡眠の質 (poor/normal/good) × 成長段階 (initial/intermediate/final)

| 睡眠の質 | 成長段階 | ファイル名 | 説明 |
|----------|----------|------------|------|
| 悪い | 初期 | sleepin_poor_initial.png | 疲れた小さなスリーピン |
| 悪い | 中間 | sleepin_poor_intermediate.png | 少し成長したが疲れた表情 |
| 悪い | 最終 | sleepin_poor_final.png | 大きくなったが眠そう |
| 普通 | 初期 | sleepin_normal_initial.png | 元気な小さなスリーピン |
| 普通 | 中間 | sleepin_normal_intermediate.png | 健康的に成長 |
| 普通 | 最終 | sleepin_normal_final.png | 立派に育った健康的 |
| 良い | 初期 | sleepin_good_initial.png | 最高の睡眠で輝く小さな |
| 良い | 中間 | sleepin_good_intermediate.png | 最高の睡眠で輝く中型 |
| 良い | 最終 | sleepin_good_final.png | 究極の形態！黄金に輝く |

### 画像選択ロジック

```typescript
// 睡眠の質の判定
function getSleepQualityLevel(sleepScore: number | undefined): SleepQualityLevel {
  if (!sleepScore) return 'normal';
  if (sleepScore >= 80) return 'good';   // 80点以上
  if (sleepScore >= 60) return 'normal'; // 60-79点
  return 'poor';                          // 60点未満
}

// 成長段階の判定
function getGrowthStage(growthPoints: number): GrowthStage {
  if (growthPoints >= 100) return 'final';         // 100pt以上
  if (growthPoints >= 30) return 'intermediate';   // 30-99pt
  return 'initial';                                 // 0-29pt
}
```

## API仕様

### OpenAI DALL-E 3

**エンドポイント:** `https://api.openai.com/v1/images/generations`

**リクエスト:**
```json
{
  "model": "dall-e-3",
  "prompt": "スリーピン画像のプロンプト",
  "n": 1,
  "size": "1024x1024",
  "quality": "standard",
  "style": "vivid"
}
```

**レスポンス:**
```json
{
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/..."
    }
  ]
}
```

### レート制限

- **DALL-E 3 Standard:** 5リクエスト/分
- **実装での対策:** 各画像生成後に15秒待機

## コスト

### OpenAI DALL-E 3 料金

- **Standard品質 (1024x1024):** $0.04 / 画像
- **9枚の総コスト:** 約 $0.36

## ストレージ

### 保存場所

```
FileSystem.documentDirectory + 'sleepin/'
```

iOS: `/var/mobile/Containers/Data/Application/.../Documents/sleepin/`
Android: `/data/user/0/com.yourapp/files/sleepin/`

### ファイルサイズ

- **1枚あたり:** 約200-500KB
- **9枚の総サイズ:** 約2-5MB

## トラブルシューティング

### APIキーエラー

**エラー:** `OPENAI_API_KEY が設定されていません`

**解決方法:**
1. `.env`ファイルが存在するか確認
2. `EXPO_PUBLIC_OPENAI_API_KEY`が正しく設定されているか確認
3. アプリを再起動（環境変数の再読み込み）

### レート制限エラー

**エラー:** `Rate limit exceeded`

**解決方法:**
- 待機時間を延長（15秒 → 20秒）
- OpenAI Usage limitsを確認

### 画像ダウンロードエラー

**エラー:** `画像ダウンロード失敗: 403`

**解決方法:**
- インターネット接続を確認
- 生成されたURLの有効期限を確認（1時間）

## 今後の拡張案

### 1. 画像キャッシュの改善
- 生成済み画像のプレビュー表示
- 個別画像の再生成機能

### 2. カスタマイズ機能
- ユーザーがプロンプトをカスタマイズ
- 異なるスタイルの選択

### 3. オフライン対応
- 事前生成済み画像のバンドル
- オンライン/オフラインハイブリッド

### 4. 他のAI画像生成サービス対応
- Stable Diffusion API
- Midjourney API (非公式)
- Flux

## セキュリティ考慮事項

### APIキーの管理

- ✅ `.env`ファイルは`.gitignore`に含まれる
- ✅ `EXPO_PUBLIC_`プレフィックスでクライアント側で使用可能
- ⚠️ クライアント側でAPIキーを使用するため、キーが露出する可能性あり

**本番環境での推奨:**
- バックエンドサーバーを経由してAPI呼び出し
- ユーザー認証とレート制限の実装

## 参考リンク

- [OpenAI Platform - API Keys](https://platform.openai.com/api-keys)
- [OpenAI DALL-E 3 API Documentation](https://platform.openai.com/docs/guides/images)
- [Expo File System Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [React Native Image Component](https://reactnative.dev/docs/image)
