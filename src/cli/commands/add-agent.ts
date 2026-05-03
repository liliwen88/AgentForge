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
        default: 'new-agent',
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

  // 选择Agent类型
  let type = options.type;
  if (!type) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '选择Agent类型:',
        choices: [
          {
            name: 'basic - 基础Agent',
            value: 'basic',
          },
          {
            name: 'chat - 聊天Agent',
            value: 'chat',
          },
          {
            name: 'task - 任务Agent',
            value: 'task',
          },
          {
            name: 'workflow - 工作流Agent',
            value: 'workflow',
          },
        ],
        default: 'basic',
      },
    ]);
    type = answers.type;
  }

  const spinner = ora(`创建 ${type} Agent...`).start();

  try {
    const targetDir = path.join(process.cwd(), 'src/agents');
    
    // 确保agents目录存在
    await fs.ensureDir(targetDir);
    
    const agentFile = path.join(targetDir, `${agentName}.ts`);
    
    // 检查文件是否已存在
    if (await fs.pathExists(agentFile)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Agent文件 ${agentName}.ts 已存在，是否覆盖？`,
          default: false,
        },
      ]);
      
      if (!overwrite) {
        spinner.fail('创建Agent已取消');
        return;
      }
    }

    // 创建Agent文件
    await createAgentFile(agentFile, agentName, type);
    
    spinner.succeed('Agent创建完成');
    
    console.log(chalk.green(`✅ Agent ${agentName} 创建成功！`));
    console.log(chalk.blue(`文件位置: src/agents/${agentName}.ts`));
    console.log();
    console.log(chalk.yellow('下一步:'));
    console.log(chalk.white(`1. 编辑 src/agents/${agentName}.ts 配置Agent`));
    console.log(chalk.white('2. 在主应用中导入并使用Agent'));
    
  } catch (error) {
    spinner.fail('创建Agent失败');
    throw error;
  }
}

async function createAgentFile(filePath: string, agentName: string, type: string): Promise<void> {
  let content = '';

  switch (type) {
    case 'chat':
      content = createChatAgentTemplate(agentName);
      break;
    case 'task':
      content = createTaskAgentTemplate(agentName);
      break;
    case 'workflow':
      content = createWorkflowAgentTemplate(agentName);
      break;
    default:
      content = createBasicAgentTemplate(agentName);
  }

  await fs.writeFile(filePath, content);
}

function createBasicAgentTemplate(name: string): string {
  const className = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  
  return `import { BaseAgent, AgentConfig } from '@agentforge/core';

/**
 * ${className} Agent
 * 
 * 这是一个基础Agent模板，可以根据需要扩展功能。
 */
const config: AgentConfig = {
  name: '${name}',
  description: '${className} Agent - 基础功能',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  tools: ['calculator', 'text_processor'], // 可用工具列表
  memory: {
    type: 'short-term',
    maxSize: 100,
  },
};

export class ${className}Agent extends BaseAgent {
  constructor() {
    super(config);
    
    // 监听事件
    this.on('message.received', this.handleMessage.bind(this));
  }

  protected async handleMessage(message: any): Promise<void> {
    // 自定义消息处理逻辑
    console.log(\`收到消息: \${message.content}\`);
    
    // 调用父类默认处理
    await super.handleMessage(message);
  }

  /**
   * 自定义Agent方法
   */
  public async customAction(input: string): Promise<string> {
    this.updateState({ 
      status: 'acting', 
      currentTask: \`执行自定义操作: \${input}\` 
    });

    try {
      // 实现自定义逻辑
      const result = \`处理结果: \${input}\`;
      
      this.updateState({ status: 'idle', currentTask: undefined });
      return result;
    } catch (error) {
      this.updateState({ status: 'error' });
      throw error;
    }
  }
}

// 导出Agent实例
export const ${name}Agent = new ${className}Agent();
`;
}

function createChatAgentTemplate(name: string): string {
  const className = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  
  return `import { BaseAgent, AgentConfig, Message } from '@agentforge/core';

/**
 * ${className} 聊天Agent
 * 
 * 专门用于对话交互的Agent，支持上下文管理和多轮对话。
 */
const config: AgentConfig = {
  name: '${name}',
  description: '${className} 聊天Agent - 智能对话助手',
  model: 'gpt-3.5-turbo',
  temperature: 0.8, // 较高的创造性
  tools: ['calculator', 'text_processor', 'datetime'],
  memory: {
    type: 'both', // 使用混合记忆
    maxSize: 200,
  },
};

export class ${className}ChatAgent extends BaseAgent {
  private conversationHistory: Message[] = [];
  private maxHistorySize = 50;

  constructor() {
    super(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('message.received', this.handleChatMessage.bind(this));
  }

  protected async handleChatMessage(message: Message): Promise<void> {
    // 添加到对话历史
    this.conversationHistory.push(message);
    
    // 限制历史大小
    if (this.conversationHistory.length > this.maxHistorySize) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistorySize);
    }

    this.updateState({ 
      status: 'thinking', 
      currentTask: '生成回复' 
    });

    try {
      // 生成回复
      const response = await this.generateResponse(message);
      
      // 发送回复
      const replyMessage: Message = {
        id: this.generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      this.conversationHistory.push(replyMessage);
      this.emitEvent('message.sent', { message: replyMessage });
      
      this.updateState({ status: 'idle', currentTask: undefined });
    } catch (error) {
      this.updateState({ status: 'error' });
      throw error;
    }
  }

  private async generateResponse(userMessage: Message): Promise<string> {
    // 这里可以集成具体的LLM API
    // 暂时返回简单回复
    const context = this.getConversationContext();
    return \`你说: "\${userMessage.content}"\\n\\n回复: 我理解了你的意思。\`;
  }

  private getConversationContext(): string {
    return this.conversationHistory
      .map(msg => \`\${msg.role}: \${msg.content}\`)
      .join('\\n');
  }

  public getConversationHistory(): Message[] {
    return [...this.conversationHistory];
  }

  public clearHistory(): void {
    this.conversationHistory = [];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const ${name}ChatAgent = new ${className}ChatAgent();
`;
}

function createTaskAgentTemplate(name: string): string {
  const className = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  
  return `import { BaseAgent, AgentConfig, ToolCall } from '@agentforge/core';

/**
 * ${className} 任务Agent
 * 
 * 专门用于执行特定任务的Agent，支持任务分解和工具调用。
 */
const config: AgentConfig = {
  name: '${name}',
  description: '${className} 任务Agent - 任务执行专家',
  model: 'gpt-3.5-turbo',
  temperature: 0.3, // 较低的创造性，更稳定
  tools: ['calculator', 'text_processor', 'datetime', 'filesystem'],
  memory: {
    type: 'short-term',
    maxSize: 100,
  },
};

export class ${className}TaskAgent extends BaseAgent {
  private taskQueue: Array<{ id: string; task: string; priority: number }> = [];
  private currentTaskId: string | null = null;

  constructor() {
    super(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('message.received', this.handleTaskMessage.bind(this));
  }

  protected async handleTaskMessage(message: any): Promise<void> {
    const task = message.content;
    
    // 添加任务到队列
    const taskId = this.generateTaskId();
    this.taskQueue.push({
      id: taskId,
      task,
      priority: this.calculatePriority(task),
    });

    // 按优先级排序
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    // 如果没有正在执行的任务，开始执行
    if (!this.currentTaskId) {
      await this.executeNextTask();
    }
  }

  private async executeNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) {
      this.currentTaskId = null;
      return;
    }

    const nextTask = this.taskQueue.shift();
    if (!nextTask) return;

    this.currentTaskId = nextTask.id;
    this.updateState({ 
      status: 'acting', 
      currentTask: nextTask.task 
    });

    try {
      // 执行任务
      const result = await this.performTask(nextTask.task);
      
      // 发送结果
      const resultMessage = {
        id: this.generateId(),
        role: 'assistant' as const,
        content: \`任务完成: \${nextTask.task}\\n结果: \${result}\`,
        timestamp: new Date(),
      };

      this.emitEvent('message.sent', { message: resultMessage });
      
      this.currentTaskId = null;
      
      // 继续执行下一个任务
      await this.executeNextTask();
    } catch (error) {
      this.updateState({ status: 'error' });
      this.currentTaskId = null;
      throw error;
    }
  }

  private async performTask(task: string): Promise<string> {
    // 分析任务类型
    const taskType = this.analyzeTaskType(task);
    
    switch (taskType) {
      case 'calculation':
        return await this.handleCalculation(task);
      case 'text_processing':
        return await this.handleTextProcessing(task);
      case 'file_operation':
        return await this.handleFileOperation(task);
      default:
        return await this.handleGeneralTask(task);
    }
  }

  private analyzeTaskType(task: string): string {
    const lowerTask = task.toLowerCase();
    
    if (lowerTask.includes('计算') || lowerTask.includes('数学') || /\\d+.*[+\\-*/]/.test(task)) {
      return 'calculation';
    }
    if (lowerTask.includes('文本') || lowerTask.includes('字符') || lowerTask.includes('处理')) {
      return 'text_processing';
    }
    if (lowerTask.includes('文件') || lowerTask.includes('读写') || lowerTask.includes('保存')) {
      return 'file_operation';
    }
    return 'general';
  }

  private async handleCalculation(task: string): Promise<string> {
    // 提取数学表达式
    const match = task.match(/([^\\d]*)([\\d+\\-*/().\\s]+)([^\\d]*)/);
    if (match) {
      const expression = match[2].trim();
      const result = await this.callTool('calculator', { expression });
      return \`计算结果: \${result}\`;
    }
    return '无法识别数学表达式';
  }

  private async handleTextProcessing(task: string): Promise<string> {
    // 简单的文本处理示例
    const action = task.includes('统计') ? 'count' : 'upper';
    const text = task.replace(/.*?[：:](.*)/, '$1').trim();
    
    const result = await this.callTool('text_processor', { action, text });
    return \`文本处理结果: \${JSON.stringify(result)}\`;
  }

  private async handleFileOperation(task: string): Promise<string> {
    // 文件操作示例
    return '文件操作功能需要具体实现';
  }

  private async handleGeneralTask(task: string): Promise<string> {
    return \`已处理任务: \${task}\`;
  }

  private calculatePriority(task: string): number {
    // 简单的优先级计算
    if (task.includes('紧急') || task.includes('重要')) return 10;
    if (task.includes('一般')) return 5;
    return 1;
  }

  private generateTaskId(): string {
    return \`task_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public getTaskQueue(): Array<{ id: string; task: string; priority: number }> {
    return [...this.taskQueue];
  }

  public getCurrentTask(): string | null {
    const current = this.taskQueue.find(t => t.id === this.currentTaskId);
    return current ? current.task : null;
  }
}

export const ${name}TaskAgent = new ${className}TaskAgent();
`;
}

function createWorkflowAgentTemplate(name: string): string {
  const className = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  
  return `import { BaseAgent, AgentConfig } from '@agentforge/core';

interface WorkflowStep {
  id: string;
  name: string;
  action: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

/**
 * ${className} 工作流Agent
 * 
 * 用于执行复杂工作流的Agent，支持步骤化任务管理。
 */
const config: AgentConfig = {
  name: '${name}',
  description: '${className} 工作流Agent - 流程自动化专家',
  model: 'gpt-3.5-turbo',
  temperature: 0.5,
  tools: ['calculator', 'text_processor', 'datetime', 'filesystem'],
  memory: {
    type: 'long-term',
    maxSize: 500,
  },
};

export class ${className}WorkflowAgent extends BaseAgent {
  private workflows: Map<string, WorkflowStep[]> = new Map();
  private currentWorkflow: string | null = null;
  private currentStep: number = 0;

  constructor() {
    super(config);
    this.setupEventHandlers();
    this.initializeDefaultWorkflows();
  }

  private setupEventHandlers(): void {
    this.on('message.received', this.handleWorkflowMessage.bind(this));
  }

  private initializeDefaultWorkflows(): void {
    // 示例工作流：数据处理流程
    this.workflows.set('data-processing', [
      {
        id: 'step1',
        name: '数据收集',
        action: 'collect_data',
        status: 'pending',
      },
      {
        id: 'step2',
        name: '数据清洗',
        action: 'clean_data',
        status: 'pending',
      },
      {
        id: 'step3',
        name: '数据分析',
        action: 'analyze_data',
        status: 'pending',
      },
      {
        id: 'step4',
        name: '生成报告',
        action: 'generate_report',
        status: 'pending',
      },
    ]);
  }

  protected async handleWorkflowMessage(message: any): Promise<void> {
    const content = message.content;
    
    // 解析工作流命令
    if (content.includes('启动工作流')) {
      const workflowName = this.extractWorkflowName(content);
      if (workflowName && this.workflows.has(workflowName)) {
        await this.startWorkflow(workflowName);
      } else {
        this.sendResponse('未找到指定的工作流');
      }
    } else if (content.includes('查看工作流')) {
      await this.showWorkflows();
    } else if (content.includes('工作流状态')) {
      await this.showWorkflowStatus();
    } else {
      this.sendResponse('可用命令: 启动工作流[名称], 查看工作流, 工作流状态');
    }
  }

  private async startWorkflow(workflowName: string): Promise<void> {
    if (this.currentWorkflow) {
      this.sendResponse('已有工作流正在运行');
      return;
    }

    this.currentWorkflow = workflowName;
    this.currentStep = 0;
    
    const workflow = this.workflows.get(workflowName);
    if (!workflow) return;

    this.updateState({ 
      status: 'acting', 
      currentTask: \`执行工作流: \${workflowName}\` 
    });

    this.sendResponse(\`开始执行工作流: \${workflowName}\`);
    
    // 执行工作流步骤
    await this.executeWorkflowSteps(workflow);
  }

  private async executeWorkflowSteps(steps: WorkflowStep[]): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      this.currentStep = i;
      const step = steps[i];
      
      step.status = 'running';
      this.sendResponse(\`执行步骤 \${i + 1}: \${step.name}\`);
      
      try {
        // 执行步骤
        const result = await this.executeStep(step);
        step.outputs = result;
        step.status = 'completed';
        
        this.sendResponse(\`步骤 \${i + 1} 完成\`);
        
        // 短暂延迟，模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        step.status = 'failed';
        this.sendResponse(\`步骤 \${i + 1} 失败: \${error}\`);
        break;
      }
    }

    this.currentWorkflow = null;
    this.currentStep = 0;
    this.updateState({ status: 'idle', currentTask: undefined });
    
    this.sendResponse('工作流执行完成');
  }

  private async executeStep(step: WorkflowStep): Promise<Record<string, any>> {
    // 根据步骤类型执行相应操作
    switch (step.action) {
      case 'collect_data':
        return await this.collectData();
      case 'clean_data':
        return await this.cleanData();
      case 'analyze_data':
        return await this.analyzeData();
      case 'generate_report':
        return await this.generateReport();
      default:
        return { message: \`执行动作: \${step.action}\` };
    }
  }

  private async collectData(): Promise<Record<string, any>> {
    // 模拟数据收集
    return { 
      records: 1000, 
      fields: ['id', 'name', 'value'],
      timestamp: new Date().toISOString()
    };
  }

  private async cleanData(): Promise<Record<string, any>> {
    // 模拟数据清洗
    return { 
      cleanedRecords: 950, 
      removedRecords: 50,
      timestamp: new Date().toISOString()
    };
  }

  private async analyzeData(): Promise<Record<string, any>> {
    // 模拟数据分析
    return { 
      average: 42.5, 
      max: 100, 
      min: 0,
      timestamp: new Date().toISOString()
    };
  }

  private async generateReport(): Promise<Record<string, any>> {
    // 模拟报告生成
    return { 
      reportId: 'report_' + Date.now(),
      format: 'pdf',
      size: '2.5MB',
      timestamp: new Date().toISOString()
    };
  }

  private async showWorkflows(): Promise<void> {
    const workflowList = Array.from(this.workflows.keys()).join(', ');
    this.sendResponse(\`可用工作流: \${workflowList}\`);
  }

  private async showWorkflowStatus(): Promise<void> {
    if (!this.currentWorkflow) {
      this.sendResponse('当前没有运行的工作流');
      return;
    }

    const workflow = this.workflows.get(this.currentWorkflow);
    if (!workflow) return;

    const status = workflow
      .map((step, index) => \`\${index + 1}. \${step.name} - \${step.status}\`)
      .join('\\n');

    this.sendResponse(\`工作流状态:\\n\${status}\`);
  }

  private extractWorkflowName(content: string): string | null {
    const match = content.match(/工作流\\s*[:：]?\\s*([\\w-]+)/);
    return match ? match[1] : null;
  }

  private sendResponse(content: string): void {
    const message = {
      id: this.generateId(),
      role: 'assistant' as const,
      content,
      timestamp: new Date(),
    };

    this.emitEvent('message.sent', { message });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public addWorkflow(name: string, steps: WorkflowStep[]): void {
    this.workflows.set(name, steps);
  }

  public getWorkflows(): Map<string, WorkflowStep[]> {
    return new Map(this.workflows);
  }
}

export const ${name}WorkflowAgent = new ${className}WorkflowAgent();
`;
}
