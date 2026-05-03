import chalk from 'chalk';
import { defaultToolRegistry } from '@agentforge/core';

export async function listTools(): Promise<void> {
  console.log(chalk.blue('🔧 AgentForge 可用工具列表'));
  console.log();

  const tools = defaultToolRegistry.list();
  
  if (tools.length === 0) {
    console.log(chalk.yellow('没有可用的工具'));
    return;
  }

  tools.forEach((tool, index) => {
    console.log(chalk.green(\`\${index + 1}. \${tool.name}\`));
    console.log(chalk.gray(\`   描述: \${tool.description}\`));
    
    // 显示工具的输入参数
    if (tool.schema && tool.schema._def) {
      try {
        const schema = tool.schema._def;
        if (schema.shape) {
          console.log(chalk.gray(\`   输入参数:\`));
          Object.entries(schema.shape).forEach(([key, value]: [string, any]) => {
            const description = value._def?.description || '无描述';
            const type = value._def?.typeName || '未知类型';
            console.log(chalk.white(\`     - \${key}: \${type} - \${description}\`));
          });
        }
      } catch (error) {
        // 忽略schema解析错误
      }
    }
    
    console.log();
  });

  console.log(chalk.blue('💡 使用方法:'));
  console.log(chalk.white('  在Agent配置中添加工具名称到tools数组'));
  console.log(chalk.white('  示例: tools: ["calculator", "text_processor"]'));
  console.log();
  console.log(chalk.gray('📖 更多信息: https://agentforge.dev/docs/tools'));
}
