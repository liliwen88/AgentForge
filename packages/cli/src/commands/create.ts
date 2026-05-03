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
      
      await fs.remove(targetDir);
    }
  }

  const spinner = ora(`创建项目 ${projectName}...`).start();

  try {
    // 创建项目目录
    await fs.ensureDir(targetDir);

    // 创建项目结构
    await createProjectStructure(targetDir, options.template || 'basic');

    // 创建 package.json
    await createPackageJson(targetDir, projectName);

    // 创建配置文件
    await createConfigFiles(targetDir);

    // 创建示例代码
    await createExampleCode(targetDir);

    spinner.succeed('项目创建完成');

    console.log(chalk.green('\n✅ AgentForge项目创建成功!'));
    console.log(chalk.blue('\n下一步:'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white('  npm install'));
    console.log(chalk.white('  npm run dev'));
    console.log(chalk.blue('\n更多信息: https://agentforge.dev/docs'));

  } catch (error) {
    spinner.fail('创建项目失败');
    throw error;
  }
}

async function createProjectStructure(targetDir: string, template: string): Promise<void> {
  const dirs = [
    'src/agents',
    'src/tools',
    'src/components',
    'src/utils',
    'src/hooks',
    'src/types',
    'apps/web',
    'apps/api',
    'docs',
    'tests',
    'scripts',
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(targetDir, dir));
  }
}

async function createPackageJson(targetDir: string, projectName: string): Promise<void> {
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    description: 'AgentForge项目',
    private: true,
    scripts: {
      dev: 'turbo run dev',
      build: 'turbo run build',
      test: 'turbo run test',
      lint: 'turbo run lint',
      'type-check': 'turbo run type-check',
      clean: 'turbo run clean',
    },
    workspaces: [
      'packages/*',
      'apps/*'
    ],
    dependencies: {
      '@agentforge/core': '^0.1.0',
      '@agentforge/components': '^0.1.0',
      '@agentforge/tools': '^0.1.0',
    },
    devDependencies: {
      '@agentforge/cli': '^0.1.0',
      'typescript': '^5.3.0',
      'turbo': '^1.11.0',
    },
    engines: {
      node: '>=18.0.0',
      npm: '>=9.0.0',
    },
  };

  await fs.writeJSON(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });
}

async function createConfigFiles(targetDir: string): Promise<void> {
  // turbo.json
  const turboJson = {
    $schema: 'https://turbo.build/schema.json',
    globalDependencies: ['**/.env.*local'],
    pipeline: {
      build: {
        dependsOn: ['^build'],
        outputs: ['dist/**', '.next/**', '!.next/cache/**']
      },
      dev: {
        cache: false,
        persistent: true
      },
      test: {
        dependsOn: ['build'],
        outputs: ['coverage/**']
      },
      lint: {
        outputs: []
      },
      'type-check': {
        dependsOn: ['^build'],
        outputs: []
      },
      clean: {
        cache: false
      }
    }
  };

  await fs.writeJSON(path.join(targetDir, 'turbo.json'), turboJson, { spaces: 2 });

  // tsconfig.json
  const tsconfigJson = {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedIndexedAccess: true,
      noImplicitReturns: true,
      noPropertyAccessFromIndexSignature: false,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      paths: {
        '@/*': ['./src/*'],
        '@/agents/*': ['./src/agents/*'],
        '@/tools/*': ['./src/tools/*'],
        '@/components/*': ['./src/components/*'],
        '@/utils/*': ['./src/utils/*'],
        '@/hooks/*': ['./src/hooks/*'],
        '@/types/*': ['./src/types/*'],
      }
    },
    include: ['src/**/*', 'apps/**/*', 'packages/**/*'],
    exclude: ['node_modules', 'dist']
  };

  await fs.writeJSON(path.join(targetDir, 'tsconfig.json'), tsconfigJson, { spaces: 2 });

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
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/

# Turbo
.turbo/
`.trim();

  await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore);
}

async function createExampleCode(targetDir: string): Promise<void> {
  // 示例 Agent
  const exampleAgent = `
import { BaseAgent, type AgentConfig } from '@agentforge/core';

const config: AgentConfig = {
  name: 'ExampleAgent',
  description: '示例Agent',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  tools: ['calculator', 'text_processor'],
};

export const exampleAgent = new BaseAgent(config);
`.trim();

  await fs.writeFile(path.join(targetDir, 'src/agents/example.ts'), exampleAgent);

  // README.md
  const readme = `# ${path.basename(targetDir)}

AgentForge 项目

## 快速开始

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
\`\`\`

## 项目结构

- \`src/agents/\` - Agent 定义
- \`src/tools/\` - 自定义工具
- \`src/components/\` - UI 组件
- \`apps/web/\` - 前端应用
- \`apps/api/\` - 后端 API

## 更多信息

访问 [AgentForge 文档](https://agentforge.dev/docs) 了解更多信息。
`.trim();

  await fs.writeFile(path.join(targetDir, 'README.md'), readme);
}
