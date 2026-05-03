import chalk from 'chalk';
import { defaultToolRegistry } from '@agentforge/core';

export async function listTools(): Promise<void> {
  console.log(chalk.blue('AgentForge 可用工具列表:\n'));

  const tools = defaultToolRegistry.list();
  
  if (tools.length === 0) {
    console.log(chalk.yellow('暂无可用工具'));
    return;
  }

  tools.forEach((tool, index) => {
    console.log(chalk.white(`${index + 1}. ${tool.name}`));
    console.log(chalk.gray(`   描述: ${tool.description}`));
    console.log(chalk.gray(`   类型: ${tool.schema.constructor.name}`));
    console.log('');
  });

  console.log(chalk.green('使用方法:'));
  console.log(chalk.white('  在Agent配置中添加工具名称:'));
  console.log(chalk.white('  tools: ["calculator", "text_processor", "datetime", "filesystem"]'));
  console.log('');
  console.log(chalk.blue('更多信息: https://agentforge.dev/docs/tools'));
}
