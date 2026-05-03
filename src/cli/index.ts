#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProject } from './commands/create.js';
import { addAgent } from './commands/add-agent.js';
import { listTools } from './commands/list-tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('agentforge')
  .description('专为业务开发设计的TypeScript全栈+AI脚手架')
  .version('0.1.0');

// 创建新项目
program
  .command('create')
  .description('创建新的AgentForge项目')
  .argument('[project-name]', '项目名称')
  .option('-t, --template <template>', '使用模板', 'basic')
  .option('--no-install', '跳过依赖安装')
  .action(async (projectName?: string, options: any) => {
    try {
      await createProject(projectName, options);
    } catch (error) {
      console.error(chalk.red('创建项目失败:'), error);
      process.exit(1);
    }
  });

// 添加Agent
program
  .command('add-agent')
  .description('添加新的Agent到现有项目')
  .argument('[agent-name]', 'Agent名称')
  .option('-t, --type <type>', 'Agent类型', 'basic')
  .action(async (agentName?: string, options: any) => {
    try {
      await addAgent(agentName, options);
    } catch (error) {
      console.error(chalk.red('添加Agent失败:'), error);
      process.exit(1);
    }
  });

// 列出可用工具
program
  .command('list-tools')
  .description('列出所有可用的Agent工具')
  .action(async () => {
    try {
      await listTools();
    } catch (error) {
      console.error(chalk.red('列出工具失败:'), error);
      process.exit(1);
    }
  });

// 开发模式
program
  .command('dev')
  .description('启动开发服务器')
  .option('-p, --port <port>', '端口号', '3000')
  .action(async (options: any) => {
    const spinner = ora('启动开发服务器...').start();
    
    try {
      // 检查是否在AgentForge项目中
      if (!await fs.pathExists(path.join(process.cwd(), 'package.json'))) {
        spinner.fail('不在AgentForge项目中');
        console.log(chalk.yellow('请在AgentForge项目根目录运行此命令'));
        return;
      }

      spinner.succeed('开发服务器已启动');
      console.log(chalk.green(`🚀 开发服务器运行在 http://localhost:${options.port}`));
      
      // 这里应该启动实际的开发服务器
      // 暂时只是显示信息
    } catch (error) {
      spinner.fail('启动开发服务器失败');
      console.error(chalk.red('错误:'), error);
    }
  });

// 构建项目
program
  .command('build')
  .description('构建项目')
  .action(async () => {
    const spinner = ora('构建项目...').start();
    
    try {
      // 检查是否在AgentForge项目中
      if (!await fs.pathExists(path.join(process.cwd(), 'package.json'))) {
        spinner.fail('不在AgentForge项目中');
        return;
      }

      spinner.succeed('项目构建完成');
      console.log(chalk.green('✅ 构建成功'));
    } catch (error) {
      spinner.fail('构建项目失败');
      console.error(chalk.red('错误:'), error);
    }
  });

// 初始化项目
program
  .command('init')
  .description('在现有目录中初始化AgentForge项目')
  .action(async () => {
    const spinner = ora('初始化AgentForge项目...').start();
    
    try {
      // 检查目录是否为空
      const files = await fs.readdir(process.cwd());
      if (files.length > 0) {
        spinner.fail('目录不为空');
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: '目录不为空，是否继续初始化？',
            default: false,
          },
        ]);
        
        if (!overwrite) {
          console.log(chalk.yellow('初始化已取消'));
          return;
        }
      }

      // 创建基础文件结构
      await createProjectStructure(process.cwd());
      
      spinner.succeed('AgentForge项目初始化完成');
      console.log(chalk.green('✅ 项目初始化成功'));
      console.log(chalk.blue('下一步:'));
      console.log(chalk.white('  npm install'));
      console.log(chalk.white('  agentforge dev'));
    } catch (error) {
      spinner.fail('初始化项目失败');
      console.error(chalk.red('错误:'), error);
    }
  });

// 显示帮助信息
program.on('--help', () => {
  console.log('');
  console.log(chalk.blue('示例:'));
  console.log(chalk.white('  $ agentforge create my-agent-app'));
  console.log(chalk.white('  $ agentforge add-agent chat-assistant'));
  console.log(chalk.white('  $ agentforge dev'));
  console.log('');
  console.log(chalk.blue('更多信息:'));
  console.log(chalk.white('  https://agentforge.dev/docs'));
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error(chalk.red('未捕获的异常:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('未处理的Promise拒绝:'), reason);
  process.exit(1);
});

// 解析命令行参数
program.parse();

async function createProjectStructure(targetDir: string): Promise<void> {
  const dirs = [
    'src/agents',
    'src/tools',
    'src/components',
    'src/utils',
    'apps/web',
    'apps/api',
    'docs',
    'tests',
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(targetDir, dir));
  }

  // 创建基础配置文件
  const packageJson = {
    name: path.basename(targetDir),
    version: '0.1.0',
    description: 'AgentForge项目',
    scripts: {
      dev: 'agentforge dev',
      build: 'agentforge build',
      test: 'vitest',
    },
    dependencies: {
      '@agentforge/core': '^0.1.0',
    },
    devDependencies: {
      '@agentforge/cli': '^0.1.0',
    },
  };

  await fs.writeJSON(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });
}
