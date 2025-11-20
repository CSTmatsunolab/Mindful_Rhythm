/**
 * スリーピン画像管理
 *
 * 画像生成APIで生成された画像をローカルストレージから読み込む
 */

import { getSleepinImageUri, isImageGenerated } from '../services/sleepinImageGenerator';

// 型定義
export type SleepinImageKey =
  | 'sleepin_poor_initial'
  | 'sleepin_poor_intermediate'
  | 'sleepin_poor_final'
  | 'sleepin_normal_initial'
  | 'sleepin_normal_intermediate'
  | 'sleepin_normal_final'
  | 'sleepin_good_initial'
  | 'sleepin_good_intermediate'
  | 'sleepin_good_final';

/**
 * ファイル名から画像キーを生成
 */
export function getImageKeyFromFileName(fileName: string): SleepinImageKey {
  const key = fileName.replace('.png', '') as SleepinImageKey;
  return key;
}

/**
 * 画像キーからファイル名を取得
 */
export function getFileNameFromImageKey(key: SleepinImageKey): string {
  return `${key}.png`;
}

/**
 * 画像が存在するかチェック（非同期）
 */
export async function hasImage(key: SleepinImageKey): Promise<boolean> {
  const fileName = getFileNameFromImageKey(key);
  return await isImageGenerated(fileName);
}

/**
 * 画像URIを取得
 *
 * ローカルストレージに保存された画像のURIを返す
 * 存在しない場合はnullを返す
 */
export async function getSleepinImageUri_Async(key: SleepinImageKey): Promise<string | null> {
  const fileName = getFileNameFromImageKey(key);
  const exists = await isImageGenerated(fileName);

  if (!exists) {
    return null;
  }

  return getSleepinImageUri(fileName);
}

/**
 * 画像URIを同期的に取得（存在チェックなし）
 *
 * 注意: この関数は画像が存在することを前提としています
 * 存在確認が必要な場合は getSleepinImageUri_Async を使用してください
 */
export function getSleepinImageUriSync(key: SleepinImageKey): string {
  const fileName = getFileNameFromImageKey(key);
  return getSleepinImageUri(fileName);
}
