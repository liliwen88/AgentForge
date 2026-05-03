# AgentForge

[English](./README_EN.md) | [中文](./README.md) | [日本語](./README_JA.md)

> A TypeScript full-stack + AI scaffold designed for business development, making AI Agent development as simple as building blocks

[![npm version](https://badge.fury.io/js/agentforge.svg)](https://badge.fury.io/js/agentforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Quick Start

### Installation

```bash
npm install -g agentforge
```

### Create New Project

```bash
agentforge create my-agent-app
cd my-agent-app
npm run dev
```

## ✨ Features

- 🧩 **Block-based Development** - Modular Agent components, as simple as building blocks
- 🤖 **AI-Friendly** - Tool-native defaults: root `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.windsurf/rules/`, `.cursor/rules/` for Claude Code, Cursor, GitHub Copilot, Windsurf, Codex, and similar assistants
- 📝 **Intelligent Prompts** - Deeply optimized prompt system based on Andrej Karpathy's principles
- 🔧 **Full-stack TypeScript** - Unified frontend and backend tech stack with type safety
- ⚡ **Ready to Use** - Pre-configured best practices, focus on business logic
- 🎯 **Business-Oriented** - Avoid over-engineering, focus on solving real problems

## 📦 Project Structure

```
my-agent-app/
├── CLAUDE.md                    # Claude Code (repo root)
├── AGENTS.md                    # Cursor / Codex / Windsurf
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot repo instructions
├── .windsurf/rules/             # Windsurf Cascade rules
├── .cursor/rules/               # Cursor project rules (.mdc)
├── src/
│   ├── agents/          # Agent definitions
│   ├── tools/           # Tool collections
│   ├── components/      # UI components
│   └── utils/           # Utility functions
├── apps/
│   ├── web/            # Frontend app (Next.js)
│   └── api/            # Backend API (Fastify)
├── docs/               # Project docs (optional)
└── tests/              # Test files
```

## 🎯 Core Principles

AgentForge is based on the LLM programming pitfalls observed by Andrej Karpathy, providing four core principles:

### 1. Think Before Coding
- Clarify assumptions, don't hide confusion
- Expose trade-offs, actively seek clarification
- Stop and ask when uncertain

### 2. Simplicity First  
- Minimize code to solve real problems
- Don't add unrequested features
- Avoid creating abstractions for single purposes

### 3. Precise Modifications
- Only modify necessary parts
- Clean up your own "mess"
- Match existing code style

### 4. Goal-Driven
- Define success criteria and verify
- Transform tasks into verifiable goals
- Iterate until goals are achieved

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Type Checking**: TypeScript strict mode

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Vitest

### AI Integration
- **SDK**: OpenAI, Anthropic official SDKs
- **Vector Database**: Pinecone/Chroma
- **Local Models**: Ollama integration
- **Tool Calling**: Function calling standardization

## 📚 Documentation

- [Technical implementation & architecture](./docs/TECHNICAL_IMPLEMENTATION.md)

## 🤝 Contributing

Contributions are welcome! Please check the [Contributing Guide](./CONTRIBUTING.md).

## 📄 License

MIT License - See the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Based on [Andrej Karpathy](https://github.com/karpathy)'s profound insights into LLM programming behavior, and the excellent practices from the [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) project.
