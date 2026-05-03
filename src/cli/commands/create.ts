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
├── src/
│   ├── agents/          # Agent定义
│   ├── tools/           # 工具集合
│   ├── components/      # UI组件
│   └── utils/           # 工具函数
${template === 'web' || template === 'fullstack' ? `
├── apps/web/            # 前端应用` : ''}
${template === 'api' || template === 'fullstack' ? `
├── apps/api/            # 后端API` : ''}
├── docs/                # 文档
└── tests/               # 测试文件
\`\`\`

## 🤖 Agent开发

查看 [docs/CLAUDE.md](./docs/CLAUDE.md) 了解如何使用AI助手开发Agent。

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

async function createPromptFiles(targetDir: string): Promise<void> {
  // CLAUDE.md
  const claudeMd = `# CLAUDE.md

AgentForge项目的AI编程助手指导原则。

## 核心原则

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

## Agent开发规范

### Agent定义
- 使用TypeScript严格模式
- 明确定义Agent的能力和限制
- 提供清晰的错误处理

### 工具开发
- 继承BaseTool类
- 使用Zod进行参数验证
- 提供详细的错误信息

### 测试要求
- 每个Agent都需要测试
- 工具函数必须有单元测试
- 集成测试覆盖主要流程

## 项目特定规则

- 使用ESLint和Prettier进行代码格式化
- 所有导出的函数和类都需要文档注释
- 优先使用内置工具，避免重复造轮子
`;
  
  await fs.writeFile(path.join(targetDir, 'docs/CLAUDE.md'), claudeMd);

  // CURSOR.md
  const cursorMd = `# Cursor项目规则

AgentForge项目的Cursor AI助手配置。

## 规则文件位置
\`.cursor/rules/agentforge-rules.mdc\`

## 主要规则

1. 遵循TypeScript最佳实践
2. 使用AgentForge核心框架
3. 保持代码简洁和可维护
4. 优先考虑业务价值

## 推荐设置

- 启用TypeScript支持
- 启用ESLint集成
- 使用AgentForge代码模板
`;
  
  await fs.writeFile(path.join(targetDir, 'docs/CURSOR.md'), cursorMd);
}
