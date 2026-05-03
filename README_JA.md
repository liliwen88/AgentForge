# AgentForge

> ビジネス開発向けに設計されたTypeScriptフルスタック+AIスキャフォールド。AI Agent開発をブロックを積むように簡単にします

[![npm version](https://badge.fury.io/js/agentforge.svg)](https://badge.fury.io/js/agentforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

## 🚀 クイックスタート

### インストール

```bash
npm install -g agentforge
```

### 新しいプロジェクトの作成

```bash
agentforge create my-agent-app
cd my-agent-app
npm run dev
```

## ✨ 特徴

- 🧩 **ブロックベース開発** - モジュール化されたAgentコンポーネント、ブロックを積むように簡単
- 🤖 **AIフレンドリー** - ルートの `CLAUDE.md` / `AGENTS.md`、`.github/copilot-instructions.md`、`.windsurf/rules/`、`.cursor/rules/` など各ツールの推奨配置に対応（Claude Code、Cursor、GitHub Copilot、Windsurf、Codex 等）
- 📝 **インテリジェントプロンプト** - Andrej Karpathyの原則に基づいた深く最適化されたプロンプトシステム
- 🔧 **フルスタックTypeScript** - フロントエンドとバックエンドで統一された技術スタック、タイプセーフ
- ⚡ **すぐに使える** - ベストプラクティスを事前設定、ビジネスロジックに集中
- 🎯 **ビジネス志向** - 過剰エンジニアリングを避け、実際の問題解決に集中

## 📦 プロジェクト構造

```
my-agent-app/
├── CLAUDE.md                    # Claude Code（リポジトリルート）
├── AGENTS.md                    # Cursor / Codex / Windsurf
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot リポジトリ説明
├── .windsurf/rules/             # Windsurf Cascade ルール
├── .cursor/rules/               # Cursor プロジェクトルール（.mdc）
├── src/
│   ├── agents/          # Agent定義
│   ├── tools/           # ツールコレクション
│   ├── components/      # UIコンポーネント
│   └── utils/           # ユーティリティ関数
├── apps/
│   ├── web/            # フロントエンドアプリ (Next.js)
│   └── api/            # バックエンドAPI (Fastify)
├── docs/               # プロジェクトドキュメント（任意）
└── tests/              # テストファイル
```

## 🎯 コア原則

AgentForgeはAndrej Karpathyが観察したLLMプログラミングの落とし穴に基づき、4つのコア原則を提供します：

### 1. コーディングの前に考える
- 仮定を明確にし、混乱を隠さない
- トレードオフを暴露し、積極的に明確化を求める
- 不確実な場合は停止して質問する

### 2. シンプルさを優先  
- 実際の問題を解決するためにコードを最小化
- 要求されていない機能を追加しない
- 単一目的のために抽象化を作成しない

### 3. 正確な修正
- 必要な部分のみを修正
- 自分の「散らかり」を片付ける
- 既存のコードスタイルに合わせる

### 4. ゴール駆動
- 成功基準を定義し検証する
- タスクを検証可能なゴールに変換する
- ゴール達成まで反復する

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **UI**: TailwindCSS + shadcn/ui
- **状態管理**: Zustand
- **型チェック**: TypeScript strict mode

### バックエンド
- **ランタイム**: Node.js 18+
- **フレームワーク**: Fastify
- **ORM**: Prisma
- **バリデーション**: Zod
- **テスト**: Vitest

### AI統合
- **SDK**: OpenAI、Anthropic公式SDK
- **ベクターデータベース**: Pinecone/Chroma
- **ローカルモデル**: Ollama統合
- **ツール呼び出し**: Function calling標準化

## 📚 ドキュメント

- [技術実装とアーキテクチャ](./docs/TECHNICAL_IMPLEMENTATION.md)

## 🤝 貢献

コントリビューションを歓迎します！[貢献ガイド](./CONTRIBUTING.md)を確認してください。

## 📄 ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)ファイルを確認してください。

## 🙏 謝辞

[Andrej Karpathy](https://github.com/karpathy)のLLMプログラミング行動に関する深い洞察、および[andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)プロジェクトの優れた実践に基づいています。
