# 機能拡張実装タスクリスト v0.2

**作成日**: 2025年10月30日
**対象バージョン**: v0.2拡張機能
**総タスク数**: 15タスク

---

## 📋 Week 4: 基本機能の拡張（緊急）

### Phase 1: データベーススキーマ拡張

#### タスク1: データベースマイグレーションスクリプト作成
- **担当**: 共通
- **優先度**: ⭐⭐⭐ 緊急
- **工数**: 1時間
- **ファイル**: `scripts/migrateDatabase_v0.2.ts`

**実装内容**:
```typescript
// tasksテーブルに新しいカラムを追加
ALTER TABLE tasks ADD COLUMN deadline TEXT;
ALTER TABLE tasks ADD COLUMN difficulty INTEGER DEFAULT 3;
```

**成功基準**:
- [ ] スクリプトが正常に実行できる
- [ ] 既存データが保持される
- [ ] 新しいカラムが追加される

---

### Phase 2: 睡眠記録機能の拡張（増田さん担当）

#### タスク2: 日付選択機能の実装
- **担当**: 増田さん
- **優先度**: ⭐⭐⭐ 緊急
- **工数**: 1.5時間
- **ファイル**: `src/screens/SleepTrackerScreen.tsx`

**実装内容**:
1. 記録日選択用のDateTimePickerを追加
2. 過去7日分までの日付を選択可能に
3. 未来の日付は選択不可（バリデーション）
4. 選択した日付でデータを保存

**UI変更箇所**:
```typescript
// 画面上部に追加
<View style={styles.dateSelectorContainer}>
  <Text style={styles.dateSelectorLabel}>📅 記録日</Text>
  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
    <Text style={styles.selectedDate}>
      {formatDate(selectedDate)} ({getWeekday(selectedDate)})
    </Text>
  </TouchableOpacity>
</View>

{showDatePicker && (
  <DateTimePicker
    value={selectedDate}
    mode="date"
    onChange={handleDateChange}
    maximumDate={new Date()}
    minimumDate={getDate7DaysAgo()}
  />
)}
```

**成功基準**:
- [ ] 日付選択UIが表示される
- [ ] 過去7日分の日付を選択できる
- [ ] 未来の日付は選択できない
- [ ] 選択した日付でデータが保存される

---

#### タスク3: 日付重複チェック機能
- **担当**: 増田さん
- **優先度**: ⭐⭐ 重要
- **工数**: 1時間
- **ファイル**: `src/screens/SleepTrackerScreen.tsx`, `src/services/database.ts`

**実装内容**:
1. 保存前に同じ日付のデータが存在するかチェック
2. 存在する場合は上書き確認ダイアログを表示
3. ユーザーの選択に応じて上書きまたはキャンセル

**実装例**:
```typescript
const checkDuplicateDate = async (date: string): Promise<boolean> => {
  const existing = await getSleepRecordByDate(date);
  return existing !== null;
};

const handleSave = async () => {
  const isDuplicate = await checkDuplicateDate(selectedDate);

  if (isDuplicate) {
    Alert.alert(
      '確認',
      'この日付の記録は既に存在します。上書きしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '上書き', onPress: () => saveSleepRecord() },
      ]
    );
  } else {
    await saveSleepRecord();
  }
};
```

**成功基準**:
- [ ] 重複データを検出できる
- [ ] 確認ダイアログが表示される
- [ ] 上書きまたはキャンセルを選択できる

---

### Phase 3: タスク管理機能の拡張（藤川さん担当）

#### タスク4: データベース型定義の更新
- **担当**: 藤川さん
- **優先度**: ⭐⭐⭐ 緊急
- **工数**: 0.5時間
- **ファイル**: `src/types/database.ts`

**実装内容**:
```typescript
export interface Task {
  id: number;
  title: string;
  date: string;
  status: 'pending' | 'done';
  emotion: string | null;
  deadline: string | null;      // 新規追加
  difficulty: number;            // 新規追加（1-5）
  created_at: string;
  updated_at: string;
}
```

**成功基準**:
- [ ] 型定義が更新される
- [ ] TypeScriptエラーが出ない

---

#### タスク5: タスク追加画面の拡張（締め切り日）
- **担当**: 藤川さん
- **優先度**: ⭐⭐⭐ 緊急
- **工数**: 1.5時間
- **ファイル**: `src/screens/TaskJournalScreen.tsx`

**実装内容**:
1. 締め切り日選択用のDateTimePickerを追加
2. 締め切り日を設定可能に（オプション）
3. 締め切り日をデータベースに保存

**UI変更箇所**:
```typescript
<View style={styles.deadlineContainer}>
  <Text style={styles.deadlineLabel}>📅 締め切り（オプション）</Text>
  <TouchableOpacity onPress={() => setShowDeadlinePicker(true)}>
    <Text style={styles.deadlineText}>
      {deadline ? formatDate(deadline) : '設定しない'}
    </Text>
  </TouchableOpacity>
</View>
```

**成功基準**:
- [ ] 締め切り日を選択できる
- [ ] 設定しないことも可能
- [ ] データベースに保存される

---

#### タスク6: タスク追加画面の拡張（難易度）
- **担当**: 藤川さん
- **優先度**: ⭐⭐⭐ 緊急
- **工数**: 2時間
- **ファイル**: `src/screens/TaskJournalScreen.tsx`, `src/components/DifficultyPicker.tsx`（新規）

**実装内容**:
1. 難易度選択コンポーネントを作成
2. 5段階（1-5）の難易度を視覚的に選択
3. デフォルトは3（普通）

**DifficultyPickerコンポーネント**:
```typescript
interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function DifficultyPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>⚡ 難易度</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => onChange(level)}
          >
            <Text style={styles.star}>
              {level <= value ? '⚡' : '○'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.difficultyLabel}>
        {getDifficultyLabel(value)}
      </Text>
    </View>
  );
}

function getDifficultyLabel(level: number): string {
  switch (level) {
    case 1: return '簡単（15分未満）';
    case 2: return 'やや簡単（15-30分）';
    case 3: return '普通（30-60分）';
    case 4: return 'やや難しい（1-2時間）';
    case 5: return '難しい（2時間以上）';
    default: return '普通';
  }
}
```

**成功基準**:
- [ ] 難易度を5段階で選択できる
- [ ] 視覚的にわかりやすい
- [ ] データベースに保存される

---

#### タスク7: タスク一覧表示の拡張
- **担当**: 藤川さん
- **優先度**: ⭐⭐⭐ 緊急
- **工数**: 1.5時間
- **ファイル**: `src/screens/TaskJournalScreen.tsx`

**実装内容**:
1. タスク一覧に締め切り日を表示
2. タスク一覧に難易度を表示
3. 締め切り日に応じた色分け表示

**表示ルール**:
```typescript
function getDeadlineColor(deadline: string | null): string {
  if (!deadline) return Colors.textSecondary;

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntil = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntil < 0) return Colors.error;      // 過ぎた: 赤
  if (daysUntil === 0) return Colors.warning;  // 今日: オレンジ
  if (daysUntil <= 3) return Colors.warning;   // 3日以内: 黄
  return Colors.success;                        // 余裕あり: 緑
}
```

**UI表示例**:
```
┌─────────────────────────────┐
│  ☐ レポート提出              │
│     📅 10/31 (明日) 🔴       │
│     ⚡⚡⚡⚡⚡ (難しい)        │
└─────────────────────────────┘
```

**成功基準**:
- [ ] 締め切り日が表示される
- [ ] 難易度が表示される
- [ ] 締め切り日に応じて色が変わる

---

#### タスク8: データベースCRUD関数の更新
- **担当**: 藤川さん
- **優先度**: ⭐⭐⭐ 緊急
- **工数**: 1時間
- **ファイル**: `src/services/database.ts`

**実装内容**:
```typescript
// addTask関数の更新
export async function addTask(
  title: string,
  deadline: string | null = null,
  difficulty: number = 3
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const database = await openDatabase();
  await database.runAsync(
    `INSERT INTO tasks (title, date, status, deadline, difficulty)
     VALUES (?, ?, ?, ?, ?)`,
    [title, today, 'pending', deadline, difficulty]
  );
}

// updateTask関数の更新
export async function updateTask(
  id: number,
  updates: Partial<Task>
): Promise<void> {
  // deadline, difficulty フィールドも更新可能に
}
```

**成功基準**:
- [ ] 新しいフィールドが保存される
- [ ] 既存の関数が正常に動作する

---

## 📋 Week 5-6: 分析・警告機能の実装

### Phase 4: 睡眠分析機能（増田さん担当）

#### タスク9: 睡眠分析サービスの作成
- **担当**: 増田さん
- **優先度**: ⭐⭐ 重要
- **工数**: 2.5時間
- **ファイル**: `src/services/sleepAnalyzer.ts`（新規作成）

**実装内容**:
```typescript
export interface SleepAnalysis {
  averageSleepHours: number;
  averageSleepScore: number;
  trend: 'improving' | 'stable' | 'declining';
  consecutivePoorSleepDays: number;
  recommendation: string;
}

export async function analyzeSleepPattern(): Promise<SleepAnalysis> {
  // 過去7日間の睡眠データを取得
  const last7Days = await getLast7DaysSleepRecords();

  // 平均睡眠時間を計算
  const averageSleepHours = calculateAverage(
    last7Days.map(r => r.total_hours)
  );

  // 平均スコアを計算
  const averageSleepScore = calculateAverage(
    last7Days.map(r => r.score)
  );

  // トレンドを判定
  const trend = determineTrend(last7Days);

  // 連続睡眠不足日数をカウント
  const consecutivePoorSleepDays = countConsecutivePoorSleep(last7Days);

  // 推奨メッセージを生成
  const recommendation = generateRecommendation({
    averageSleepHours,
    averageSleepScore,
    trend,
    consecutivePoorSleepDays,
  });

  return {
    averageSleepHours,
    averageSleepScore,
    trend,
    consecutivePoorSleepDays,
    recommendation,
  };
}
```

**成功基準**:
- [ ] 過去7日間のデータを正しく分析できる
- [ ] トレンド判定が正確
- [ ] 適切な推奨メッセージが生成される

---

### Phase 5: タスク負荷度分析機能（藤川さん担当）

#### タスク10: タスク負荷度分析サービスの作成
- **担当**: 藤川さん
- **優先度**: ⭐⭐ 重要
- **工数**: 2.5時間
- **ファイル**: `src/services/taskAnalyzer.ts`（新規作成）

**実装内容**:
```typescript
export interface TaskLoadAnalysis {
  todayLoad: number;
  tomorrowLoad: number;
  isHighLoad: boolean;
  loadLevel: 'low' | 'medium' | 'high';
  recommendedSleepTime: string;
}

export async function analyzeTaskLoad(): Promise<TaskLoadAnalysis> {
  // 今日と明日のタスクを取得
  const todayTasks = await getTodayTasks();
  const tomorrowTasks = await getTomorrowTasks();

  // 負荷度合計を計算
  const todayLoad = calculateTotalLoad(todayTasks);
  const tomorrowLoad = calculateTotalLoad(tomorrowTasks);

  // 高負荷判定
  const isHighLoad = tomorrowLoad >= 15;

  // 負荷レベル判定
  const loadLevel = determineLoadLevel(tomorrowLoad);

  // 推奨就寝時刻を計算
  const recommendedSleepTime = calculateRecommendedSleepTime(
    tomorrowLoad
  );

  return {
    todayLoad,
    tomorrowLoad,
    isHighLoad,
    loadLevel,
    recommendedSleepTime,
  };
}

function calculateTotalLoad(tasks: Task[]): number {
  return tasks
    .filter(task => task.status === 'pending')
    .reduce((sum, task) => sum + task.difficulty, 0);
}

function determineLoadLevel(load: number): 'low' | 'medium' | 'high' {
  if (load >= 15) return 'high';
  if (load >= 10) return 'medium';
  return 'low';
}

function calculateRecommendedSleepTime(load: number): string {
  const baseTime = 23; // 23:00

  if (load >= 15) return `${baseTime - 2}:00`;  // 21:00
  if (load >= 10) return `${baseTime - 1}:00`;  // 22:00
  return `${baseTime}:00`;                       // 23:00
}
```

**成功基準**:
- [ ] タスク負荷度が正しく計算される
- [ ] 負荷レベルが適切に判定される
- [ ] 推奨就寝時刻が適切に計算される

---

### Phase 6: 統合推奨機能（共同作業）

#### タスク11: 推奨エンジンサービスの作成
- **担当**: 増田さん・藤川さん（共同）
- **優先度**: ⭐⭐⭐ 重要
- **工数**: 2時間
- **ファイル**: `src/services/recommendationEngine.ts`（新規作成）

**実装内容**:
```typescript
export interface SleepRecommendation {
  level: 'urgent' | 'warning' | 'attention' | 'good';
  icon: string;
  message: string;
  details: string;
}

export async function generateSleepRecommendation(): Promise<SleepRecommendation> {
  // 睡眠分析を実行
  const sleepAnalysis = await analyzeSleepPattern();

  // タスク負荷度分析を実行
  const taskLoad = await analyzeTaskLoad();

  // 総合的な推奨を生成
  return determineRecommendation(sleepAnalysis, taskLoad);
}

function determineRecommendation(
  sleep: SleepAnalysis,
  task: TaskLoadAnalysis
): SleepRecommendation {
  const isSleepDeprived = sleep.averageSleepHours < 6.5;

  // 睡眠不足 + 明日高負荷
  if (isSleepDeprived && task.isHighLoad) {
    return {
      level: 'urgent',
      icon: '🔴',
      message: `明日は大変な1日です。今日は${task.recommendedSleepTime}までに就寝しましょう！`,
      details: `睡眠不足が続いています（平均${sleep.averageSleepHours.toFixed(1)}時間）。明日のタスク負荷度は${task.tomorrowLoad}です。`,
    };
  }

  // 睡眠不足 + 明日中負荷
  if (isSleepDeprived && task.loadLevel === 'medium') {
    return {
      level: 'warning',
      icon: '🟡',
      message: '睡眠不足が続いています。今日は早めに休みましょう。',
      details: `平均睡眠時間: ${sleep.averageSleepHours.toFixed(1)}時間。推奨就寝時刻: ${task.recommendedSleepTime}`,
    };
  }

  // 睡眠十分 + 明日高負荷
  if (!isSleepDeprived && task.isHighLoad) {
    return {
      level: 'attention',
      icon: '🟢',
      message: `明日は忙しい1日になります。今日はしっかり休息を。`,
      details: `推奨就寝時刻: ${task.recommendedSleepTime}`,
    };
  }

  // 睡眠不足 + 明日通常
  if (isSleepDeprived) {
    return {
      level: 'warning',
      icon: '🟡',
      message: '睡眠不足が続いています。今日は体を休めましょう。',
      details: `平均睡眠時間: ${sleep.averageSleepHours.toFixed(1)}時間。目標: 7-8時間`,
    };
  }

  // 睡眠十分 + 明日通常
  return {
    level: 'good',
    icon: '✅',
    message: '良好な睡眠が続いています！この調子で！',
    details: `平均睡眠時間: ${sleep.averageSleepHours.toFixed(1)}時間、平均スコア: ${sleep.averageSleepScore.toFixed(0)}点`,
  };
}
```

**成功基準**:
- [ ] 睡眠分析とタスク分析が統合される
- [ ] 適切な推奨レベルが判定される
- [ ] わかりやすいメッセージが生成される

---

#### タスク12: 睡眠推奨バナーコンポーネントの作成
- **担当**: 増田さん
- **優先度**: ⭐⭐ 重要
- **工数**: 1.5時間
- **ファイル**: `src/components/SleepRecommendationBanner.tsx`（新規作成）

**実装内容**:
```typescript
interface Props {
  recommendation: SleepRecommendation;
  onPress?: () => void;
}

export function SleepRecommendationBanner({ recommendation, onPress }: Props) {
  const backgroundColor = getBannerColor(recommendation.level);

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor }]}
      onPress={onPress}
    >
      <Text style={styles.icon}>{recommendation.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.message}>{recommendation.message}</Text>
        <Text style={styles.details}>{recommendation.details}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

function getBannerColor(level: string): string {
  switch (level) {
    case 'urgent': return '#FFE5E5';   // 薄い赤
    case 'warning': return '#FFF4E5';  // 薄い黄
    case 'attention': return '#E5F5FF'; // 薄い青
    case 'good': return '#E5FFE5';      // 薄い緑
    default: return '#F5F5F5';
  }
}
```

**成功基準**:
- [ ] バナーが美しく表示される
- [ ] タップで詳細が表示される
- [ ] レベルに応じて色が変わる

---

#### タスク13: ホーム画面への統合
- **担当**: 増田さん
- **優先度**: ⭐⭐ 重要
- **工数**: 1時間
- **ファイル**: `src/screens/HomeScreen.tsx`

**実装内容**:
1. 推奨エンジンを呼び出す
2. バナーコンポーネントを表示
3. タップで詳細モーダルを表示

```typescript
// HomeScreen.tsx
const [recommendation, setRecommendation] = useState<SleepRecommendation | null>(null);

useEffect(() => {
  const loadRecommendation = async () => {
    const rec = await generateSleepRecommendation();
    setRecommendation(rec);
  };

  loadRecommendation();
}, []);

// JSX
{recommendation && (
  <SleepRecommendationBanner
    recommendation={recommendation}
    onPress={() => setShowRecommendationDetail(true)}
  />
)}
```

**成功基準**:
- [ ] ホーム画面にバナーが表示される
- [ ] 推奨メッセージが表示される
- [ ] タップで詳細が表示される

---

### Phase 7: テストと最適化

#### タスク14: 統合テストの実施
- **担当**: 増田さん・藤川さん（共同）
- **優先度**: ⭐⭐ 重要
- **工数**: 2時間
- **ファイル**: テストシナリオドキュメント

**テスト項目**:
1. [ ] 日付選択機能の動作確認
2. [ ] 締め切り日設定の動作確認
3. [ ] 難易度設定の動作確認
4. [ ] 睡眠分析の正確性確認
5. [ ] タスク負荷度分析の正確性確認
6. [ ] 推奨メッセージの適切性確認
7. [ ] データフロー全体の動作確認

---

#### タスク15: ドキュメント更新
- **担当**: 増田さん・藤川さん（共同）
- **優先度**: ⭐ 低
- **工数**: 1時間
- **ファイル**: `README.md`, `docs/実装ガイド_増田藤川.md`

**更新内容**:
1. README.mdの機能一覧を更新
2. 実装ガイドに新機能の説明を追加
3. スクリーンショットの更新（必要に応じて）

---

## 📊 進捗管理

### Week 4（残り20%の完了）
- [ ] タスク1: マイグレーションスクリプト
- [ ] タスク2: 日付選択機能
- [ ] タスク3: 日付重複チェック
- [ ] タスク4: 型定義更新
- [ ] タスク5: 締め切り日機能
- [ ] タスク6: 難易度機能
- [ ] タスク7: 表示の拡張
- [ ] タスク8: CRUD関数更新

**完了目標**: Week 4終了時に100%達成

---

### Week 5-6（拡張機能）
- [ ] タスク9: 睡眠分析サービス
- [ ] タスク10: タスク負荷度分析
- [ ] タスク11: 推奨エンジン
- [ ] タスク12: バナーコンポーネント
- [ ] タスク13: ホーム画面統合
- [ ] タスク14: 統合テスト
- [ ] タスク15: ドキュメント更新

**完了目標**: Week 6終了時に全機能完了

---

## 🎯 成功の基準

### ユーザビリティ
- [ ] すべての機能が直感的に使える
- [ ] エラーが適切に処理される
- [ ] パフォーマンスが良好

### 機能性
- [ ] すべての新機能が正常に動作する
- [ ] データの整合性が保たれる
- [ ] 分析結果が正確

### コード品質
- [ ] TypeScriptエラーがない
- [ ] コードが適切にコメントされている
- [ ] テストが実施されている

---

**次のステップ**: 各タスクの実装開始
