/**
 * AIアドバイス生成ロジック
 *
 * スコアと睡眠データからルールベースでアドバイスを生成
 *
 * 担当: 増田さん
 * Week: 5-6（拡張機能実装フェーズ）
 */

import { SleepRecord } from '../types/database';
import { getRandomMission } from './database';

/**
 * アドバイスの種類
 */
export type AdviceType = 'breathing' | 'bgm' | 'stretch' | 'sleep_hygiene';

/**
 * アドバイスデータ構造
 */
export interface Advice {
  text: string;
  type: AdviceType;
  priority: 'high' | 'medium' | 'low';
}

/**
 * スコアと睡眠データからアドバイスを生成
 *
 * @param score 睡眠スコア
 * @param sleepData 睡眠記録データ
 * @returns アドバイス文
 *
 * @example
 * const advice = generateAdvice(65, sleepRecord);
 * console.log(advice);
 */
export function generateAdvice(score: number, sleepData: SleepRecord): Advice {
  // スコア別の基本アドバイス
  if (score >= 90) {
    return {
      text: '素晴らしい睡眠です！この調子で規則正しい生活を続けましょう。🌟',
      type: 'sleep_hygiene',
      priority: 'low',
    };
  }

  if (score >= 80) {
    return {
      text: '良い睡眠が取れています。今のリズムを維持しましょう！😊',
      type: 'sleep_hygiene',
      priority: 'low',
    };
  }

  // スコア60～80: 問題箇所を特定してアドバイス
  if (score >= 60) {
    return analyzeAndAdvise(sleepData);
  }

  // スコア60未満: 総合的な改善アドバイス
  return {
    text: '睡眠の質が低下しています。就寝・起床時刻を一定にすることから始めましょう。',
    type: 'sleep_hygiene',
    priority: 'high',
  };
}

/**
 * 睡眠データを分析して具体的なアドバイスを生成
 */
function analyzeAndAdvise(sleepData: SleepRecord): Advice {
  // 1. 中途覚醒が多い場合
  if (sleepData.awakenings && sleepData.awakenings > 2) {
    return {
      text: '中途覚醒が多いようです。寝室の温度や照明を見直してみましょう。🌡️',
      type: 'sleep_hygiene',
      priority: 'high',
    };
  }

  // 2. 入眠潜時が長い場合
  if (sleepData.sleep_latency && sleepData.sleep_latency > 30) {
    return {
      text: '寝付きが悪いようです。就寝1時間前にリラックスタイムを設けてみましょう。🛀',
      type: 'breathing',
      priority: 'high',
    };
  }

  // 3. 睡眠時間が短い場合
  if (sleepData.total_hours && sleepData.total_hours < 6) {
    return {
      text: '睡眠時間が不足しています。就寝時刻を30分早めてみましょう。⏰',
      type: 'sleep_hygiene',
      priority: 'high',
    };
  }

  // 4. 睡眠の質が悪い場合
  if (sleepData.sleep_quality === '浅かった') {
    return {
      text: '睡眠が浅いようです。就寝前の軽いストレッチがおすすめです。🧘',
      type: 'stretch',
      priority: 'medium',
    };
  }

  // 5. 環境タグが不足している場合
  const tags = sleepData.tags || [];
  if (tags.length < 2) {
    return {
      text: '睡眠環境を整えましょう。運動・入浴・カフェイン制限を意識してみてください。',
      type: 'sleep_hygiene',
      priority: 'medium',
    };
  }

  // デフォルト
  return {
    text: 'もう少し改善できそうです。睡眠日記をつけて、自分のパターンを見つけましょう。📝',
    type: 'sleep_hygiene',
    priority: 'medium',
  };
}

/**
 * アドバイスタイプ別の詳細アドバイス集
 */
export const DETAILED_ADVICE = {
  breathing: [
    '4-7-8呼吸法: 4秒吸って、7秒止めて、8秒かけて吐く',
    '腹式呼吸: お腹を膨らませながらゆっくり息を吸う',
    'ボディスキャン: つま先から頭まで順番に意識を向ける',
  ],
  bgm: [
    'α波音楽（クラシック、自然音）を小さな音量で流す',
    'ホワイトノイズで周囲の雑音をマスクする',
    '528Hzのヒーリング音楽を試してみる',
  ],
  stretch: [
    '首・肩のストレッチ: 首を左右にゆっくり倒す',
    '腰のストレッチ: 仰向けで膝を抱える',
    '全身リラックス: 全身に力を入れて一気に脱力',
  ],
  sleep_hygiene: [
    '毎日同じ時刻に寝る・起きる',
    '寝る1時間前はスマホ・PCを見ない',
    'カフェインは15時以降摂取しない',
    '寝室を暗く静かに保つ（18～22℃）',
  ],
};

/**
 * ランダムな詳細アドバイスを取得
 *
 * @param type アドバイスタイプ
 * @returns 詳細アドバイス配列
 */
export function getDetailedAdvice(type: AdviceType): string[] {
  return DETAILED_ADVICE[type];
}

/**
 * 今日の睡眠改善課題をランダムに取得
 *
 * @returns 課題テキスト
 *
 * @example
 * const mission = await getTodayMission();
 * console.log('Today mission:', mission);
 */
export async function getTodayMission(): Promise<string> {
  try {
    const mission = await getRandomMission();
    return mission?.mission_text ?? 'デフォルト課題: 毎日同じ時刻に寝る・起きる';
  } catch (error) {
    console.error('Error getting today mission:', error);
    return 'デフォルト課題: 毎日同じ時刻に寝る・起きる';
  }
}

/**
 * スコア推移に基づくトレンドアドバイス
 *
 * Week 7-8 で実装予定（グラフ分析機能と連携）
 *
 * @param recentScores 最近7日分のスコア配列
 * @returns トレンドアドバイス
 */
export function generateTrendAdvice(recentScores: number[]): string {
  if (recentScores.length < 3) {
    return '継続的に記録を付けることで、トレンドが分析できます。';
  }

  // TODO: 増田さんが実装
  // 1. 上昇トレンド: 「改善しています！この調子で続けましょう」
  // 2. 下降トレンド: 「少し睡眠の質が下がっています。原因を探ってみましょう」
  // 3. 安定: 「安定した睡眠が取れています」

  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const recent3Avg = recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

  if (recent3Avg > avg + 5) {
    return '最近3日間で睡眠の質が改善しています！この調子で続けましょう。📈';
  } else if (recent3Avg < avg - 5) {
    return '最近3日間で睡眠の質が下がっています。原因を探ってみましょう。📉';
  } else {
    return '安定した睡眠が取れています。このリズムを維持しましょう。';
  }
}
