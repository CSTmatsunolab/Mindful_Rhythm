# スリーピン画像の動的管理案

## 現在の実装（静的マッピング）
すべての画像を静的にインポートし、実行時にキーで選択する方式。

**メリット:**
- シンプル
- 型安全
- バンドルサイズに含まれる

**デメリット:**
- 画像追加時にコード変更が必要
- 初期バンドルサイズが大きくなる

## 代替案1: URIベースの動的読み込み

### 実装例:
```typescript
import * as FileSystem from 'expo-file-system';

// 画像保存先
const SLEEPIN_DIR = FileSystem.documentDirectory + 'sleepin/';

/**
 * 画像をダウンロードして保存
 */
async function downloadSleepinImages() {
  const baseURL = 'https://your-server.com/sleepin/';

  for (const prompt of SLEEPIN_PROMPTS) {
    const imageUrl = baseURL + prompt.fileName;
    const localUri = SLEEPIN_DIR + prompt.fileName;

    await FileSystem.downloadAsync(imageUrl, localUri);
  }
}

/**
 * ローカル画像のURIを取得
 */
function getSleepinImageUri(fileName: string): string {
  return SLEEPIN_DIR + fileName;
}

// 使用例
<Image
  source={{ uri: getSleepinImageUri('sleepin_good_final.png') }}
  style={{ width: 100, height: 100 }}
/>
```

**メリット:**
- 画像を後からダウンロード可能
- 初期バンドルサイズを削減
- サーバー側で画像を更新できる

**デメリット:**
- 初回ダウンロードが必要
- オフライン時の対応が必要
- 実装が複雑

## 代替案2: expo-assetとFileSystemの組み合わせ

### 実装例:
```typescript
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

/**
 * アセットからローカルURIを取得
 */
async function getSleepinAssetUri(key: SleepinImageKey): Promise<string | null> {
  const imageMap = {
    sleepin_poor_initial: require('../../assets/sleepin/sleepin_poor_initial.png'),
    // ... 残り
  };

  const asset = Asset.fromModule(imageMap[key]);
  await asset.downloadAsync();

  return asset.localUri;
}
```

## 推奨実装

プロジェクトの規模を考えると、**現在の静的マッピング方式が最適**です。

理由:
1. 画像数が9つと固定的
2. 頻繁な変更が不要
3. 型安全性が重要
4. シンプルで保守しやすい

### 現在の実装の強化版:

```typescript
// SleepinImages.ts
const IMAGES = {
  sleepin_poor_initial: require('../../assets/sleepin/sleepin_poor_initial.png'),
  sleepin_poor_intermediate: require('../../assets/sleepin/sleepin_poor_intermediate.png'),
  sleepin_poor_final: require('../../assets/sleepin/sleepin_poor_final.png'),
  sleepin_normal_initial: require('../../assets/sleepin/sleepin_normal_initial.png'),
  sleepin_normal_intermediate: require('../../assets/sleepin/sleepin_normal_intermediate.png'),
  sleepin_normal_final: require('../../assets/sleepin/sleepin_normal_final.png'),
  sleepin_good_initial: require('../../assets/sleepin/sleepin_good_initial.png'),
  sleepin_good_intermediate: require('../../assets/sleepin/sleepin_good_intermediate.png'),
  sleepin_good_final: require('../../assets/sleepin/sleepin_good_final.png'),
} as const;

export type SleepinImageKey = keyof typeof IMAGES;

export function getSleepinImage(key: SleepinImageKey) {
  return IMAGES[key];
}

// HomeScreen.tsx で使用
const imageKey = getImageKeyFromFileName(fileName);
const sleepinImage = getSleepinImage(imageKey); // ✅ 動的選択

<Image source={sleepinImage} style={...} />
```

## まとめ

- React Nativeでは**動的パスのrequire()は不可能**
- しかし**静的インポート + 実行時選択**で動的な振る舞いは実現可能（現在の実装）
- より柔軟性が必要ならURIベースの読み込みを検討
- 現プロジェクトでは静的マッピング方式が最適
