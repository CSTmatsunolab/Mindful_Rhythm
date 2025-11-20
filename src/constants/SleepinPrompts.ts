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
  // 睡眠の質：悪い（poor）- 悪魔モチーフ
  // ========================================
  {
    sleepQuality: 'poor',
    growthStage: 'initial',
    fileName: 'sleepin_poor_initial.png',
    description: '小さな悪魔風スリーピン（ツノのみ）',
    prompt: `A cute round-shaped character named Sleepin, sleep mascot character, adorable kawaii style,
small devil horns on head, NO wings, chibi deformed proportions, simple and minimal design,
soft pastel colors, gentle expression, completely plain white background, no text or letters,
digital illustration, character design, mascot art`
  },
  {
    sleepQuality: 'poor',
    growthStage: 'intermediate',
    fileName: 'sleepin_poor_intermediate.png',
    description: '中型悪魔風スリーピン（ツノ＋翼）',
    prompt: `A cute round-shaped character named Sleepin, sleep mascot character, adorable kawaii style,
devil horns on head AND small bat wings, more devil-like appearance than initial form,
chibi deformed proportions, medium size, soft pastel colors with slightly darker tones,
gentle expression, completely plain white background, no text or letters,
digital illustration, character design, mascot art`
  },
  {
    sleepQuality: 'poor',
    growthStage: 'final',
    fileName: 'sleepin_poor_final.png',
    description: '大型悪魔風スリーピン（ツノ＋翼＋武器）',
    prompt: `A cute round-shaped character named Sleepin, sleep mascot character, adorable kawaii style,
devil horns on head AND bat wings, holding a cute weapon (trident or staff), full devil-like appearance,
chibi deformed proportions, large size, soft pastel colors with darker accents,
gentle but powerful expression, completely plain white background, no text or letters,
digital illustration, character design, mascot art`
  },

  // ========================================
  // 睡眠の質：普通（normal）- シンプルモチーフ
  // ========================================
  {
    sleepQuality: 'normal',
    growthStage: 'initial',
    fileName: 'sleepin_normal_initial.png',
    description: '小さくシンプルなスリーピン',
    prompt: `A very simple and normal cute round-shaped character named Sleepin, sleep mascot character,
adorable kawaii style, VERY small and minimal design, no horns, no wings, no accessories,
plain simple round body, chibi deformed proportions, soft neutral pastel colors,
peaceful gentle expression, completely plain white background, no text or letters,
digital illustration, character design, mascot art, minimalist style`
  },
  {
    sleepQuality: 'normal',
    growthStage: 'intermediate',
    fileName: 'sleepin_normal_intermediate.png',
    description: '中型でシンプルなスリーピン',
    prompt: `A very simple and normal cute round-shaped character named Sleepin, sleep mascot character,
adorable kawaii style, medium size (larger than initial form), no horns, no wings, no accessories,
plain simple round body, chibi deformed proportions, soft neutral pastel colors,
peaceful gentle expression, completely plain white background, no text or letters,
digital illustration, character design, mascot art, minimalist style`
  },
  {
    sleepQuality: 'normal',
    growthStage: 'final',
    fileName: 'sleepin_normal_final.png',
    description: '大型でシンプルなスリーピン',
    prompt: `A very simple and normal cute round-shaped character named Sleepin, sleep mascot character,
adorable kawaii style, large size (larger than intermediate form), no horns, no wings, no accessories,
plain simple round body, chibi deformed proportions, soft neutral pastel colors,
peaceful gentle expression, completely plain white background, no text or letters,
digital illustration, character design, mascot art, minimalist style`
  },

  // ========================================
  // 睡眠の質：良い（good）- 天使モチーフ
  // ========================================
  {
    sleepQuality: 'good',
    growthStage: 'initial',
    fileName: 'sleepin_good_initial.png',
    description: '小さな天使風スリーピン（輪っか＋小さい羽）',
    prompt: `A cute round-shaped character named Sleepin, sleep mascot character, adorable kawaii style,
angel halo floating above head AND small simple wings, angelic appearance,
chibi deformed proportions, small size, soft bright pastel colors with gentle glow,
peaceful happy expression, completely plain white background, no text or letters,
digital illustration, character design, mascot art`
  },
  {
    sleepQuality: 'good',
    growthStage: 'intermediate',
    fileName: 'sleepin_good_intermediate.png',
    description: '中型天使風スリーピン（輪っか＋大きい翼）',
    prompt: `A cute round-shaped character named Sleepin, sleep mascot character, adorable kawaii style,
angel halo floating above head AND large beautiful wings, angelic appearance,
chibi deformed proportions, medium size, bright vibrant pastel colors with glowing aura,
joyful radiant expression, completely plain white background, no text or letters,
digital illustration, character design, mascot art`
  },
  {
    sleepQuality: 'good',
    growthStage: 'final',
    fileName: 'sleepin_good_final.png',
    description: '大型天使風スリーピン（輪っか＋大きい翼＋武器）',
    prompt: `A cute round-shaped character named Sleepin, sleep mascot character, adorable kawaii style,
angel halo floating above head AND large majestic wings, holding a cute holy weapon (staff or wand),
full angelic appearance, chibi deformed proportions, large size,
bright golden pastel colors with radiant glowing aura, divine powerful expression,
completely plain white background, no text or letters,
digital illustration, character design, mascot art`
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
