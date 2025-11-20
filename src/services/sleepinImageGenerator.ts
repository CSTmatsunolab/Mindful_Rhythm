/**
 * スリーピン画像生成サービス
 *
 * 画像生成APIを使用してスリーピン画像を生成し、
 * ローカルストレージに保存する
 */

import * as FileSystem from 'expo-file-system/legacy';
import { SLEEPIN_PROMPTS, type SleepinPrompt } from '../constants/SleepinPrompts';

// 画像保存ディレクトリ
const SLEEPIN_DIR = FileSystem.documentDirectory + 'sleepin/';

// 画像生成API設定（OpenAI DALL-E 3を使用）
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

/**
 * ディレクトリの初期化
 */
async function ensureDirectoryExists(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(SLEEPIN_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SLEEPIN_DIR, { intermediates: true });
    console.log('✅ スリーピン画像ディレクトリを作成しました:', SLEEPIN_DIR);
  }
}

/**
 * 画像が既に生成されているか確認
 */
export async function isImageGenerated(fileName: string): Promise<boolean> {
  const filePath = SLEEPIN_DIR + fileName;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists;
}

/**
 * すべての画像が生成済みか確認
 */
export async function areAllImagesGenerated(): Promise<boolean> {
  for (const prompt of SLEEPIN_PROMPTS) {
    const exists = await isImageGenerated(prompt.fileName);
    if (!exists) {
      return false;
    }
  }
  return true;
}

/**
 * OpenAI DALL-E 3で画像生成
 */
async function generateImageWithDALLE(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY が設定されていません');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`画像生成エラー: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data[0].url; // 生成された画像のURL
}

/**
 * 画像URLをダウンロードしてローカルに保存
 */
async function downloadAndSaveImage(imageUrl: string, fileName: string): Promise<string> {
  const filePath = SLEEPIN_DIR + fileName;

  // ダウンロード
  const downloadResult = await FileSystem.downloadAsync(imageUrl, filePath);

  if (downloadResult.status !== 200) {
    throw new Error(`画像ダウンロード失敗: ${downloadResult.status}`);
  }

  console.log('✅ 画像を保存しました:', fileName);
  return filePath;
}

/**
 * 単一の画像を生成
 */
export async function generateSingleImage(
  promptData: SleepinPrompt,
  onProgress?: (message: string) => void
): Promise<string> {
  try {
    await ensureDirectoryExists();

    // 既に存在する場合はスキップ
    const exists = await isImageGenerated(promptData.fileName);
    if (exists) {
      onProgress?.(`⏭️ ${promptData.fileName} は既に存在します`);
      return SLEEPIN_DIR + promptData.fileName;
    }

    onProgress?.(`🎨 ${promptData.description} を生成中...`);

    // DALL-E 3で画像生成
    const imageUrl = await generateImageWithDALLE(promptData.prompt);

    onProgress?.(`⬇️ ${promptData.fileName} をダウンロード中...`);

    // ローカルに保存
    const filePath = await downloadAndSaveImage(imageUrl, promptData.fileName);

    onProgress?.(`✅ ${promptData.fileName} 生成完了`);

    return filePath;
  } catch (error) {
    console.error(`❌ 画像生成エラー (${promptData.fileName}):`, error);
    throw error;
  }
}

/**
 * すべてのスリーピン画像を生成
 *
 * @param onProgress 進捗コールバック (current, total, message)
 */
export async function generateAllSleepinImages(
  onProgress?: (current: number, total: number, message: string) => void
): Promise<void> {
  const total = SLEEPIN_PROMPTS.length;
  let current = 0;

  console.log(`🚀 スリーピン画像生成開始 (${total}枚)`);

  for (const promptData of SLEEPIN_PROMPTS) {
    current++;
    onProgress?.(current, total, `生成中: ${promptData.description}`);

    try {
      await generateSingleImage(promptData, (msg) => {
        onProgress?.(current, total, msg);
      });

      // API rate limitを考慮して待機（DALL-E 3は1分に5リクエスト制限）
      if (current < total) {
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15秒待機
      }
    } catch (error) {
      console.error(`❌ ${promptData.fileName} の生成に失敗:`, error);
      onProgress?.(current, total, `❌ エラー: ${promptData.fileName}`);
      // エラーが発生しても続行
    }
  }

  console.log('✅ スリーピン画像生成完了');
  onProgress?.(total, total, '✅ すべての画像生成完了');
}

/**
 * ローカル画像のURIを取得
 */
export function getSleepinImageUri(fileName: string): string {
  return SLEEPIN_DIR + fileName;
}

/**
 * 特定の画像を削除（再生成用）
 */
export async function deleteImage(fileName: string): Promise<void> {
  const filePath = SLEEPIN_DIR + fileName;
  const fileInfo = await FileSystem.getInfoAsync(filePath);

  if (fileInfo.exists) {
    await FileSystem.deleteAsync(filePath);
    console.log('🗑️ 画像を削除しました:', fileName);
  }
}

/**
 * すべての画像を削除
 */
export async function deleteAllImages(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(SLEEPIN_DIR);

  if (dirInfo.exists) {
    await FileSystem.deleteAsync(SLEEPIN_DIR, { idempotent: true });
    console.log('🗑️ すべてのスリーピン画像を削除しました');
  }
}

/**
 * 生成済み画像の一覧を取得
 */
export async function getGeneratedImages(): Promise<string[]> {
  const dirInfo = await FileSystem.getInfoAsync(SLEEPIN_DIR);

  if (!dirInfo.exists) {
    return [];
  }

  const files = await FileSystem.readDirectoryAsync(SLEEPIN_DIR);
  return files.filter(file => file.endsWith('.png'));
}

/**
 * 生成状況を取得
 */
export async function getGenerationStatus(): Promise<{
  total: number;
  generated: number;
  percentage: number;
  missing: string[];
}> {
  const total = SLEEPIN_PROMPTS.length;
  const generatedFiles = await getGeneratedImages();
  const generated = generatedFiles.length;

  const missing = SLEEPIN_PROMPTS
    .filter(p => !generatedFiles.includes(p.fileName))
    .map(p => p.fileName);

  return {
    total,
    generated,
    percentage: (generated / total) * 100,
    missing,
  };
}
