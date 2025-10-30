/**
 * 感情選択モーダルコンポーネント
 *
 * タスク完了時に表示される6種類の絵文字選択モーダル
 *
 * 担当: 藤川さん
 * Week: 3-4
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

/**
 * 感情の絵文字と説明
 */
const EMOTIONS = [
  { emoji: '😊', label: '嬉しい' },
  { emoji: '😌', label: '満足' },
  { emoji: '😫', label: '疲れた' },
  { emoji: '😡', label: 'イライラ' },
  { emoji: '😭', label: '辛い' },
  { emoji: '😴', label: '眠い' },
];

interface EmotionPickerProps {
  visible: boolean;
  onSelect: (emotion: string) => void;
  onClose: () => void;
}

/**
 * 感情選択モーダル
 *
 * 使い方:
 * <EmotionPicker
 *   visible={showEmotionPicker}
 *   onSelect={(emoji) => handleEmotionSelect(emoji)}
 *   onClose={() => setShowEmotionPicker(false)}
 * />
 */
export default function EmotionPicker({ visible, onSelect, onClose }: EmotionPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 背景オーバーレイ */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* モーダルコンテンツ */}
        <View style={styles.modalContent}>
          <Text style={styles.title}>タスク完了時の気分は？</Text>
          <Text style={styles.subtitle}>タップして選択してください</Text>

          {/* 感情グリッド */}
          <View style={styles.emotionGrid}>
            {EMOTIONS.map(({ emoji, label }) => (
              <TouchableOpacity
                key={emoji}
                style={styles.emotionButton}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
              >
                <Text style={styles.emotionEmoji}>{emoji}</Text>
                <Text style={styles.emotionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* キャンセルボタン */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  emotionButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 12,
    padding: 8,
  },
  emotionEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emotionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: 'bold',
  },
});
