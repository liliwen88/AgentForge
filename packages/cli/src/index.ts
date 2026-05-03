#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { createProject } from './commands/create.js';
import { addAgent } from './commands/add-agent.js';
import { listTools } from './commands/list-tools.js';
import { initProject } from './commands/init.js';

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

// 初始化项目
program
  .command('init')
  .description('在现有目录中初始化AgentForge项目')
  .action(async () => {
    try {
      await initProject();
    } catch (error) {
      console.error(chalk.red('初始化项目失败:'), error);
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

// 显示帮助信息
program.on('--help', () => {
  console.log('');
  console.log(chalk.blue('示例:'));
  console.log(chalk.white('  $ agentforge create my-agent-app'));
  console.log(chalk.white('  $ agentforge init'));
  console.log(chalk.white('  $ agentforge add-agent chat-assistant'));
  console.log(chalk.white('  $ agentforge list-tools'));
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
