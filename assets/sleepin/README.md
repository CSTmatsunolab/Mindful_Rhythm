# スリーピン画像フォルダ

このフォルダには、スリーピンの9種類の画像を配置します。

## 画像生成手順

1. プロンプトを取得：
```bash
npx ts-node scripts/generateSleepinImages.ts
```

2. 出力されたプロンプトを画像生成AIに入力

3. 生成された画像をこのフォルダに配置

## 必要な画像ファイル（9種類）

### 睡眠の質：悪い（poor）
- `sleepin_poor_initial.png` - 初期形態
- `sleepin_poor_intermediate.png` - 中間形態
- `sleepin_poor_final.png` - 最終形態

### 睡眠の質：普通（normal）
- `sleepin_normal_initial.png` - 初期形態
- `sleepin_normal_intermediate.png` - 中間形態
- `sleepin_normal_final.png` - 最終形態

### 睡眠の質：良い（good）
- `sleepin_good_initial.png` - 初期形態
- `sleepin_good_intermediate.png` - 中間形態
- `sleepin_good_final.png` - 最終形態（究極形態）

## 画像仕様

- **サイズ**: 正方形（推奨: 512x512px または 1024x1024px）
- **形式**: PNG（透過背景推奨）
- **スタイル**: かわいいちびキャラ、パステルカラー
- **背景**: 透過または白/淡い色

## フォールバック

画像が存在しない場合は、絵文字（😴😊😫など）で表示されます。
