/**
 * 睡眠記録グラフコンポーネント
 *
 * 直近5日間の睡眠スコアをバーグラフで表示
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import type { SleepRecord } from '../types/database';

interface Props {
  records: SleepRecord[];
}

export default function SleepRecordChart({ records }: Props) {
  // データを日付の古い順に並び替え（左から古い順に表示）
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // 最大スコア（グラフの高さ調整用）
  const maxScore = 100;

  // 表示するレコード数に応じてタイトルを変更
  const getTitle = () => {
    if (records.length <= 5) {
      return '直近5日間の睡眠記録';
    } else if (records.length <= 7) {
      return '直近7日間の睡眠記録';
    } else if (records.length <= 30) {
      return '直近30日間の睡眠記録';
    }
    return `直近${records.length}日間の睡眠記録`;
  };

  // 日付をフォーマット（例: 12/25 → 25、レコード数が多い場合は簡略化）
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (records.length > 10) {
      // 10日以上の場合は日付のみ表示
      return `${date.getDate()}`;
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // スコアに応じた色を取得
  const getScoreColor = (score: number | undefined) => {
    if (!score) return Colors.border;
    if (score >= 80) return '#4CAF50'; // 緑（良い）
    if (score >= 60) return '#FFC107'; // 黄色（普通）
    return '#F44336'; // 赤（悪い）
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getTitle()}</Text>

      {sortedRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>データがありません</Text>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          {/* グラフエリア */}
          <View style={styles.barsContainer}>
            {sortedRecords.map((record, index) => {
              const score = record.score || 0;
              const barHeight = (score / maxScore) * 120; // 最大120pxの高さ

              return (
                <View key={record.id} style={styles.barWrapper}>
                  {/* スコア表示（10日以内の場合のみ） */}
                  {records.length <= 10 && (
                    <Text style={styles.scoreText}>{score}</Text>
                  )}

                  {/* バー */}
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: getScoreColor(score),
                        },
                      ]}
                    />
                  </View>

                  {/* 日付表示 */}
                  <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                </View>
              );
            })}
          </View>

          {/* 凡例 */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>良い (80+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
              <Text style={styles.legendText}>普通 (60-79)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>悪い (-59)</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  chartContainer: {
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 16,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 8,
  },
  scoreText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 9,
  },
  barContainer: {
    width: '100%',
    maxWidth: 40,
    minWidth: 8,
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 3,
    minHeight: 4,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 8,
    fontSize: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
  },
});
