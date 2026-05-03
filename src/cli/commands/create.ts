import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CreateOptions {
  template?: string;
  install?: boolean;
}

export async function createProject(projectName?: string, options: CreateOptions = {}) {
  // 获取项目名称
  if (!projectName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称:',
        default: 'my-agent-app',
        validate: (input: string) => {
          if (!input.trim()) {
            return '项目名称不能为空';
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return '项目名称只能包含字母、数字、连字符和下划线';
          }
          return true;
        },
      },
    ]);
    projectName = answers.projectName;
  }

  const targetDir = path.resolve(process.cwd(), projectName);
  
  // 检查目录是否存在
  if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `目录 ${projectName} 已存在且不为空，是否覆盖？`,
          default: false,
        },
      ]);
      
      if (!overwrite) {
        console.log(chalk.yellow('创建项目已取消'));
        return;
      }
      
      await fs.emptyDir(targetDir);
    }
  }

  // 选择模板
  let template = options.template;
  if (!template) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: '选择项目模板:',
        choices: [
          {
            name: 'basic - 基础Agent项目',
            value: 'basic',
          },
          {
            name: 'web - Web应用项目',
            value: 'web',
          },
          {
            name: 'api - API服务项目',
            value: 'api',
          },
          {
            name: 'fullstack - 全栈项目',
            value: 'fullstack',
          },
        ],
        default: 'basic',
      },
    ]);
    template = answers.template;
  }

  const spinner = ora(`创建 ${template} 模板项目...`).start();

  try {
    // 创建项目目录结构
    await createProjectStructure(targetDir, template);
    
    // 复制模板文件
    await copyTemplateFiles(targetDir, template);
    
    spinner.succeed('项目创建完成');
    
    console.log(chalk.green(`✅ 项目 ${projectName} 创建成功！`));
    console.log();
    console.log(chalk.blue('下一步:'));
    console.log(chalk.white(`  cd ${projectName}`));
    
    if (options.install !== false) {
      console.log(chalk.white('  npm install'));
    }
    
    console.log(chalk.white('  agentforge dev'));
    console.log();
    console.log(chalk.gray('📖 更多信息: https://agentforge.dev/docs'));
    
  } catch (error) {
    spinner.fail('创建项目失败');
    throw error;
  }
}

async function createProjectStructure(targetDir: string, template: string): Promise<void> {
  const dirs = getDirectoryStructure(template);
  
  for (const dir of dirs) {
    await fs.ensureDir(path.join(targetDir, dir));
  }
}

function getDirectoryStructure(template: string): string[] {
  const baseDirs = [
    'src/agents',
    'src/tools',
    'src/components',
    'src/utils',
    'docs',
    'tests',
  ];

  switch (template) {
    case 'web':
      return [
        ...baseDirs,
        'apps/web/pages',
        'apps/web/components',
        'apps/web/styles',
        'apps/web/public',
      ];
    case 'api':
      return [
        ...baseDirs,
        'apps/api/routes',
        'apps/api/middleware',
        'apps/api/services',
        'apps/api/models',
      ];
    case 'fullstack':
      return [
        ...baseDirs,
        'apps/web/pages',
        'apps/web/components',
        'apps/web/styles',
        'apps/web/public',
        'apps/api/routes',
        'apps/api/middleware',
        'apps/api/services',
        'apps/api/models',
      ];
    default:
      return baseDirs;
  }
}

async function copyTemplateFiles(targetDir: string, template: string): Promise<void> {
  const templateDir = path.join(__dirname, '../../templates', template);
  
  // 创建基础package.json
  const packageJson = createPackageJson(template, path.basename(targetDir));
  await fs.writeJSON(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });

  // 创建README.md
  const readme = createReadme(template, path.basename(targetDir));
  await fs.writeFile(path.join(targetDir, 'README.md'), readme);

  // 创建基础配置文件
  await createConfigFiles(targetDir, template);

  // 创建示例代码
  await createExampleCode(targetDir, template);

  // 创建提示词文档
  await createPromptFiles(targetDir);
}

function createPackageJson(template: string, projectName: string): any {
  const basePackage = {
    name: projectName,
    version: '0.1.0',
    description: `AgentForge ${template} 项目`,
    type: 'module',
    scripts: {
      dev: 'agentforge dev',
      build: 'agentforge build',
      test: 'vitest',
      lint: 'eslint src --ext .ts,.tsx',
      'type-check': 'tsc --noEmit',
    },
    dependencies: {
      '@agentforge/core': '^0.1.0',
    },
    devDependencies: {
      '@agentforge/cli': '^0.1.0',
      'typescript': '^5.3.0',
      '@types/node': '^20.10.0',
      'vitest': '^1.0.0',
      'eslint': '^8.55.0',
    },
  };

  switch (template) {
    case 'web':
      return {
        ...basePackage,
        dependencies: {
          ...basePackage.dependencies,
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'next': '^14.0.0',
        },
        devDependencies: {
          ...basePackage.devDependencies,
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          'tailwindcss': '^3.3.0',
        },
      };
    case 'api':
      return {
        ...basePackage,
        dependencies: {
          ...basePackage.dependencies,
          'fastify': '^4.24.0',
          'prisma': '^5.7.0',
          '@prisma/client': '^5.7.0',
        },
        devDependencies: {
          ...basePackage.devDependencies,
          '@types/fastify': '^0.0.0',
        },
      };
    case 'fullstack':
      return {
        ...basePackage,
        dependencies: {
          ...basePackage.dependencies,
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'next': '^14.0.0',
          'fastify': '^4.24.0',
          'prisma': '^5.7.0',
          '@prisma/client': '^5.7.0',
        },
        devDependencies: {
          ...basePackage.devDependencies,
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          '@types/fastify': '^0.0.0',
          'tailwindcss': '^3.3.0',
        },
      };
    default:
      return basePackage;
  }
}

function createReadme(template: string, projectName: string): string {
  return `# ${projectName}

> 使用AgentForge创建的${template === 'basic' ? '基础' : template === 'web' ? 'Web应用' : template === 'api' ? 'API服务' : '全栈'}项目

## 🚀 快速开始

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
\`\`\`

## 📦 项目结构

\`\`\`
${projectName}/
├── CLAUDE.md                    # Claude Code
├── AGENTS.md                    # Cursor / Codex / Windsurf
├── .github/copilot-instructions.md
├── .windsurf/rules/
├── .cursor/rules/
├── src/
│   ├── agents/          # Agent定义
│   ├── tools/           # 工具集合
│   ├── components/      # UI组件
│   └── utils/           # 工具函数
${template === 'web' || template === 'fullstack' ? `
├── apps/web/            # 前端应用` : ''}
${template === 'api' || template === 'fullstack' ? `
├── apps/api/            # 后端API` : ''}
├── docs/                # 项目文档（可选）
└── tests/               # 测试文件
\`\`\`

## 🤖 Agent开发

查看根目录 [CLAUDE.md](./CLAUDE.md) 与 [AGENTS.md](./AGENTS.md) 了解如何使用 AI 助手开发 Agent。

## 📚 更多信息

- [AgentForge文档](https://agentforge.dev/docs)
- [Agent开发指南](https://agentforge.dev/docs/agent-development)
- [工具库文档](https://agentforge.dev/docs/tools)
`;

async function createConfigFiles(targetDir: string, template: string): Promise<void> {
  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
  
  await fs.writeJSON(path.join(targetDir, 'tsconfig.json'), tsconfig, { spaces: 2 });

  // .gitignore
  const gitignore = `
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.next/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# AgentForge
.agentforge/
workspace/
`;
  
  await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore.trim());
}

async function createExampleCode(targetDir: string, template: string): Promise<void> {
  // 创建示例Agent
  const exampleAgent = `import { BaseAgent, AgentConfig } from '@agentforge/core';

const config: AgentConfig = {
  name: 'example-agent',
  description: '示例Agent',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  tools: ['calculator', 'text_processor'],
};

export const exampleAgent = new BaseAgent(config);

// 使用示例
exampleAgent.on('message.received', (event) => {
  console.log('收到消息:', event.data.message);
});

exampleAgent.start();
`;
  
  await fs.writeFile(path.join(targetDir, 'src/agents/example-agent.ts'), exampleAgent);

  // 创建示例工具
  const exampleTool = `import { BaseTool } from '@agentforge/core';
import { z } from 'zod';

export class ExampleTool extends BaseTool {
  public readonly name = 'example_tool';
  public readonly description = '示例工具';
  public readonly schema = z.object({
    message: z.string().describe('要处理的消息'),
  });

  async execute(args: { message: string }): Promise<string> {
    const validated = this.validateArgs(args);
    return \`处理消息: \${validated.message}\`;
  }
}
`;
  
  await fs.writeFile(path.join(targetDir, 'src/tools/example-tool.ts'), exampleTool);
}

function getEmbeddedAiInstructionsFallback(): string {
  return `# AgentForge AI编程助手指导原则

## 核心原则

### 1. 思考先于编码
- 明确假设，不隐藏困惑；暴露权衡，主动寻求澄清。

### 2. 简洁优先
- 最小化代码解决实际问题；不添加未要求的功能。

### 3. 精确修改
- 只修改必要部分；匹配现有风格；清理本次改动产生的孤立代码。

### 4. 目标驱动
- 定义可验证的成功标准；将任务写成可检查的步骤。

## Agent 开发规范

- TypeScript 严格模式；优先使用 BaseAgent / BaseTool 与内置能力。
- 配置保持扁平可读；避免为少量 Agent 做复杂注册表或状态机。
- 每个 Agent 与自定义工具配套测试；集成测试用模拟数据。

## 项目约定

- ESLint + Prettier；导出符号写 JSDoc；优先命名导出。
- 详见官方 AgentForge 仓库根目录 CLAUDE.md 全文模板。
`;
}

async function createPromptFiles(targetDir: string): Promise<void> {
  const bundledClaude = path.join(__dirname, '../../../CLAUDE.md');
  let instructionBody: string;
  if (await fs.pathExists(bundledClaude)) {
    instructionBody = await fs.readFile(bundledClaude, 'utf-8');
  } else {
    instructionBody = getEmbeddedAiInstructionsFallback();
  }

  await fs.outputFile(path.join(targetDir, 'CLAUDE.md'), instructionBody);

  const agentsBody = `<!-- 与根目录 CLAUDE.md 正文一致；修改原则时请同步更新 CLAUDE.md、AGENTS.md、.github/copilot-instructions.md、.windsurf/rules/agentforge.md、.cursor/rules/agentforge.mdc。 -->\n\n${instructionBody}`;
  await fs.outputFile(path.join(targetDir, 'AGENTS.md'), agentsBody);
  await fs.outputFile(path.join(targetDir, '.github/copilot-instructions.md'), instructionBody);

  const windsurfRule = `---
trigger: always_on
---

${instructionBody}`;
  await fs.outputFile(path.join(targetDir, '.windsurf/rules/agentforge.md'), windsurfRule);

  const cursorRule = `---
description: AgentForge 项目级 AI 开发规则（与根目录 CLAUDE.md 一致）
alwaysApply: true
---

${instructionBody}`;
  await fs.outputFile(path.join(targetDir, '.cursor/rules/agentforge.mdc'), cursorRule);
}
