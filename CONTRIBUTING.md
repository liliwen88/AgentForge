# 贡献指南

感谢你愿意改进 AgentForge。

## 环境要求

- Node.js 18 及以上
- 克隆仓库后在根目录执行 `npm install`

## 提交流程

1. 从 `main` 新建分支进行改动。
2. 尽量保持提交信息清晰；改动与现有风格一致。
3. 在发起 Pull Request 前，视改动范围执行 `npm run lint`、`npm run type-check` 等脚本（以仓库当前 `package.json` 为准）。
4. 在 PR 描述中说明动机、主要变更与风险点（如有）。

## 文档与架构

实现细节、模块划分与 AI 助手约定见 [docs/TECHNICAL_IMPLEMENTATION.md](./docs/TECHNICAL_IMPLEMENTATION.md)。根目录 `CLAUDE.md`、`AGENTS.md` 及 `.github/`、`.cursor/`、`.windsurf/` 下的说明需与脚手架生成逻辑保持同步时，请同时检查 `src/cli/commands/create.ts` 中的 `createPromptFiles`。
