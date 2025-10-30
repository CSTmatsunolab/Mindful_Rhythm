/**
 * 日付・時刻ユーティリティ関数
 *
 * 用途: データベースとの日付やりとり、UI表示用フォーマット
 * 作成者: 共通ユーティリティ
 */

/**
 * Date オブジェクトを YYYY-MM-DD 形式に変換
 * @param date Date オブジェクト
 * @returns "2025-10-30" 形式の文字列
 *
 * @example
 * const today = formatDate(new Date());
 * console.log(today); // "2025-10-30"
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date オブジェクトを HH:MM 形式に変換
 * @param date Date オブジェクト
 * @returns "22:30" 形式の文字列
 *
 * @example
 * const now = formatTime(new Date());
 * console.log(now); // "15:45"
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * "HH:MM" 形式の文字列から Date オブジェクトを作成
 * @param timeString "22:30" 形式の時刻文字列
 * @returns Date オブジェクト（日付は今日）
 *
 * @example
 * const bedtime = parseTime("22:30");
 * console.log(bedtime.getHours()); // 22
 */
export function parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * 2つの時刻間の差分を時間単位で計算（日をまたぐ対応）
 * @param bedtime 就寝時刻 "22:30"
 * @param waketime 起床時刻 "07:00"
 * @returns 差分時間（小数点含む）
 *
 * @example
 * const hours = calculateHoursDifference("22:30", "07:00");
 * console.log(hours); // 8.5
 */
export function calculateHoursDifference(bedtime: string, waketime: string): number {
  const bed = parseTime(bedtime);
  const wake = parseTime(waketime);

  // 日をまたぐ場合の処理（起床時刻が就寝時刻より早い場合）
  if (wake < bed) {
    wake.setDate(wake.getDate() + 1);
  }

  const diffMs = wake.getTime() - bed.getTime();
  return diffMs / (1000 * 60 * 60); // ミリ秒 → 時間
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 * @returns "2025-10-30" 形式の文字列
 *
 * @example
 * const today = getToday();
 * console.log(today); // "2025-10-30"
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * 昨日の日付を YYYY-MM-DD 形式で取得
 * @returns "2025-10-29" 形式の文字列
 */
export function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * N日前の日付を YYYY-MM-DD 形式で取得
 * @param daysAgo 何日前か
 * @returns "2025-10-23" 形式の文字列
 *
 * @example
 * const weekAgo = getDaysAgo(7);
 * console.log(weekAgo); // 7日前の日付
 */
export function getDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDate(date);
}

/**
 * 日付文字列を "10月30日(月)" 形式に変換
 * @param dateString "2025-10-30" 形式
 * @returns "10月30日(月)" 形式
 */
export function formatDateJapanese(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日(${weekday})`;
}
