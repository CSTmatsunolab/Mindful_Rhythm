# Ref: SuperClaude

# ClaudeCode コマンド
- SuperClaude Frameworkのドキュメント:
    - https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/Docs/User-Guide/commands.md#essential-commands
    - https://github.com/SuperClaude-Org/SuperClaude_Framework/tree/master/Docs/User-Guide-jp
    - https://github.com/SuperClaude-Org/SuperClaude_Framework/tree/master/Docs/User-Guide
- 【保存版】SuperClaudeカスタムコマンド21個の使い方！オプションや使用シーンまで
    - @tomada(とまだ@AI駆動開発), 最終更新日 2025年08月30日, 投稿日 2025年08月27日
    - https://qiita.com/tomada/items/177b6dbea92caecfb112

# SuperClaudeのエージェント・フラグ

## クイックリファレンステーブル
[Eng](https://github.com/khayashi4337/SuperClaude_Framework/blob/master/Docs/User-Guide/modes.md#quick-reference-table)

|モード|目的|自動トリガー|重要な行動|最適な用途|
|---|---|---|---|---|
|**🧠 ブレインストーミング**|インタラクティブな発見|「ブレインストーミング」、「たぶん」、漠然とした要望|ソクラテス式の質問、要件の抽出|新しいプロジェクトの計画、不明確な要件|
|**🔍 内省**|メタ認知分析|エラー回復、「推論の分析」|透明な思考マーカー（🤔、🎯、💡）|デバッグ、学習、最適化|
|**📋 タスク管理**|複雑な調整|>3ステップ、>2ディレクトリ|相の崩壊、記憶の持続|多段階操作、プロジェクト管理|
|**🎯 オーケストレーション**|インテリジェントなツール選択|複数のツールを使用した操作、高いリソース使用率|最適なツールルーティング、並列実行|複雑な分析、パフォーマンスの最適化|
|**⚡ トークン効率**|圧縮通信|コンテキスト使用率が高い、`--uc`フラグ|シンボルシステム、推定30～50%のトークン削減|リソースの制約、大規模な操作|

##  🔍 内省モード - メタ認知分析
[Eng](https://github.com/khayashi4337/SuperClaude_Framework/blob/master/Docs/User-Guide/modes.md#-introspection-mode---meta-cognitive-analysis)

**目的**: 学習の最適化と透明な意思決定のための推論プロセスを公開します。
- **自動アクティベーショントリガー:**
- 自己分析の要求：「自分の推論を分析する」、「決定を振り返る」
- エラー回復シナリオと調査を必要とする予期しない結果
- 複数の実行可能なアプローチによる複雑な問題解決
- 最適化の機会のためのパターン認識の必要性
- 手動フラグ:`--introspect`
**行動の変化:**
- **推論の透明性**: 思考プロセスを明確なマーカーで公開します (🤔、🎯、⚡、📊、💡)
- **意思決定分析**：選択ロジックを評価し、代替アプローチを検討する
- **パターン認識**：繰り返される行動と改善の機会を特定します
- **メタ学習**：継続的なフレームワーク改善のための洞察を抽出
- **フレームワークコンプライアンス**: SuperClaude原則と品質ゲートに照らしてアクションを検証します
- **経験例:**
    ```
    Standard Approach: "I'll analyze this code structure and suggest improvements..."
    Introspective Approach:
    "🧠 Meta-Analysis: Why did I choose structural analysis over functional flow?
    🎯 Decision Logic: Saw class hierarchy → assumed OOP pattern dominance
    🔄 Alternative Considered: Data flow analysis might reveal hidden dependencies
    📊 Evidence Check: File imports suggest functional composition, not OOP
    💡 Learning: Need to analyze imports before choosing analysis strategy
    ⚡ Correction: Switching to functional flow analysis approach"
    ```
    - **最適な組み合わせ:**
- **→ タスク管理**: 複雑なフェーズの決定に透明な推論を提供します
- **任意のモード**: 他のモードの操作に推論の透明性レイヤーを追加します
- **手動オーバーライド**:`--introspect`学習セッションやワークフローのデバッグに使用します

##  スラッシュコマンド
https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/Docs/User-Guide-jp/commands.md

- `/sc:document`- ドキュメント生成
[Eng](https://github.com/khayashi4337/SuperClaude_Framework/blob/master/Docs/User-Guide/commands.md#scdocument---documentation-generation)
**目的**: コードとAPIの包括的なドキュメントを生成する
**構文**:`/sc:document [path]` `[--type api|user-guide|technical] [--format markdown|html]`
**ユースケース**:
    - APIドキュメント:`/sc:document --type api`
    - ユーザーガイド:`/sc:document --type user-guide`
    - 技術ドキュメント:`/sc:document --type technical`

- `/sc:brainstorm`- プロジェクト発見
[Eng](https://github.com/khayashi4337/SuperClaude_Framework/blob/master/Docs/User-Guide/commands.md#scbrainstorm---project-discovery)
**目的**: 対話型の要件検出とプロジェクト計画
**構文**:`/sc:brainstorm "your idea"` `[--strategy systematic|creative]`
**ユースケース**:
    - 新しいプロジェクトの計画:`/sc:brainstorm "e-commerce platform"`
    - 機能の探索:`/sc:brainstorm "user authentication system"`
    - 問題解決:`/sc:brainstorm "slow database queries"`
- /sc:review : レビューとフィードバック
    - /sc:review <エージェント> <フラグ>

##  エージェント
https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/Docs/User-Guide-jp/agents.md
- @agent-deep-research-agent：深掘り調査エージェント
- @agent-business_panel：ビジネスパネル（価値面）
- @agent-technical-writer：技術専門家パネル（技術面）
- @agent-reviewer_panel：レビューアパネル（人間）
- @agent-root_cause_analyst：根本原因分析エージェント
- @agent-action_planner：アクションプランエージェント
- @agent-quality_checker：品質評価エージェント
- @agent-codex-research-agent：Codexベースの調査エージェント

##  フラグ
https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/Docs/User-Guide-jp/flags.md
- --strategy <strategy>：戦略（creative, agile, etc.）
- MCP サーバーフラグ
    - --c7/--context7	コンテキスト7
    - --seq/--sequential	一連	多段階推論、デバッグ	複雑なデバッグ、システム設計
- 分析の深さ： quick / shallow < normal < ​deep
    - --depth	<分析の深さ>
- 深度階層：--ultrathink > --think-hard > --think
    -  --think	5つ以上のファイルまたは複雑な分析	標準的な構造化分析（約4Kトークン）
    -  --think-hard	アーキテクチャ分析、システム依存関係	強化されたツールによる詳細な分析（約10kトークン）
    -  --ultrathink	重要なシステムの再設計、レガシーシステムの近代化	すべてのツールで最大深度分析（約32Kトークン）
- --uc：出力を圧縮
- --introspect	自己分析、エラー回復	推論プロセスを透明性を持って公開する
- --loop	「改善する」「磨く」「洗練する」というキーワード	反復的な強化サイクル
- --task-manage	>3ステップ、複雑なスコープ	委任を通じて調整する
- --orchestrate	マルチツール操作、パフォーマンスニーズ	ツールの選択と並列実行の最適化
