# AgentForge

[English](./README_EN.md) | [中文](./README_CN.md) | [日本語](./README_JA.md)

> 专为业务开发设计的TypeScript全栈+AI脚手架，让AI Agent开发像搭积木一样简单

[![npm version](https://badge.fury.io/js/agentforge.svg)](https://badge.fury.io/js/agentforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

## 🚀 快速开始

### 安装

```bash
npm install -g agentforge
```

### 创建新项目

```bash
agentforge create my-agent-app
cd my-agent-app
npm run dev
```

## ✨ 特性

- 🧩 **积木式开发** - 模块化Agent组件，像搭积木一样简单
- 🤖 **AI友好** - 按各工具约定提供根目录 `CLAUDE.md`、`AGENTS.md`，以及 `.github/copilot-instructions.md`、`.windsurf/rules/`、`.cursor/rules/`，适配 Claude Code、Cursor、GitHub Copilot、Windsurf、Codex 等
- 📝 **智能提示词** - 基于Andrej Karpathy原则的深度优化提示词系统
- 🔧 **全栈TypeScript** - 前后端统一技术栈，类型安全
- ⚡ **开箱即用** - 预配置最佳实践，专注业务逻辑
- 🎯 **业务导向** - 避免过度工程化，专注解决实际问题

## 📦 项目结构

```
my-agent-app/
├── CLAUDE.md                    # Claude Code（仓库根目录）
├── AGENTS.md                    # Cursor / Codex / Windsurf
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot 仓库说明
├── .windsurf/rules/             # Windsurf Cascade 规则
├── .cursor/rules/               # Cursor 项目规则（.mdc）
├── src/
│   ├── agents/          # Agent定义
│   ├── tools/           # 工具集合
│   ├── components/      # UI组件
│   └── utils/           # 工具函数
├── apps/
│   ├── web/            # 前端应用 (Next.js)
│   └── api/            # 后端API (Fastify)
├── docs/               # 项目文档（可选）
└── tests/              # 测试文件
```

## 🎯 核心原则

AgentForge基于Andrej Karpathy观察到的LLM编程陷阱，提供四大核心原则：

### 1. 思考先于编码
- 明确假设，不隐藏困惑
- 暴露权衡，主动寻求澄清
- 遇到不确定时停止并提问

### 2. 简洁优先  
- 最小化代码解决实际问题
- 不添加未要求的功能
- 避免为单一用途创建抽象

### 3. 精确修改
- 只修改必要的部分
- 清理自己的"烂摊子"
- 匹配现有代码风格

### 4. 目标驱动
- 定义成功标准并验证
- 将任务转化为可验证目标
- 循环直到达成目标

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **UI**: TailwindCSS + shadcn/ui
- **状态管理**: Zustand
- **类型检查**: TypeScript strict mode

### 后端
- **运行时**: Node.js 18+
- **框架**: Fastify
- **ORM**: Prisma
- **验证**: Zod
- **测试**: Vitest

### AI集成
- **SDK**: OpenAI、Anthropic官方SDK
- **向量数据库**: Pinecone/Chroma
- **本地模型**: Ollama集成
- **工具调用**: Function calling标准化

## 📚 文档

- [技术实现与架构说明](./docs/TECHNICAL_IMPLEMENTATION.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md)。

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🙏 致谢

基于 [Andrej Karpathy](https://github.com/karpathy) 对LLM编程行为的深刻洞察，以及 [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) 项目的优秀实践。
