/**
 * 睡眠スコア算出アルゴリズム
 *
 * CBT-I理論に基づく5指標から0～100点の睡眠スコアを計算
 *
 * 担当: 増田さん
 * 参照: 002-requirements_definition_v0.1.md セクション4
 */

import { calculateHoursDifference } from '../utils/dateFormatter';

/**
 * 睡眠スコア計算用の入力データ型
 */
export interface SleepScoreInput {
  bedtime: string;                                // "22:30"
  waketime: string;                               // "07:00"
  sleep_quality: 'よく眠れた' | '普通' | '浅かった';
  awakenings: number;                             // 中途覚醒回数
  sleep_latency: number;                          // 入眠潜時（分）
  tags: string[];                                 // ['運動', 'カフェインなし', '入浴', '室温適正']
}

/**
 * 睡眠スコア計算結果の詳細
 */
export interface SleepScoreResult {
  totalScore: number;                             // 総合スコア 0～100
  breakdown: {
    sleepTime: { score: number; weight: number; weighted: number };
    deepSleep: { score: number; weight: number; weighted: number };
    awakenings: { score: number; weight: number; weighted: number };
    latency: { score: number; weight: number; weighted: number };
    environment: { score: number; weight: number; weighted: number };
  };
  totalHours: number;                             // 総睡眠時間
}

/**
 * 重み係数（合計100%）
 */
const WEIGHTS = {
  SLEEP_TIME: 0.30,      // 30%
  DEEP_SLEEP: 0.25,      // 25%
  AWAKENINGS: 0.20,      // 20%
  LATENCY: 0.15,         // 15%
  ENVIRONMENT: 0.10,     // 10%
};

/**
 * メイン関数: 睡眠スコア計算
 *
 * @param data 睡眠記録データ
 * @returns 総合スコアと内訳
 *
 * @example
 * const result = calculateSleepScore({
 *   bedtime: '22:30',
 *   waketime: '07:00',
 *   sleep_quality: 'よく眠れた',
 *   awakenings: 1,
 *   sleep_latency: 15,
 *   tags: ['運動', 'カフェインなし', '入浴']
 * });
 * console.log('Total score:', result.totalScore); // 87
 */
export function calculateSleepScore(data: SleepScoreInput): SleepScoreResult {
  // 1. 睡眠時間スコア（30%）
  const totalHours = calculateHoursDifference(data.bedtime, data.waketime);
  const sleepTimeScore = calculateSleepTimeScore(totalHours);

  // 2. 深睡眠スコア（25%）
  const deepSleepScore = calculateDeepSleepScore(data.sleep_quality);

  // 3. 中途覚醒スコア（20%）
  const awakeningsScore = calculateAwakeningsScore(data.awakenings);

  // 4. 入眠潜時スコア（15%）
  const latencyScore = calculateLatencyScore(data.sleep_latency);

  // 5. 環境スコア（10%）
  const environmentScore = calculateEnvironmentScore(data.tags);

  // 重み付け合計
  const totalScore = Math.round(
    sleepTimeScore * WEIGHTS.SLEEP_TIME +
    deepSleepScore * WEIGHTS.DEEP_SLEEP +
    awakeningsScore * WEIGHTS.AWAKENINGS +
    latencyScore * WEIGHTS.LATENCY +
    environmentScore * WEIGHTS.ENVIRONMENT
  );

  return {
    totalScore,
    breakdown: {
      sleepTime: {
        score: sleepTimeScore,
        weight: WEIGHTS.SLEEP_TIME,
        weighted: sleepTimeScore * WEIGHTS.SLEEP_TIME,
      },
      deepSleep: {
        score: deepSleepScore,
        weight: WEIGHTS.DEEP_SLEEP,
        weighted: deepSleepScore * WEIGHTS.DEEP_SLEEP,
      },
      awakenings: {
        score: awakeningsScore,
        weight: WEIGHTS.AWAKENINGS,
        weighted: awakeningsScore * WEIGHTS.AWAKENINGS,
      },
      latency: {
        score: latencyScore,
        weight: WEIGHTS.LATENCY,
        weighted: latencyScore * WEIGHTS.LATENCY,
      },
      environment: {
        score: environmentScore,
        weight: WEIGHTS.ENVIRONMENT,
        weighted: environmentScore * WEIGHTS.ENVIRONMENT,
      },
    },
    totalHours,
  };
}

/**
 * 指標1: 睡眠時間スコア（重み30%）
 *
 * 根拠: 推奨睡眠時間7時間（National Sleep Foundation）
 *
 * @param totalHours 総睡眠時間（時間単位）
 * @returns 0～100点
 *
 * スコア例:
 * - 5時間: 71点
 * - 7時間: 100点
 * - 8時間: 100点（上限）
 */
function calculateSleepTimeScore(totalHours: number): number {
  // 7時間を100点として線形計算、上限100点
  return Math.min((totalHours / 7.0) * 100, 100);
}

/**
 * 指標2: 深睡眠スコア（重み25%）
 *
 * MVP版: 手入力による3段階評価
 * 将来版: 加速度センサーによる体動検知
 *
 * @param quality 睡眠の質（手入力）
 * @returns 0～100点
 */
function calculateDeepSleepScore(quality: 'よく眠れた' | '普通' | '浅かった'): number {
  const scoreMap = {
    'よく眠れた': 100,
    '普通': 70,
    '浅かった': 40,
  };
  return scoreMap[quality];
}

/**
 * 指標3: 中途覚醒スコア（重み20%）
 *
 * 根拠: 覚醒回数が多いほど睡眠の質が低下（PSQI指標）
 *
 * @param awakenings 中途覚醒回数
 * @returns 0～100点
 *
 * スコア例:
 * - 0回: 100点
 * - 1回: 90点
 * - 3回: 70点
 * - 10回以上: 0点
 */
function calculateAwakeningsScore(awakenings: number): number {
  // 1回あたり-10点、下限0点
  return Math.max(100 - (awakenings * 10), 0);
}

/**
 * 指標4: 入眠潜時スコア（重み15%）
 *
 * 根拠: 15分以内の入眠が理想（Sleep Foundation）
 *
 * @param latencyMinutes 入眠潜時（分）
 * @returns 0～100点
 *
 * スコア例:
 * - 10分: 100点
 * - 15分: 100点（理想）
 * - 30分: 70点
 * - 50分以上: 0点
 */
function calculateLatencyScore(latencyMinutes: number): number {
  // 15分を基準に、1分超過あたり-2点
  const score = 100 - Math.max(latencyMinutes - 15, 0) * 2;
  return Math.max(score, 0);
}

/**
 * 指標5: 環境スコア（重み10%）
 *
 * 根拠: CBT-Iの睡眠衛生教育（AASM推奨）
 *
 * @param tags 睡眠環境タグ配列
 * @returns 0～100点
 *
 * 評価項目:
 * - '運動': +5点
 * - 'カフェインなし': +5点
 * - '入浴': +3点
 * - '室温適正': +2点
 * 合計15点満点 → 100点満点に変換
 */
function calculateEnvironmentScore(tags: string[]): number {
  let score = 0;

  // タグごとの加点
  if (tags.includes('運動')) score += 5;
  if (tags.includes('カフェインなし')) score += 5;
  if (tags.includes('入浴')) score += 3;
  if (tags.includes('室温適正')) score += 2;

  // TODO: 追加で他のタグも評価したい場合はここに追加
  // 例:
  // if (tags.includes('アルコールなし')) score += 3;
  // if (tags.includes('スマホ制限')) score += 4;

  // 15点満点を100点満点に変換
  return (score / 15) * 100;
}

/**
 * スコア評価コメント生成
 *
 * @param score 総合スコア
 * @returns 評価コメント
 *
 * @example
 * const comment = getScoreComment(85);
 * console.log(comment); // "とても良い睡眠です"
 */
export function getScoreComment(score: number): string {
  if (score >= 90) return 'とても良い睡眠です！';
  if (score >= 80) return '良い睡眠です';
  if (score >= 70) return 'まずまずの睡眠です';
  if (score >= 60) return '改善の余地があります';
  if (score >= 50) return '睡眠の質が低下しています';
  return '睡眠環境を見直しましょう';
}

/**
 * スコアに応じた色を取得（UI表示用）
 *
 * @param score 総合スコア
 * @returns カラーコード
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'; // 緑（良い）
  if (score >= 60) return '#F59E0B'; // オレンジ（普通）
  return '#EF4444'; // 赤（悪い）
}
