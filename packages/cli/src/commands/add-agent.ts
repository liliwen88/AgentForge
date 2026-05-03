import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

interface AddAgentOptions {
  type?: string;
}

export async function addAgent(agentName?: string, options: AddAgentOptions = {}) {
  // 获取Agent名称
  if (!agentName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'agentName',
        message: '请输入Agent名称:',
        default: 'my-agent',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Agent名称不能为空';
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Agent名称只能包含字母、数字、连字符和下划线';
          }
          return true;
        },
      },
    ]);
    agentName = answers.agentName;
  }

  // 获取Agent类型
  let agentType = options.type || 'basic';
  if (!options.type) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'agentType',
        message: '选择Agent类型:',
        choices: [
          { name: '基础Agent', value: 'basic' },
          { name: '聊天Agent', value: 'chat' },
          { name: '任务Agent', value: 'task' },
          { name: '工具Agent', value: 'tool' },
        ],
        default: 'basic',
      },
    ]);
    agentType = answers.agentType;
  }

  const spinner = ora(`添加Agent ${agentName}...`).start();

  try {
    // 检查是否在AgentForge项目中
    if (!await fs.pathExists(path.join(process.cwd(), 'package.json'))) {
      spinner.fail('不在AgentForge项目中');
      console.log(chalk.yellow('请在AgentForge项目根目录运行此命令'));
      return;
    }

    // 创建Agent文件
    await createAgentFile(agentName, agentType);

    spinner.succeed('Agent添加完成');
    console.log(chalk.green(`\n✅ Agent ${agentName} 添加成功!`));
    console.log(chalk.blue('\n文件位置:'));
    console.log(chalk.white(`  src/agents/${agentName}.ts`));

  } catch (error) {
    spinner.fail('添加Agent失败');
    throw error;
  }
}

async function createAgentFile(agentName: string, agentType: string): Promise<void> {
  const agentsDir = path.join(process.cwd(), 'src/agents');
  await fs.ensureDir(agentsDir);

  const agentFile = path.join(agentsDir, `${agentName}.ts`);
  
  let content = '';
  
  switch (agentType) {
    case 'basic':
      content = generateBasicAgent(agentName);
      break;
    case 'chat':
      content = generateChatAgent(agentName);
      break;
    case 'task':
      content = generateTaskAgent(agentName);
      break;
    case 'tool':
      content = generateToolAgent(agentName);
      break;
    default:
      content = generateBasicAgent(agentName);
  }

  await fs.writeFile(agentFile, content);
}

function generateBasicAgent(name: string): string {
  return `import { BaseAgent, type AgentConfig } from '@agentforge/core';

const config: AgentConfig = {
  name: '${name}',
  description: '${name} - 基础Agent',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  tools: ['calculator', 'text_processor'],
};

export const ${name}Agent = new BaseAgent(config);

// 使用示例
/*
import { ${name}Agent } from './${name}';

// 启动Agent
await ${name}Agent.start();

// 发送消息
await ${name}Agent.sendMessage({
  role: 'user',
  content: '你好，请帮我计算 2 + 3'
});

// 停止Agent
await ${name}Agent.stop();
*/
`;
}

function generateChatAgent(name: string): string {
  return `import { BaseAgent, type AgentConfig, type Message } from '@agentforge/core';

const config: AgentConfig = {
  name: '${name}',
  description: '${name} - 聊天Agent',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  tools: ['calculator', 'text_processor', 'datetime'],
  memory: {
    type: 'both',
    maxSize: 1000,
  },
};

export class ${name}ChatAgent extends BaseAgent {
  constructor() {
    super(config);
  }

  protected async handleMessage(message: Message): Promise<void> {
    if (message.role === 'user') {
      // 获取对话历史
      const history = this.getMessageHistory();
      
      // 构建上下文
      const context = this.buildContext(history, message);
      
      // 生成回复
      const response = await this.generateResponse(context);
      
      // 发送回复
      const reply: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      this.getMessageHistory().push(reply);
      this.emitEvent('message.sent', { message: reply });
    }
  }

  private buildContext(history: Message[], currentMessage: Message): string {
    const messages = history.slice(-10); // 只保留最近10条消息
    messages.push(currentMessage);
    
    return messages
      .map(msg => \`\${msg.role}: \${msg.content}\`)
      .join('\\n');
  }

  private async generateResponse(context: string): Promise<string> {
    // 这里可以集成具体的LLM API
    // 目前返回简单的回复
    return \`我收到了你的消息。上下文:\\n\${context}\\n\\n这是一个来自\${this.config.name}的回复。\`;
  }
}

export const ${name}Agent = new ${name}ChatAgent();
`;
}

function generateTaskAgent(name: string): string {
  return `import { BaseAgent, type AgentConfig, type Message } from '@agentforge/core';

const config: AgentConfig = {
  name: '${name}',
  description: '${name} - 任务Agent',
  model: 'gpt-3.5-turbo',
  temperature: 0.3,
  tools: ['calculator', 'text_processor', 'datetime', 'filesystem'],
  memory: {
    type: 'long-term',
    maxSize: 500,
  },
};

export class ${name}TaskAgent extends BaseAgent {
  private currentTask: string | null = null;
  private taskHistory: Array<{ task: string; result: any; timestamp: Date }> = [];

  protected async handleMessage(message: Message): Promise<void> {
    if (message.role === 'user') {
      const content = message.content.toLowerCase();
      
      // 解析任务类型
      if (content.includes('计算') || content.includes('算')) {
        await this.handleCalculationTask(message);
      } else if (content.includes('时间') || content.includes('日期')) {
        await this.handleDateTimeTask(message);
      } else if (content.includes('文件') || content.includes('读取')) {
        await this.handleFileTask(message);
      } else {
        await this.handleGeneralTask(message);
      }
    }
  }

  private async handleCalculationTask(message: Message): Promise<void> {
    this.currentTask = '计算任务';
    this.updateState({ status: 'acting', currentTask: this.currentTask });

    try {
      // 提取数学表达式
      const expression = this.extractMathExpression(message.content);
      if (expression) {
        const result = await this.callTool('calculator', { expression });
        
        const response: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: \`计算结果: \${expression} = \${result}\`,
          timestamp: new Date(),
        };
        
        this.getMessageHistory().push(response);
        this.taskHistory.push({
          task: '计算',
          result,
          timestamp: new Date(),
        });
        
        this.emitEvent('message.sent', { message: response });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleDateTimeTask(message: Message): Promise<void> {
    this.currentTask = '时间任务';
    this.updateState({ status: 'acting', currentTask: this.currentTask });

    try {
      const result = await this.callTool('datetime', { action: 'now' });
      
      const response: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: \`当前时间: \${result.local}\`,
        timestamp: new Date(),
      };
      
      this.getMessageHistory().push(response);
      this.emitEvent('message.sent', { message: response });
    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleFileTask(message: Message): Promise<void> {
    this.currentTask = '文件任务';
    this.updateState({ status: 'acting', currentTask: this.currentTask });

    try {
      const filePath = this.extractFilePath(message.content);
      if (filePath) {
        const content = await this.callTool('filesystem', { 
          action: 'read', 
          path: filePath 
        });
        
        const response: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: \`文件内容:\\n\${content}\`,
          timestamp: new Date(),
        };
        
        this.getMessageHistory().push(response);
        this.emitEvent('message.sent', { message: response });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleGeneralTask(message: Message): Promise<void> {
    const response: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: \`我理解你的任务: \${message.content}\\n\\n请告诉我具体需要执行什么操作。\`,
      timestamp: new Date(),
    };
    
    this.getMessageHistory().push(response);
    this.emitEvent('message.sent', { message: response });
  }

  private extractMathExpression(content: string): string | null {
    const match = content.match(/([^\\s]+\\s*[+\\-*/]\\s*[^\\s]+)/);
    return match ? match[1] : null;
  }

  private extractFilePath(content: string): string | null {
    const match = content.match(/(?:文件|路径)[：:]?\\s*([^\\s]+)/);
    return match ? match[1] : null;
  }

  private handleError(error: any): void {
    this.updateState({ status: 'error' });
    this.emitEvent('agent.error', { error: error.message });
  }

  public getTaskHistory(): Array<{ task: string; result: any; timestamp: Date }> {
    return [...this.taskHistory];
  }
}

export const ${name}Agent = new ${name}TaskAgent();
`;
}

function generateToolAgent(name: string): string {
  return `import { BaseAgent, type AgentConfig, type Message, BaseTool } from '@agentforge/core';
import { z } from 'zod';

const config: AgentConfig = {
  name: '${name}',
  description: '${name} - 工具Agent',
  model: 'gpt-3.5-turbo',
  temperature: 0.1,
  tools: ['calculator', 'text_processor'],
};

// 自定义工具示例
class CustomTool extends BaseTool {
  public readonly name = 'custom_tool';
  public readonly description = '自定义工具示例';
  public readonly schema = z.object({
    input: z.string().describe('输入参数'),
  });

  async execute(args: { input: string }): Promise<string> {
    return \`处理结果: \${args.input.toUpperCase()}\`;
  }
}

export class ${name}ToolAgent extends BaseAgent {
  constructor() {
    super(config);
    // 添加自定义工具
    this.addTool(new CustomTool());
  }

  protected async handleMessage(message: Message): Promise<void> {
    if (message.role === 'user') {
      // 分析用户意图
      const intent = this.analyzeIntent(message.content);
      
      // 根据意图调用相应工具
      switch (intent) {
        case 'calculate':
          await this.handleCalculation(message);
          break;
        case 'process_text':
          await this.handleTextProcessing(message);
          break;
        case 'custom':
          await this.handleCustomTask(message);
          break;
        default:
          await this.handleUnknownIntent(message);
      }
    }
  }

  private analyzeIntent(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('计算') || lowerContent.includes('算')) {
      return 'calculate';
    } else if (lowerContent.includes('文本') || lowerContent.includes('处理')) {
      return 'process_text';
    } else if (lowerContent.includes('自定义') || lowerContent.includes('特殊')) {
      return 'custom';
    }
    
    return 'unknown';
  }

  private async handleCalculation(message: Message): Promise<void> {
    try {
      const expression = this.extractExpression(message.content);
      const result = await this.callTool('calculator', { expression });
      
      await this.sendResponse(\`计算结果: \${result}\`);
    } catch (error) {
      await this.sendResponse('计算失败，请检查表达式格式');
    }
  }

  private async handleTextProcessing(message: Message): Promise<void> {
    try {
      const result = await this.callTool('text_processor', {
        action: 'count',
        text: message.content,
      });
      
      await this.sendResponse(\`文本统计: 字符数 \${result.characters}, 词数 \${result.words}\`);
    } catch (error) {
      await this.sendResponse('文本处理失败');
    }
  }

  private async handleCustomTask(message: Message): Promise<void> {
    try {
      const result = await this.callTool('custom_tool', {
        input: message.content,
      });
      
      await this.sendResponse(result);
    } catch (error) {
      await this.sendResponse('自定义任务处理失败');
    }
  }

  private async handleUnknownIntent(message: Message): Promise<void> {
    await this.sendResponse(\`我理解你的消息: \${message.content}\\n\\n支持的指令:\\n- 计算任务\\n- 文本处理\\n- 自定义任务\`);
  }

  private extractExpression(content: string): string {
    const match = content.match(/([^\\s]+\\s*[+\\-*/]\\s*[^\\s]+)/);
    return match ? match[1] : '2 + 2';
  }

  private async sendResponse(content: string): Promise<void> {
    const response: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    
    this.getMessageHistory().push(response);
    this.emitEvent('message.sent', { message: response });
  }
}

export const ${name}Agent = new ${name}ToolAgent();
`;
}
