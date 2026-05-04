# AgentForge

[English](./README_EN.md) | [中文](./README.md) | [日本語](./README_JA.md)

> ビジネス開発向けに設計されたTypeScriptフルスタック+AIスキャフォールド。企業向けプロダクト開発をブロックを積むようにシンプルにします。

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

## AgentForgeを選ぶ理由

AgentForgeは単なるAI Agentの実験プラットフォームではなく、企業のビジネス開発を支えるTypeScript全栈スキャフォールドです。フロントエンド、バックエンド、ツール連携、AIアシスタント用のルールを1つのリポジトリに統合し、チームが実際のプロダクトを素早く構築できます。

- ✅ 事業開発の基盤：SaaSや内部業務システムを再利用可能なモジュールで構築
- ✅ AIアシスト対応：Copilot、Claude Code、Cursor、Windsurfなどの支援ルールを標準提供
- ✅ フルスタック統一：UI、API、ツールを同じTypeScript型で連携
- ✅ 実用価値重視：顧客対応、受注管理、ナレッジ検索、自動化などに対応
- ✅ ローコードの代替：開発者による保守性と拡張性を担保しつつ、高速に立ち上げ

## ✨ コア機能

- 🧩 **ブロック型開発** - Agent、ツール、UI、API、ワークフローを増やしながら組み合わせ
- 🤖 **AIアシスタント対応** - ルート `CLAUDE.md`、`AGENTS.md`、`.github/copilot-instructions.md`、`.windsurf/rules/`、`.cursor/rules/`
- 🧠 **プロンプト規約** - 主流AIアシスタントに対して一貫した開発ガイドラインを提供
- 🔧 **フルスタックTypeScript** - 型安全なエンドツーエンド開発
- ⚡ **すぐ使える** - Fastifyバックエンド、Next.jsフロントエンド、検証、テスト、AIツール統合を含む
- 🧭 **企業志向** - 過剰な設計を避け、ビジネス成果に直結する実装を優先

## 推奨プロジェクト構成

```
my-agent-app/
├── CLAUDE.md                    # Claude Code / リポジトリ共通アシスタントガイド
├── AGENTS.md                    # Cursor / Codex / Windsurf アシスタントガイド
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot 向け指示
├── .windsurf/rules/             # Windsurf Cascade ルール
├── .cursor/rules/               # Cursor プロジェクトルール（.mdc）
├── src/
│   ├── agents/          # Agent定義や業務ワークフロー
│   ├── tools/           # 業務ツール、外部サービス接続
│   ├── components/      # UIコンポーネント
│   └── utils/           # 共通ヘルパー
├── apps/
│   ├── web/            # フロントエンドアプリ (Next.js)
│   └── api/            # バックエンドAPI (Fastify)
├── docs/               # ドキュメントとプロダクト説明
└── tests/              # 単体・統合テスト
```

## 代表的な業務シナリオ

- SaaS機能の迅速な立ち上げ：ユーザー管理、受注、権限、ダッシュボード
- 社内自動化：カスタマーサポートアシスタント、ナレッジベース、承認ワークフロー
- データ・ツール連携：CRM、ERP、外部API、ベクター検索、ドキュメント検索
- AIアシスト開発：コードアシスタントにプロジェクトのルールを理解させ、ビジネス実装に集中させる

## AIアシスタント連携

AgentForgeは、主流アシスタントがプロジェクトの目的、コーディングルール、許容範囲を理解しやすいように設計されています。

- `CLAUDE.md` / `AGENTS.md`: Claude Code、Cursor、Codex、Windsurf などのルートレベルガイド
- `.github/copilot-instructions.md`: GitHub Copilot 向け指示
- `.windsurf/rules/` / `.cursor/rules/`: 一貫した挙動を保つ専用ルール
- `docs/TECHNICAL_IMPLEMENTATION.md`: アーキテクチャ、業務ワークフロー、AI連携の技術説明

## 🛠️ テックスタック

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
- **ツール呼び出し**: Function calling 標準化

## 📚 ドキュメント

- [技術実装とアーキテクチャ](./docs/TECHNICAL_IMPLEMENTATION.md)

## 🤝 貢献

コントリビューションを歓迎します！[貢献ガイド](./CONTRIBUTING.md)を確認してください。

## 📄 ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)ファイルを確認してください。

## 🙏 謝辞

[Andrej Karpathy](https://github.com/karpathy)のLLMプログラミングに関する洞察と、[andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)の実践に感謝します。
