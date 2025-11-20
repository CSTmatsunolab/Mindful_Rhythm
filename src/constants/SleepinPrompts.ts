/**
 * スリーピン画像生成プロンプト定義
 *
 * 睡眠の質（3段階）× 成長段階（3段階）= 9種類のスリーピン
 */

export type SleepQualityLevel = 'poor' | 'normal' | 'good';
export type GrowthStage = 'initial' | 'intermediate' | 'final';

export interface SleepinPrompt {
  sleepQuality: SleepQualityLevel;
  growthStage: GrowthStage;
  prompt: string;
  fileName: string;
  description: string;
}

/**
 * 画像生成プロンプト一覧
 *
 * 各プロンプトで画像生成AIに渡す文字列を定義
 */
export const SLEEPIN_PROMPTS: SleepinPrompt[] = [
  // ========================================
  // 睡眠の質：悪い（poor）
  // ========================================
  {
    sleepQuality: 'poor',
    growthStage: 'initial',
    fileName: 'sleepin_poor_initial.png',
    description: '睡眠不足で疲れた小さなスリーピン',
    prompt: `A cute sleepy character mascot, small size, tired expression, dark circles under eyes,
yawning pose, soft pastel colors with dull tones, chibi style, kawaii anime aesthetic,
simple background, digital illustration, high quality, adorable but exhausted look,
representing poor sleep quality, beginner stage`
  },
  {
    sleepQuality: 'poor',
    growthStage: 'intermediate',
    fileName: 'sleepin_poor_intermediate.png',
    description: '少し成長したが疲れた表情のスリーピン',
    prompt: `A cute sleepy character mascot, medium size, still tired but slightly more energetic,
faint dark circles, half-closed eyes, soft pastel colors with muted tones, chibi style,
kawaii anime aesthetic, simple background, digital illustration, high quality,
showing signs of growth but still representing poor sleep quality, intermediate stage`
  },
  {
    sleepQuality: 'poor',
    growthStage: 'final',
    fileName: 'sleepin_poor_final.png',
    description: '大きくなったが眠そうなスリーピン',
    prompt: `A cute sleepy character mascot, large size, mature form but still sleepy,
subtle tired expression, gentle smile but drowsy eyes, soft pastel colors with warm undertones,
chibi style, kawaii anime aesthetic, simple background, digital illustration, high quality,
fully grown but representing ongoing poor sleep quality, final form`
  },

  // ========================================
  // 睡眠の質：普通（normal）
  // ========================================
  {
    sleepQuality: 'normal',
    growthStage: 'initial',
    fileName: 'sleepin_normal_initial.png',
    description: '元気な小さなスリーピン',
    prompt: `A cute sleepy character mascot, small size, content expression, peaceful eyes,
gentle smile, balanced pastel colors, chibi style, kawaii anime aesthetic,
simple background, digital illustration, high quality, representing normal sleep quality,
healthy and calm look, beginner stage`
  },
  {
    sleepQuality: 'normal',
    growthStage: 'intermediate',
    fileName: 'sleepin_normal_intermediate.png',
    description: '健康的に成長したスリーピン',
    prompt: `A cute sleepy character mascot, medium size, cheerful expression, bright eyes,
happy smile, vibrant pastel colors, chibi style, kawaii anime aesthetic,
simple background, digital illustration, high quality, representing normal sleep quality,
energetic and balanced look, intermediate stage`
  },
  {
    sleepQuality: 'normal',
    growthStage: 'final',
    fileName: 'sleepin_normal_final.png',
    description: '立派に育った健康的なスリーピン',
    prompt: `A cute sleepy character mascot, large size, confident expression, sparkling eyes,
warm smile, rich pastel colors, chibi style, kawaii anime aesthetic,
simple background, digital illustration, high quality, representing normal sleep quality,
fully grown with balanced health, final form`
  },

  // ========================================
  // 睡眠の質：良い（good）
  // ========================================
  {
    sleepQuality: 'good',
    growthStage: 'initial',
    fileName: 'sleepin_good_initial.png',
    description: '最高の睡眠で輝く小さなスリーピン',
    prompt: `A cute sleepy character mascot, small size, radiant expression, sparkling eyes,
joyful smile, glowing aura, bright vibrant pastel colors, chibi style, kawaii anime aesthetic,
simple background with subtle sparkles, digital illustration, high quality,
representing excellent sleep quality, energetic and glowing look, beginner stage`
  },
  {
    sleepQuality: 'good',
    growthStage: 'intermediate',
    fileName: 'sleepin_good_intermediate.png',
    description: '最高の睡眠で輝く中型スリーピン',
    prompt: `A cute sleepy character mascot, medium size, brilliant expression, shining eyes,
big happy smile, glowing aura, vibrant rainbow pastel colors, chibi style, kawaii anime aesthetic,
background with gentle sparkles and light effects, digital illustration, high quality,
representing excellent sleep quality, radiant and energetic, intermediate stage`
  },
  {
    sleepQuality: 'good',
    growthStage: 'final',
    fileName: 'sleepin_good_final.png',
    description: '究極の形態！黄金に輝く最強スリーピン',
    prompt: `A cute sleepy character mascot, very large size, majestic expression,
brilliant sparkling eyes, radiant smile, golden glowing aura, luxurious vibrant colors
with gold accents, chibi style, kawaii anime aesthetic, background with magical sparkles
and light rays, digital illustration, high quality, representing perfect sleep quality,
ultimate evolved form with divine presence, final legendary form`
  },
];

/**
 * 睡眠スコアに基づいて睡眠の質レベルを判定
 */
export function getSleepQualityLevel(sleepScore: number | undefined): SleepQualityLevel {
  if (!sleepScore) return 'normal';

  if (sleepScore >= 80) return 'good';   // 80点以上：良い
  if (sleepScore >= 60) return 'normal'; // 60-79点：普通
  return 'poor';                          // 60点未満：悪い
}

/**
 * 成長ポイントに基づいて成長段階を判定
 */
export function getGrowthStage(growthPoints: number): GrowthStage {
  if (growthPoints >= 100) return 'final';         // 100pt以上：最終形態
  if (growthPoints >= 30) return 'intermediate';   // 30-99pt：中間形態
  return 'initial';                                 // 0-29pt：初期形態
}

/**
 * 現在の状態に応じた適切なスリーピン画像ファイル名を取得
 */
export function getSleepinImageFileName(
  sleepScore: number | undefined,
  growthPoints: number
): string {
  const qualityLevel = getSleepQualityLevel(sleepScore);
  const stage = getGrowthStage(growthPoints);

  const prompt = SLEEPIN_PROMPTS.find(
    p => p.sleepQuality === qualityLevel && p.growthStage === stage
  );

  return prompt?.fileName || 'sleepin_normal_initial.png';
}

/**
 * 画像生成用のプロンプトを取得
 */
export function getSleepinPrompt(
  sleepQuality: SleepQualityLevel,
  growthStage: GrowthStage
): SleepinPrompt | undefined {
  return SLEEPIN_PROMPTS.find(
    p => p.sleepQuality === sleepQuality && p.growthStage === growthStage
  );
}

/**
 * すべてのプロンプトを取得（画像生成バッチ処理用）
 */
export function getAllPrompts(): SleepinPrompt[] {
  return SLEEPIN_PROMPTS;
}
