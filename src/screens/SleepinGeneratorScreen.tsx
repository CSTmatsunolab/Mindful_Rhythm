/**
 * スリーピン画像生成画面
 *
 * OpenAI DALL-E 3を使用してスリーピン画像を生成する
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import {
  generateAllSleepinImages,
  getGenerationStatus,
  deleteAllImages,
} from '../services/sleepinImageGenerator';

export default function SleepinGeneratorScreen() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 9, message: '' });
  const [status, setStatus] = useState({ total: 0, generated: 0, percentage: 0, missing: [] as string[] });

  /**
   * 生成状況を読み込む
   */
  const loadStatus = async () => {
    const statusData = await getGenerationStatus();
    setStatus(statusData);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  /**
   * すべての画像を生成
   */
  const handleGenerateAll = async () => {
    Alert.alert(
      '画像生成を開始',
      '9枚の画像を生成します。完了まで約3-5分かかります。\n\n注意：OpenAI API キーが必要です（.envに設定）',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '開始',
          onPress: async () => {
            try {
              setGenerating(true);
              await generateAllSleepinImages((current, total, message) => {
                setProgress({ current, total, message });
              });

              Alert.alert('✅ 完了', '全ての画像生成が完了しました！');
              await loadStatus();
            } catch (error: any) {
              Alert.alert('❌ エラー', error.message || '画像生成に失敗しました');
            } finally {
              setGenerating(false);
              setProgress({ current: 0, total: 9, message: '' });
            }
          },
        },
      ]
    );
  };

  /**
   * すべての画像を削除
   */
  const handleDeleteAll = async () => {
    Alert.alert(
      '画像を削除',
      'すべてのスリーピン画像を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllImages();
              Alert.alert('✅ 完了', '全ての画像を削除しました');
              await loadStatus();
            } catch (error: any) {
              Alert.alert('❌ エラー', error.message || '削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <Text style={styles.title}>🎨 スリーピン画像生成</Text>
        <Text style={styles.subtitle}>AI画像生成でスリーピンを作成</Text>

        {/* 生成状況カード */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>生成状況</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>生成済み:</Text>
            <Text style={styles.statusValue}>
              {status.generated} / {status.total} 枚
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${status.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>{status.percentage.toFixed(0)}%</Text>

          {status.missing.length > 0 && (
            <View style={styles.missingSection}>
              <Text style={styles.missingTitle}>未生成の画像:</Text>
              {status.missing.map((fileName) => (
                <Text key={fileName} style={styles.missingItem}>
                  • {fileName}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 進捗表示 */}
        {generating && (
          <View style={styles.progressCard}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.progressText}>
              {progress.current} / {progress.total}
            </Text>
            <Text style={styles.progressMessage}>{progress.message}</Text>
            <Text style={styles.waitText}>
              ※ 1枚あたり約15-20秒かかります
            </Text>
          </View>
        )}

        {/* 説明 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📝 使い方</Text>
          <Text style={styles.infoText}>
            1. OpenAI APIキーを .env ファイルに設定{'\n'}
            　 EXPO_PUBLIC_OPENAI_API_KEY=sk-...{'\n\n'}
            2. 「すべて生成」ボタンで9枚の画像を生成{'\n'}
            　 （睡眠の質 3種類 × 成長段階 3種類）{'\n\n'}
            3. 生成された画像はローカルストレージに保存{'\n'}
            　 ホーム画面で自動的に表示されます
          </Text>
        </View>

        {/* アクションボタン */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            generating && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerateAll}
          disabled={generating}
        >
          <Text style={styles.generateButtonText}>
            {generating ? '生成中...' : 'すべて生成（約3-5分）'}
          </Text>
        </TouchableOpacity>

        {status.generated > 0 && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAll}
            disabled={generating}
          >
            <Text style={styles.deleteButtonText}>すべて削除</Text>
          </TouchableOpacity>
        )}

        {/* 注意事項 */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ 注意事項</Text>
          <Text style={styles.warningText}>
            • OpenAI API利用料金が発生します{'\n'}
            • DALL-E 3: 1枚あたり約$0.04{'\n'}
            • 9枚で約$0.36の費用{'\n'}
            • 生成には3-5分程度かかります{'\n'}
            • インターネット接続が必要です
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statusTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  statusValue: {
    ...Typography.h3,
    color: Colors.accent,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  percentageText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  missingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  missingTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  missingItem: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 8,
    marginBottom: 4,
  },
  progressCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  progressMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  waitText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  generateButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    ...Typography.button,
    color: Colors.text,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  warningTitle: {
    ...Typography.h4,
    color: '#856404',
    marginBottom: 12,
  },
  warningText: {
    ...Typography.body,
    color: '#856404',
    lineHeight: 22,
  },
});
