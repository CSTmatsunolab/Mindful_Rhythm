import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { getRecentSleepRecords } from '../services/database';
import type { SleepRecord } from '../types/database';
import SleepRecordChart from '../components/SleepRecordChart';

type PeriodType = '7days' | '30days';

/**
 * グラフ分析画面
 * 睡眠記録の統計とグラフを表示
 */
export default function StatisticsScreen() {
  const [period, setPeriod] = useState<PeriodType>('7days');
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * データを取得
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const days = period === '7days' ? 7 : 30;
      const data = await getRecentSleepRecords(days);
      setRecords(data);
    } catch (error) {
      console.error('❌ Failed to load statistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 期間変更時にデータを再取得
   */
  useEffect(() => {
    loadData();
  }, [period]);

  /**
   * 画面フォーカス時にデータを再取得
   */
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [period])
  );

  /**
   * 統計情報を計算
   */
  const calculateStats = () => {
    if (records.length === 0) {
      return {
        averageScore: 0,
        averageHours: 0,
        totalRecords: 0,
        goodDays: 0,
        normalDays: 0,
        poorDays: 0,
      };
    }

    const validScores = records
      .map(r => r.score)
      .filter((score): score is number => score !== null && score !== undefined);

    const validHours = records
      .map(r => r.total_hours)
      .filter((hours): hours is number => hours !== null && hours !== undefined);

    const averageScore = validScores.length > 0
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : 0;

    const averageHours = validHours.length > 0
      ? validHours.reduce((sum, hours) => sum + hours, 0) / validHours.length
      : 0;

    const goodDays = validScores.filter(score => score >= 80).length;
    const normalDays = validScores.filter(score => score >= 60 && score < 80).length;
    const poorDays = validScores.filter(score => score < 60).length;

    return {
      averageScore: Math.round(averageScore),
      averageHours: Math.round(averageHours * 10) / 10,
      totalRecords: records.length,
      goodDays,
      normalDays,
      poorDays,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>睡眠統計</Text>
        <Text style={styles.subtitle}>睡眠の質を分析しましょう</Text>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === '7days' && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod('7days')}
          >
            <Text style={[
              styles.periodButtonText,
              period === '7days' && styles.periodButtonTextActive,
            ]}>
              7日間
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === '30days' && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod('30days')}
          >
            <Text style={[
              styles.periodButtonText,
              period === '30days' && styles.periodButtonTextActive,
            ]}>
              30日間
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        {stats.totalRecords > 0 ? (
          <>
            <View style={styles.statsGrid}>
              {/* Average Score */}
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>平均スコア</Text>
                <Text style={styles.statValue}>{stats.averageScore}</Text>
                <Text style={styles.statUnit}>点</Text>
              </View>

              {/* Average Hours */}
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>平均睡眠時間</Text>
                <Text style={styles.statValue}>{stats.averageHours}</Text>
                <Text style={styles.statUnit}>時間</Text>
              </View>

              {/* Total Records */}
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>記録日数</Text>
                <Text style={styles.statValue}>{stats.totalRecords}</Text>
                <Text style={styles.statUnit}>日</Text>
              </View>
            </View>

            {/* Sleep Quality Distribution */}
            <View style={styles.distributionCard}>
              <Text style={styles.distributionTitle}>睡眠の質の内訳</Text>
              <View style={styles.distributionRow}>
                <View style={styles.distributionItem}>
                  <View style={[styles.distributionDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.distributionLabel}>良い</Text>
                  <Text style={styles.distributionValue}>{stats.goodDays}日</Text>
                </View>
                <View style={styles.distributionItem}>
                  <View style={[styles.distributionDot, { backgroundColor: '#FFC107' }]} />
                  <Text style={styles.distributionLabel}>普通</Text>
                  <Text style={styles.distributionValue}>{stats.normalDays}日</Text>
                </View>
                <View style={styles.distributionItem}>
                  <View style={[styles.distributionDot, { backgroundColor: '#F44336' }]} />
                  <Text style={styles.distributionLabel}>悪い</Text>
                  <Text style={styles.distributionValue}>{stats.poorDays}日</Text>
                </View>
              </View>
            </View>

            {/* Chart */}
            <SleepRecordChart records={records} />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>データがありません</Text>
            <Text style={styles.emptySubtext}>睡眠記録を追加しましょう</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.accent,
  },
  periodButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    ...Typography.h1,
    color: Colors.accent,
    fontSize: 32,
    fontWeight: 'bold',
  },
  statUnit: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  distributionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  distributionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  distributionItem: {
    alignItems: 'center',
  },
  distributionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  distributionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  distributionValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: 'bold',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.h2,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
