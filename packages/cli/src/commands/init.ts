import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

export async function initProject(): Promise<void> {
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
    throw error;
  }
}

async function createProjectStructure(targetDir: string): Promise<void> {
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
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(targetDir, dir));
  }

  // 创建基础配置文件
  const packageJson = {
    name: path.basename(targetDir),
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
    },
    devDependencies: {
      '@agentforge/cli': '^0.1.0',
      'typescript': '^5.3.0',
      'turbo': '^1.11.0',
    },
  };

  await fs.writeJSON(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });
}
