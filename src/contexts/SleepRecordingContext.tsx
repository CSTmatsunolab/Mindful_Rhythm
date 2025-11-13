/**
 * 睡眠記録コンテキスト
 *
 * 機能: 睡眠記録の状態を管理（開始時刻、経過時間、いびき検出状態など）
 * グローバル状態として提供し、複数の画面から参照可能
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { SimpleSnoringDetector, SnoringStatistics } from '../services/snoringDetector';
import { saveSleepRecord } from '../services/database';
import { SleepRecord } from '../types/database';

/**
 * 睡眠記録の結果
 */
export interface SleepRecordResult {
  startTime: Date;
  endTime: Date;
  durationHours: number;
  snoringStats: SnoringStatistics;
}

/**
 * コンテキストの型定義
 */
interface SleepRecordingContextType {
  // 記録状態
  isRecording: boolean;
  recordingStartTime: Date | null;
  elapsedSeconds: number;

  // いびき検出状態
  snoringCount: number;
  isCurrentlySnoring: boolean;

  // 操作
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<SleepRecordResult>;
  cancelRecording: () => Promise<void>;

  // エラー状態
  error: string | null;
}

/**
 * デフォルト値
 */
const defaultContext: SleepRecordingContextType = {
  isRecording: false,
  recordingStartTime: null,
  elapsedSeconds: 0,
  snoringCount: 0,
  isCurrentlySnoring: false,
  startRecording: async () => {},
  stopRecording: async () => ({
    startTime: new Date(),
    endTime: new Date(),
    durationHours: 0,
    snoringStats: {
      totalEvents: 0,
      totalDurationMs: 0,
      totalDurationMinutes: 0,
      averageVolume: 0,
      events: [],
    },
  }),
  cancelRecording: async () => {},
  error: null,
};

/**
 * Context 作成
 */
const SleepRecordingContext = createContext<SleepRecordingContextType>(defaultContext);

/**
 * Provider Props
 */
interface SleepRecordingProviderProps {
  children: ReactNode;
}

/**
 * 睡眠記録 Provider
 */
export const SleepRecordingProvider: React.FC<SleepRecordingProviderProps> = ({ children }) => {
  // 記録状態
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // いびき検出状態
  const [snoringCount, setSnoringCount] = useState(0);
  const [isCurrentlySnoring, setIsCurrentlySnoring] = useState(false);

  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // いびき検出サービス
  const detectorRef = useRef<SimpleSnoringDetector | null>(null);

  // タイマー
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // いびきカウント監視タイマー
  const snoringTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * 経過時間を更新（1秒ごと）
   */
  useEffect(() => {
    if (isRecording && recordingStartTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - recordingStartTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isRecording, recordingStartTime]);

  /**
   * いびきカウントを監視（5秒ごと）
   */
  useEffect(() => {
    if (isRecording && detectorRef.current) {
      snoringTimerRef.current = setInterval(() => {
        if (detectorRef.current) {
          const count = detectorRef.current.getCurrentCount();
          setSnoringCount(count);
        }
      }, 5000);

      return () => {
        if (snoringTimerRef.current) {
          clearInterval(snoringTimerRef.current);
        }
      };
    }
  }, [isRecording]);

  /**
   * 睡眠記録を開始
   */
  const startRecording = async (): Promise<void> => {
    if (isRecording) {
      throw new Error('既に記録中です');
    }

    try {
      setError(null);

      // いびき検出サービスを初期化
      detectorRef.current = new SimpleSnoringDetector({
        volumeThreshold: -40,  // デフォルト閾値
        minDuration: 300,
        maxDuration: 2000,
      });

      // いびき検出を開始
      await detectorRef.current.startMonitoring();

      // 記録開始時刻を設定
      const startTime = new Date();
      setRecordingStartTime(startTime);
      setIsRecording(true);
      setElapsedSeconds(0);
      setSnoringCount(0);

      console.log('✅ Sleep recording started at', startTime.toISOString());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '記録の開始に失敗しました';
      setError(errorMessage);
      console.error('❌ Failed to start recording:', err);
      throw err;
    }
  };

  /**
   * 睡眠記録を停止して結果を取得
   */
  const stopRecording = async (): Promise<SleepRecordResult> => {
    if (!isRecording || !recordingStartTime || !detectorRef.current) {
      throw new Error('記録中ではありません');
    }

    try {
      setError(null);

      const endTime = new Date();

      // いびき検出を停止して統計を取得
      const snoringStats = await detectorRef.current.stopMonitoring();

      // 経過時間を計算（時間単位）
      const durationMs = endTime.getTime() - recordingStartTime.getTime();
      const durationHours = durationMs / 1000 / 60 / 60;

      // タイマーをクリア
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (snoringTimerRef.current) {
        clearInterval(snoringTimerRef.current);
      }

      // 状態をリセット
      setIsRecording(false);
      setRecordingStartTime(null);
      setElapsedSeconds(0);
      setSnoringCount(0);

      const result: SleepRecordResult = {
        startTime: recordingStartTime,
        endTime,
        durationHours,
        snoringStats,
      };

      console.log('✅ Sleep recording stopped');
      console.log('   Duration:', durationHours.toFixed(2), 'hours');
      console.log('   Snoring events:', snoringStats.totalEvents);

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '記録の停止に失敗しました';
      setError(errorMessage);
      console.error('❌ Failed to stop recording:', err);
      throw err;
    } finally {
      detectorRef.current = null;
    }
  };

  /**
   * 睡眠記録をキャンセル
   */
  const cancelRecording = async (): Promise<void> => {
    if (!isRecording) {
      return;
    }

    try {
      // いびき検出を停止
      if (detectorRef.current) {
        await detectorRef.current.stopMonitoring();
        detectorRef.current = null;
      }

      // タイマーをクリア
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (snoringTimerRef.current) {
        clearInterval(snoringTimerRef.current);
      }

      // 状態をリセット
      setIsRecording(false);
      setRecordingStartTime(null);
      setElapsedSeconds(0);
      setSnoringCount(0);
      setError(null);

      console.log('🔄 Sleep recording cancelled');

    } catch (err) {
      console.error('❌ Failed to cancel recording:', err);
    }
  };

  /**
   * Context Value
   */
  const value: SleepRecordingContextType = {
    isRecording,
    recordingStartTime,
    elapsedSeconds,
    snoringCount,
    isCurrentlySnoring,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  };

  return (
    <SleepRecordingContext.Provider value={value}>
      {children}
    </SleepRecordingContext.Provider>
  );
};

/**
 * Custom Hook: 睡眠記録コンテキストを使用
 */
export const useSleepRecording = (): SleepRecordingContextType => {
  const context = useContext(SleepRecordingContext);

  if (!context) {
    throw new Error('useSleepRecording must be used within SleepRecordingProvider');
  }

  return context;
};
