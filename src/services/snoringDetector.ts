/**
 * いびき検出サービス
 *
 * 機能: expo-av を使用してシンプルな音量ベースのいびき検出を実行
 * アルゴリズム: 音量閾値（-40 dB）+ 継続時間フィルタ（0.3～2.0秒）
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import type { SnoringEvent } from '../types/database';

/**
 * いびき検出設定
 */
interface SnoringDetectorConfig {
  volumeThreshold: number;      // dB閾値（デフォルト: -40）
  minDuration: number;          // 最小継続時間（ms、デフォルト: 300）
  maxDuration: number;          // 最大継続時間（ms、デフォルト: 2000）
  updateInterval: number;       // 音量チェック間隔（ms、デフォルト: 100）
}

/**
 * いびき統計結果
 */
export interface SnoringStatistics {
  totalEvents: number;          // 総いびき回数
  totalDurationMs: number;      // 総いびき時間（ミリ秒）
  totalDurationMinutes: number; // 総いびき時間（分）
  averageVolume: number;        // 平均音量（dBFS）
  events: SnoringEvent[];       // 詳細イベントリスト
}

/**
 * シンプルないびき検出サービス
 */
export class SimpleSnoringDetector {
  // 設定
  private config: SnoringDetectorConfig;

  // 録音オブジェクト
  private recording: Audio.Recording | null = null;

  // 検出状態
  private isMonitoring = false;
  private isCurrentlySnoring = false;
  private snoringStartTime = 0;
  private peakVolume = -160;

  // 検出されたいびきイベント
  private snoringEvents: SnoringEvent[] = [];

  constructor(config?: Partial<SnoringDetectorConfig>) {
    // デフォルト設定
    this.config = {
      volumeThreshold: config?.volumeThreshold ?? -40,
      minDuration: config?.minDuration ?? 300,
      maxDuration: config?.maxDuration ?? 2000,
      updateInterval: config?.updateInterval ?? 100,
    };
  }

  /**
   * いびき監視を開始
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('⚠️ Already monitoring');
      return;
    }

    // Web環境では動作しない
    if (Platform.OS === 'web') {
      throw new Error('いびき検出はモバイルデバイスでのみ利用可能です');
    }

    try {
      // 1. マイク権限をリクエスト
      console.log('🎤 Requesting audio permission...');
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('マイクの使用許可が必要です');
      }

      // 2. 音声モードを設定（バックグラウンド録音を有効化）
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // 3. 録音の準備
      this.recording = new Audio.Recording();

      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,        // 低品質（バッテリー節約）
          numberOfChannels: 1,       // モノラル
          bitRate: 64000,           // 64 kbps
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 64000,
        },
        isMeteringEnabled: true,  // 🔑 音量測定を有効化
      });

      // 4. 状態更新コールバックを設定
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          this.analyzeSnoringLevel(status.metering, Date.now());
        }
      });

      // 5. 録音開始
      await this.recording.startAsync();
      this.isMonitoring = true;

      console.log('✅ Snoring monitoring started');
      console.log(`   Threshold: ${this.config.volumeThreshold} dB`);
      console.log(`   Duration: ${this.config.minDuration}-${this.config.maxDuration} ms`);

    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      throw error;
    }
  }

  /**
   * 音量レベルを解析していびきを検出
   * @private
   */
  private analyzeSnoringLevel(dbLevel: number, timestamp: number): void {
    // 音量が閾値を超えているか
    if (dbLevel > this.config.volumeThreshold) {
      if (!this.isCurrentlySnoring) {
        // いびき開始
        this.isCurrentlySnoring = true;
        this.snoringStartTime = timestamp;
        this.peakVolume = dbLevel;
      } else {
        // いびき継続中 - ピーク音量を更新
        this.peakVolume = Math.max(this.peakVolume, dbLevel);
      }
    } else {
      // 音量が閾値以下
      if (this.isCurrentlySnoring) {
        // いびき終了
        const duration = timestamp - this.snoringStartTime;

        // 継続時間が有効範囲内かチェック（短すぎるノイズを除外）
        if (duration >= this.config.minDuration && duration <= this.config.maxDuration) {
          // 有効ないびきイベントとして記録
          const event: SnoringEvent = {
            timestamp: this.snoringStartTime,
            duration,
            peakVolume: this.peakVolume,
          };

          this.snoringEvents.push(event);

          console.log(`🔊 Snoring #${this.snoringEvents.length}: ${duration}ms, ${this.peakVolume.toFixed(1)}dB`);
        }

        // 状態リセット
        this.isCurrentlySnoring = false;
        this.peakVolume = -160;
      }
    }
  }

  /**
   * いびき監視を停止して統計を取得
   */
  async stopMonitoring(): Promise<SnoringStatistics> {
    if (!this.isMonitoring) {
      console.log('⚠️ Not monitoring');
      return this.getStatistics();
    }

    try {
      if (this.recording) {
        // 録音停止
        await this.recording.stopAndUnloadAsync();

        // 録音ファイルを取得
        const uri = this.recording.getURI();

        // 録音ファイルを削除（ストレージ節約）
        if (uri) {
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
            console.log('🗑️ Audio file deleted (storage saved)');
          } catch (error) {
            console.warn('⚠️ Failed to delete audio file:', error);
          }
        }

        this.recording = null;
      }

      this.isMonitoring = false;

      const stats = this.getStatistics();
      console.log('✅ Snoring monitoring stopped');
      console.log(`   Total events: ${stats.totalEvents}`);
      console.log(`   Total duration: ${stats.totalDurationMinutes.toFixed(1)} min`);
      console.log(`   Average volume: ${stats.averageVolume.toFixed(1)} dB`);

      return stats;

    } catch (error) {
      console.error('❌ Failed to stop monitoring:', error);
      throw error;
    }
  }

  /**
   * 現在の統計を取得（監視中でも取得可能）
   */
  getStatistics(): SnoringStatistics {
    const totalEvents = this.snoringEvents.length;
    const totalDurationMs = this.snoringEvents.reduce((sum, e) => sum + e.duration, 0);
    const totalDurationMinutes = totalDurationMs / 1000 / 60;
    const averageVolume = totalEvents > 0
      ? this.snoringEvents.reduce((sum, e) => sum + e.peakVolume, 0) / totalEvents
      : 0;

    return {
      totalEvents,
      totalDurationMs,
      totalDurationMinutes,
      averageVolume,
      events: [...this.snoringEvents],
    };
  }

  /**
   * 検出設定を変更（監視中でも可能）
   */
  updateConfig(config: Partial<SnoringDetectorConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    console.log('🔧 Config updated:', this.config);
  }

  /**
   * 統計をリセット
   */
  reset(): void {
    this.snoringEvents = [];
    this.isCurrentlySnoring = false;
    this.snoringStartTime = 0;
    this.peakVolume = -160;
    console.log('🔄 Statistics reset');
  }

  /**
   * 監視状態を確認
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * 現在のいびき検出数を取得
   */
  getCurrentCount(): number {
    return this.snoringEvents.length;
  }
}
