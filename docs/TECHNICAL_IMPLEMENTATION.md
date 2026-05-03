# AgentForge技术实现文档

## 目录

1. [项目概述](#项目概述)
2. [架构设计](#架构设计)
3. [核心模块详解](#核心模块详解)
4. [API设计](#api设计)
5. [CLI工具实现](#cli工具实现)
6. [AI编程助手集成](#ai编程助手集成)
7. [示例项目分析](#示例项目分析)
8. [部署和扩展](#部署和扩展)

## 项目概述

AgentForge是一个专为业务开发设计的TypeScript全栈+AI脚手架，其核心目标是让AI Agent开发像搭积木一样简单。项目基于Andrej Karpathy对LLM编程行为的深刻洞察，提供了防止常见编程陷阱的完整解决方案。

### 核心价值

- **积木式开发**: 模块化Agent组件，快速组合和扩展
- **AI友好**: 深度集成主流AI编程助手，提供智能指导
- **业务导向**: 专注解决实际问题，避免过度工程化
- **类型安全**: 全栈TypeScript，编译时错误检查

### 技术栈

- **语言**: TypeScript 5.3+ (严格模式)
- **构建**: Turbo (monorepo管理)
- **运行时**: Node.js 18+
- **验证**: Zod (类型验证)
- **事件**: EventEmitter3
- **CLI**: Commander.js + Inquirer.js

## 架构设计

### 整体架构

```
AgentForge/
├── packages/core/           # 核心框架
│   ├── types.ts            # 类型定义
│   ├── agent.ts            # Agent基类
│   ├── memory.ts           # 记忆系统
│   ├── tools.ts            # 工具系统
│   └── runner.ts           # 运行器
├── src/cli/                # 命令行工具
│   ├── index.ts            # CLI入口
│   └── commands/           # 命令实现
├── docs/                   # 文档
└── examples/               # 示例项目
```

### 设计原则

1. **单一职责**: 每个模块专注特定功能
2. **开放封闭**: 对扩展开放，对修改封闭
3. **依赖倒置**: 依赖抽象而非具体实现
4. **组合优于继承**: 优先使用组合模式

### 核心概念

- **Agent**: 具有自主能力的智能实体
- **Tool**: Agent可调用的功能模块
- **Memory**: Agent的记忆存储系统
- **Event**: Agent间通信机制
- **Runner**: Agent生命周期管理

## 核心模块详解

### 1. 类型系统 (`types.ts`)

类型系统是AgentForge的基石，使用Zod提供运行时类型验证。

#### 核心类型定义

```typescript
// 消息类型
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

// Agent配置
export const AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().optional(),
  tools: z.array(z.string()).optional(),
  memory: z.object({
    type: z.enum(['short-term', 'long-term', 'both']),
    maxSize: z.number().positive().optional(),
  }).default({ type: 'short-term' }),
});

// Agent状态
export const AgentStateSchema = z.object({
  id: z.string(),
  status: z.enum(['idle', 'thinking', 'acting', 'error']),
  currentTask: z.string().optional(),
  progress: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional(),
});
```

#### 接口设计

```typescript
export interface IAgent {
  readonly id: string;
  readonly config: AgentConfig;
  readonly state: AgentState;
  
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<void>;
  callTool(name: string, args: Record<string, any>): Promise<any>;
  getState(): AgentState;
  on(event: string, listener: (event: AgentEvent) => void): void;
  off(event: string, listener: (event: AgentEvent) => void): void;
}

export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;
  execute(args: any): Promise<any>;
}

export interface IMemory {
  get(key: string): any;
  set(key: string, value: any): void;
  delete(key: string): void;
  clear(): void;
  keys(): string[];
  size(): number;
}
```

### 2. Agent基类 (`agent.ts`)

BaseAgent是所有Agent的基类，提供了完整的基础功能。

#### 核心实现

```typescript
export class BaseAgent extends EventEmitter implements IAgent {
  public readonly id: string;
  public readonly config: AgentConfig;
  public state: AgentState;
  private memory: IMemory;
  private tools: Map<string, ITool> = new Map();
  private messageHistory: Message[] = [];

  constructor(config: AgentConfig) {
    super();
    this.id = uuidv4();
    this.config = config;
    this.state = {
      id: this.id,
      status: 'idle',
    };
    this.memory = new ShortTermMemory(config.memory.maxSize || 100);
  }
}
```

#### 生命周期管理

```typescript
async start(): Promise<void> {
  this.updateState({ status: 'idle' });
  this.emitEvent('agent.started', { agentId: this.id });
}

async stop(): Promise<void> {
  this.updateState({ status: 'idle' });
  this.emitEvent('agent.stopped', { agentId: this.id });
}
```

#### 消息处理

```typescript
async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<void> {
  const fullMessage: Message = {
    ...message,
    id: uuidv4(),
    timestamp: new Date(),
  };

  // 验证消息格式
  const validatedMessage = MessageSchema.parse(fullMessage);
  this.messageHistory.push(validatedMessage);
  
  this.emitEvent('message.received', { message: validatedMessage });
  
  // 处理消息
  await this.processMessage(validatedMessage);
}
```

#### 工具调用

```typescript
async callTool(name: string, args: Record<string, any>): Promise<any> {
  const tool = this.tools.get(name);
  if (!tool) {
    throw new Error(`Tool '${name}' not found`);
  }

  this.emitEvent('tool.called', { toolName: name, args });
  
  try {
    const result = await tool.execute(args);
    this.emitEvent('tool.completed', { toolName: name, args, result, status: 'success' });
    return result;
  } catch (error) {
    this.emitEvent('tool.completed', { 
      toolName: name, 
      args, 
      error: error instanceof Error ? error.message : String(error),
      status: 'error' 
    });
    throw error;
  }
}
```

### 3. 记忆系统 (`memory.ts`)

记忆系统提供了三种不同的记忆实现，满足不同场景需求。

#### 短期记忆

```typescript
export class ShortTermMemory implements IMemory {
  private data: Map<string, any> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, value: any): void {
    if (this.data.size >= this.maxSize && !this.data.has(key)) {
      // 删除最旧的条目（简单的FIFO策略）
      const firstKey = this.data.keys().next().value;
      if (firstKey) {
        this.data.delete(firstKey);
      }
    }
    this.data.set(key, value);
  }
}
```

#### 长期记忆

```typescript
export class LongTermMemory implements IMemory {
  private data: Map<string, any> = new Map();
  private storageKey: string;

  constructor(storageKey: string = 'agentforge-memory') {
    this.storageKey = storageKey;
    this.load();
  }

  private load(): void {
    try {
      if (this.isBrowser()) {
        const stored = (globalThis as any).localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.data = new Map(Object.entries(parsed));
        }
      }
    } catch (error) {
      // 静默处理错误，避免在服务端环境中报错
    }
  }

  private save(): void {
    try {
      if (this.isBrowser()) {
        const serialized = JSON.stringify(Object.fromEntries(this.data));
        (globalThis as any).localStorage.setItem(this.storageKey, serialized);
      }
    } catch (error) {
      // 静默处理错误，避免在服务端环境中报错
    }
  }

  private isBrowser(): boolean {
    return typeof globalThis !== 'undefined' && 
           typeof (globalThis as any).localStorage !== 'undefined';
  }
}
```

#### 混合记忆

```typescript
export class HybridMemory implements IMemory {
  private shortTerm: ShortTermMemory;
  private longTerm: LongTermMemory;
  private shortTermThreshold: number;

  get(key: string): any {
    // 先从短期记忆查找
    let value = this.shortTerm.get(key);
    if (value !== undefined) {
      return value;
    }

    // 再从长期记忆查找
    value = this.longTerm.get(key);
    if (value !== undefined) {
      // 将找到的值移到短期记忆
      this.shortTerm.set(key, value);
    }

    return value;
  }

  set(key: string, value: any): void {
    // 总是设置到短期记忆
    this.shortTerm.set(key, value);

    // 如果短期记忆超过阈值，将旧数据移到长期记忆
    if (this.shortTerm.size() > this.shortTermThreshold) {
      const keys = this.shortTerm.keys();
      const keysToMove = keys.slice(0, Math.floor(keys.length / 2));
      
      for (const keyToMove of keysToMove) {
        const value = this.shortTerm.get(keyToMove);
        if (value !== undefined) {
          this.longTerm.set(keyToMove, value);
          this.shortTerm.delete(keyToMove);
        }
      }
    }
  }
}
```

### 4. 工具系统 (`tools.ts`)

工具系统提供了可插拔的功能模块，支持动态加载和扩展。

#### 基础工具类

```typescript
export abstract class BaseTool implements ITool {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly schema: z.ZodSchema;

  abstract execute(args: any): Promise<any>;

  protected validateArgs(args: any): any {
    return this.schema.parse(args);
  }
}
```

#### 计算器工具

```typescript
export class CalculatorTool extends BaseTool {
  public readonly name = 'calculator';
  public readonly description = '执行基本数学计算';
  public readonly schema = z.object({
    expression: z.string().describe('要计算的数学表达式，如 "2 + 3 * 4"'),
  });

  async execute(args: { expression: string }): Promise<number> {
    const validated = this.validateArgs(args);
    
    try {
      // 安全的数学表达式计算
      const result = this.evaluateExpression(validated.expression);
      return result;
    } catch (error) {
      throw new Error(`计算错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private evaluateExpression(expression: string): number {
    // 只允许数字、基本运算符和括号
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    if (sanitized !== expression) {
      throw new Error('表达式包含不允许的字符');
    }

    try {
      // 使用Function构造函数进行安全计算
      return Function(`"use strict"; return (${sanitized})`)();
    } catch (error) {
      throw new Error('无效的数学表达式');
    }
  }
}
```

#### 文本处理工具

```typescript
export class TextTool extends BaseTool {
  public readonly name = 'text_processor';
  public readonly description = '文本处理工具，包括统计、转换等操作';
  public readonly schema = z.object({
    action: z.enum(['count', 'upper', 'lower', 'reverse']).describe('要执行的操作'),
    text: z.string().describe('要处理的文本'),
  });

  async execute(args: { 
    action: 'count' | 'upper' | 'lower' | 'reverse'; 
    text: string;
  }): Promise<any> {
    const validated = this.validateArgs(args);

    switch (validated.action) {
      case 'count':
        return {
          characters: validated.text.length,
          words: validated.text.split(/\s+/).filter(word => word.length > 0).length,
          lines: validated.text.split('\n').length,
        };
      case 'upper':
        return validated.text.toUpperCase();
      case 'lower':
        return validated.text.toLowerCase();
      case 'reverse':
        return validated.text.split('').reverse().join('');
      default:
        throw new Error(`不支持的操作: ${validated.action}`);
    }
  }
}
```

#### 工具注册表

```typescript
export class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  register(tool: ITool): void {
    this.tools.set(tool.name, tool);
  }

  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  get(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  list(): ITool[] {
    return Array.from(this.tools.values());
  }

  listNames(): string[] {
    return Array.from(this.tools.keys());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}
```

### 5. 运行器 (`runner.ts`)

运行器负责Agent的生命周期管理和资源调度。

```typescript
export class AgentRunner implements IAgentRunner {
  private agents: Map<string, IAgent> = new Map();

  async createAgent(config: AgentConfig): Promise<IAgent> {
    // 验证配置
    const validatedConfig = AgentConfigSchema.parse(config);

    // 创建Agent实例
    const agent = new BaseAgent(validatedConfig);

    // 添加默认工具
    const defaultTools = defaultToolRegistry.list();
    for (const tool of defaultTools) {
      if (validatedConfig.tools?.includes(tool.name)) {
        agent.addTool(tool);
      }
    }

    // 存储Agent
    this.agents.set(agent.id, agent);

    return agent;
  }

  getAgent(id: string): IAgent | undefined {
    return this.agents.get(id);
  }

  listAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }

  async destroyAgent(id: string): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      await agent.stop();
      this.agents.delete(id);
    }
  }

  async shutdown(): Promise<void> {
    // 停止所有Agent
    const shutdownPromises = Array.from(this.agents.values()).map(agent => agent.stop());
    await Promise.all(shutdownPromises);
    
    // 清空Agent列表
    this.agents.clear();
  }
}
```

## API设计

### Agent API

#### 创建Agent

```typescript
import { AgentRunner, AgentConfig } from '@agentforge/core';

const runner = new AgentRunner();

const config: AgentConfig = {
  name: 'my-agent',
  description: '我的智能助手',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  tools: ['calculator', 'text_processor'],
  memory: {
    type: 'both',
    maxSize: 200,
  },
};

const agent = await runner.createAgent(config);
await agent.start();
```

#### 发送消息

```typescript
await agent.sendMessage({
  role: 'user',
  content: '你好，请帮我计算 2 + 3 * 4',
  metadata: { userId: 'user123' },
});
```

#### 监听事件

```typescript
agent.on('message.received', (event) => {
  console.log('收到消息:', event.data.message);
});

agent.on('tool.completed', (event) => {
  console.log('工具调用完成:', event.data);
});

agent.on('state.changed', (event) => {
  console.log('状态变化:', event.data.newState);
});
```

#### 调用工具

```typescript
const result = await agent.callTool('calculator', {
  expression: '2 + 3 * 4',
});
console.log('计算结果:', result); // 14
```

### 工具开发API

#### 创建自定义工具

```typescript
import { BaseTool } from '@agentforge/core';
import { z } from 'zod';

export class WeatherTool extends BaseTool {
  public readonly name = 'weather';
  public readonly description = '获取天气信息';
  public readonly schema = z.object({
    city: z.string().describe('城市名称'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius').describe('温度单位'),
  });

  async execute(args: { city: string; units?: 'celsius' | 'fahrenheit' }): Promise<any> {
    const validated = this.validateArgs(args);
    
    // 调用天气API
    const weather = await this.fetchWeather(validated.city);
    
    return {
      city: validated.city,
      temperature: weather.temperature,
      description: weather.description,
      units: validated.units || 'celsius',
    };
  }

  private async fetchWeather(city: string): Promise<any> {
    // 实际的API调用逻辑
    // 这里只是示例
    return {
      temperature: 25,
      description: '晴天',
    };
  }
}

// 注册工具
import { defaultToolRegistry } from '@agentforge/core';
defaultToolRegistry.register(new WeatherTool());
```

### 记忆系统API

#### 使用记忆

```typescript
// 在Agent中使用记忆
export class MyAgent extends BaseAgent {
  protected async handleMessage(message: Message): Promise<void> {
    // 存储信息到记忆
    this.setMemory('last_user_message', message.content);
    
    // 从记忆中获取信息
    const lastMessage = this.getMemory('last_user_message');
    
    // 处理消息...
  }
}
```

#### 自定义记忆实现

```typescript
import { IMemory } from '@agentforge/core';

export class DatabaseMemory implements IMemory {
  private db: any; // 数据库连接

  constructor(connectionString: string) {
    // 初始化数据库连接
  }

  async get(key: string): Promise<any> {
    // 从数据库获取数据
    const result = await this.db.get(key);
    return result?.value;
  }

  async set(key: string, value: any): Promise<void> {
    // 存储数据到数据库
    await this.db.set(key, { value, timestamp: new Date() });
  }

  async delete(key: string): Promise<void> {
    // 从数据库删除数据
    await this.db.delete(key);
  }

  async clear(): Promise<void> {
    // 清空所有数据
    await this.db.clear();
  }

  async keys(): Promise<string[]> {
    // 获取所有键
    return await this.db.keys();
  }

  async size(): Promise<number> {
    // 获取数据大小
    return await this.db.size();
  }
}
```

## CLI工具实现

### 架构设计

CLI工具基于Commander.js构建，采用模块化命令结构：

```
src/cli/
├── index.ts              # CLI入口和路由
└── commands/
    ├── create.ts          # 创建项目命令
    ├── add-agent.ts       # 添加Agent命令
    └── list-tools.ts      # 列出工具命令
```

### 主要命令

#### create命令

```typescript
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

  // 选择模板
  let template = options.template;
  if (!template) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: '选择项目模板:',
        choices: [
          { name: 'basic - 基础Agent项目', value: 'basic' },
          { name: 'web - Web应用项目', value: 'web' },
          { name: 'api - API服务项目', value: 'api' },
          { name: 'fullstack - 全栈项目', value: 'fullstack' },
        ],
        default: 'basic',
      },
    ]);
    template = answers.template;
  }

  // 创建项目
  const spinner = ora(`创建 ${template} 模板项目...`).start();
  
  try {
    await createProjectStructure(targetDir, template);
    await copyTemplateFiles(targetDir, template);
    spinner.succeed('项目创建完成');
  } catch (error) {
    spinner.fail('创建项目失败');
    throw error;
  }
}
```

#### add-agent命令

```typescript
export async function addAgent(agentName?: string, options: AddAgentOptions = {}) {
  // 获取Agent名称和类型
  const { agentName: name, type } = await inquirer.prompt([
    {
      type: 'input',
      name: 'agentName',
      message: '请输入Agent名称:',
      validate: (input: string) => input.trim() !== '',
    },
    {
      type: 'list',
      name: 'type',
      message: '选择Agent类型:',
      choices: [
        { name: 'basic - 基础Agent', value: 'basic' },
        { name: 'chat - 聊天Agent', value: 'chat' },
        { name: 'task - 任务Agent', value: 'task' },
        { name: 'workflow - 工作流Agent', value: 'workflow' },
      ],
    },
  ]);

  // 创建Agent文件
  await createAgentFile(agentName, type);
}
```

### 模板系统

CLI工具支持多种项目模板，每种模板包含不同的文件结构和依赖：

#### 基础模板
```
basic/
├── src/
│   ├── agents/
│   ├── tools/
│   ├── components/
│   └── utils/
├── docs/
└── tests/
```

#### Web模板
```
web/
├── src/
│   ├── agents/
│   ├── tools/
│   └── components/
├── apps/web/
│   ├── pages/
│   ├── components/
│   └── public/
└── docs/
```

## AI编程助手集成

### Karpathy原则实现

AgentForge深度集成Andrej Karpathy观察到的LLM编程行为模式，提供四大核心原则：

#### 1. 思考先于编码

**问题**: LLM经常默默选择解释并继续执行，不暴露假设。

**解决方案**: 在提示词中明确要求：
- 明确陈述假设
- 呈现多种解释
- 在必要时提出反对
- 困惑时停止并提问

**实现**:
```markdown
## 1. 思考先于编码

**不要假设。不要隐藏困惑。暴露权衡。**

在实现之前：
- **明确陈述假设** - 如果不确定，询问而不是猜测
- **呈现多种解释** - 当存在歧义时不要默默选择
- **在必要时提出反对** - 如果存在更简单的方法，说明原因
- **困惑时停止** - 明确指出不清楚的地方并寻求澄清
```

#### 2. 简洁优先

**问题**: LLM倾向于过度复杂化代码和API，创建膨胀的抽象。

**解决方案**: 强制最小化代码实现：
- 不添加超出要求的功能
- 不为单用途代码创建抽象
- 不添加未要求的"灵活性"

**实现**:
```markdown
## 2. 简洁优先

**最小代码解决实际问题。不做推测。**

- 不添加超出要求的功能
- 不为单用途代码创建抽象
- 不添加未要求的"灵活性"或"可配置性"
- 如果200行代码可以写成50行，重写它

**测试标准：** 高级工程师会说这是过度复杂吗？如果是，简化它。
```

#### 3. 精确修改

**问题**: LLM经常"改进"不相关的代码，改变风格，重构正常工作的部分。

**解决方案**: 限制修改范围：
- 只修改必要的部分
- 匹配现有代码风格
- 清理自己的"烂摊子"

**实现**:
```markdown
## 3. 精确修改

**只触碰必须的部分。只清理自己的烂摊子。**

- 不要"改进"相邻代码、注释或格式
- 不要重构未损坏的内容
- 匹配现有风格，即使你会用不同方式
- 如果注意到无关的死代码，提及它 - 不要删除它
```

#### 4. 目标驱动

**问题**: LLM执行模糊任务时缺乏明确的成功标准。

**解决方案**: 转化为可验证目标：
- 定义成功标准
- 将任务转化为可验证目标
- 循环直到达成目标

**实现**:
```markdown
## 4. 目标驱动

**定义成功标准。循环直到验证。**

| 而不是... | 转化为... |
|----------|-----------|
| "添加验证" | "为无效输入编写测试，然后使它们通过" |
| "修复bug" | "编写重现它的测试，然后使它通过" |
| "重构X" | "确保重构前后测试都通过" |
```

### Claude集成

#### 根目录 `CLAUDE.md` 与 `AGENTS.md`

Claude Code 读取仓库根目录 `CLAUDE.md`；Cursor、Codex、Windsurf 等读取根目录 `AGENTS.md`（内容对齐）。脚手架亦会生成 `.github/copilot-instructions.md`、`.windsurf/rules/agentforge.md`、`.cursor/rules/agentforge.mdc`。不在 `docs/` 下放置原则正文或工具路径索引文件。

```markdown
# AgentForge AI编程助手指导原则

基于Andrej Karpathy观察到的LLM编程行为优化...

## AgentForge特定规则

### Agent开发约束

**禁止过度抽象：**
- 不要为单一Agent创建基类
- 不要为简单消息处理创建复杂状态机
- 避免为3个以下的Agent创建注册表系统

**优先使用内置功能：**
- 使用BaseAgent而不是重新实现
- 使用内置工具和记忆系统
- 使用内置记忆系统而不是自定义实现
```

### Cursor集成

#### Cursor 项目规则文件

```markdown
# .cursor/rules/agentforge.mdc

# AgentForge项目开发规则

## 核心原则

遵循Andrej Karpathy的四原则：
1. 思考先于编码 - 明确假设，暴露权衡
2. 简洁优先 - 最小代码解决实际问题  
3. 精确修改 - 只修改必要部分
4. 目标驱动 - 定义成功标准并验证

## Agent开发规范

### 基础要求
- 使用TypeScript严格模式
- 继承BaseAgent类而不是重新实现
- 使用内置工具和记忆系统
- 避免过度抽象和复杂配置
```

### 反模式检测

系统提供了具体的反模式示例，帮助AI助手避免常见错误：

#### 过度抽象反模式

```typescript
// ❌ 不要这样做
abstract class AgentBase {
  abstract processMessage(message: Message): Promise<void>;
  abstract handleError(error: Error): void;
}

class ChatAgent extends AgentBase {
  // 大量样板代码
}

// ✅ 应该这样做
export class ChatAgent extends BaseAgent {
  protected async handleMessage(message: Message): Promise<void> {
    // 直接实现逻辑
  }
}
```

#### 过度配置反模式

```typescript
// ❌ 不要这样做
interface AgentConfig {
  behavior: {
    responseStyle: 'formal' | 'casual' | 'technical';
    personality: {
      friendliness: number; // 0-100
      humor: number; // 0-100
      professionalism: number; // 0-100
    };
  };
}

// ✅ 应该这样做
interface AgentConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  tools: string[];
}
```

## 示例项目分析

### 客户服务Agent示例

#### 项目结构

```
examples/customer-service/
├── src/
│   ├── agents/
│   │   └── customer-service-agent.ts
│   └── index.ts
├── package.json
└── README.md
```

#### 核心实现

```typescript
export class CustomerServiceAgent extends BaseAgent {
  private ticketId: number = 1000;
  private customerSessions: Map<string, any> = new Map();

  protected async handleCustomerMessage(message: Message): Promise<void> {
    const customerId = this.getCustomerId(message);
    
    // 获取或创建客户会话
    let session = this.customerSessions.get(customerId);
    if (!session) {
      session = {
        customerId,
        startTime: new Date(),
        messages: [],
        ticketId: null,
        status: 'active',
      };
      this.customerSessions.set(customerId, session);
    }

    // 分析客户意图
    const intent = await this.analyzeIntent(message);
    
    // 生成响应
    const response = await this.generateResponse(message, intent, session);
    
    // 发送响应
    const replyMessage: Message = {
      id: this.generateId(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: { intent, customerId, sessionId: session.customerId },
    };

    session.messages.push(replyMessage);
    this.emitEvent('message.sent', { message: replyMessage });
  }

  private async analyzeIntent(message: Message): Promise<string> {
    const content = message.content.toLowerCase();
    
    if (content.includes('订单') || content.includes('购买')) {
      return 'order_inquiry';
    }
    if (content.includes('退货') || content.includes('退款')) {
      return 'return_request';
    }
    if (content.includes('产品') || content.includes('功能')) {
      return 'product_info';
    }
    
    return 'general_inquiry';
  }
}
```

#### 意图识别系统

```typescript
private async generateResponse(
  message: Message, 
  intent: string, 
  session: any
): Promise<string> {
  switch (intent) {
    case 'order_inquiry':
      return await this.handleOrderInquiry(message, session.customerId);
    case 'return_request':
      return await this.handleReturnRequest(message, session.customerId, session);
    case 'product_info':
      return await this.handleProductInfo(message);
    default:
      return await this.handleGeneralInquiry(message, session.customerId);
  }
}
```

#### 会话管理

```typescript
public getSession(customerId: string): any {
  return this.customerSessions.get(customerId);
}

public getActiveSessionCount(): number {
  return Array.from(this.customerSessions.values())
    .filter(session => session.status === 'active').length;
}

public getTicketCount(): number {
  return Array.from(this.customerSessions.values())
    .filter(session => session.ticketId !== null).length;
}
```

### 使用示例

```typescript
import { customerServiceAgent } from './agents/customer-service-agent.js';

async function main() {
  // 启动Agent
  await customerServiceAgent.start();
  
  // 模拟客户咨询
  await customerServiceAgent.sendMessage({
    role: 'user',
    content: '你好，我想查询我的订单状态',
    metadata: { customerId: 'customer_001' },
  });
  
  // 显示统计信息
  console.log('活跃会话数:', customerServiceAgent.getActiveSessionCount());
  console.log('创建工单数:', customerServiceAgent.getTicketCount());
}
```

## 部署和扩展

### 生产环境部署

#### Docker化

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package.json
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/*/package*.json ./packages/*/

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 环境配置

```typescript
// config/production.ts
export const productionConfig = {
  agent: {
    maxConcurrent: 10,
    timeout: 30000,
    retryAttempts: 3,
  },
  memory: {
    type: 'long-term',
    maxSize: 1000,
    persistence: true,
  },
  logging: {
    level: 'info',
    format: 'json',
  },
};
```

### 扩展策略

#### 水平扩展

```typescript
// cluster/agent-cluster.ts
import { AgentRunner } from '@agentforge/core';
import { Cluster } from 'cluster';

export class AgentCluster {
  private runners: AgentRunner[] = [];
  private currentIndex = 0;

  constructor(private size: number) {
    for (let i = 0; i < size; i++) {
      this.runners.push(new AgentRunner());
    }
  }

  async createAgent(config: AgentConfig): Promise<IAgent> {
    // 负载均衡
    const runner = this.getNextRunner();
    return await runner.createAgent(config);
  }

  private getNextRunner(): AgentRunner {
    const runner = this.runners[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.runners.length;
    return runner;
  }
}
```

#### 插件系统

```typescript
// plugins/plugin-manager.ts
export interface IPlugin {
  name: string;
  version: string;
  install(context: PluginContext): void;
  uninstall(context: PluginContext): void;
}

export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();

  async installPlugin(plugin: IPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already installed`);
    }

    const context = this.createPluginContext();
    plugin.install(context);
    this.plugins.set(plugin.name, plugin);
  }

  async uninstallPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    const context = this.createPluginContext();
    plugin.uninstall(context);
    this.plugins.delete(name);
  }

  private createPluginContext(): PluginContext {
    return {
      registerTool: (tool: ITool) => defaultToolRegistry.register(tool),
      unregisterTool: (name: string) => defaultToolRegistry.unregister(name),
      getAgentRunner: () => new AgentRunner(),
    };
  }
}
```

### 监控和日志

#### 性能监控

```typescript
// monitoring/metrics.ts
export class AgentMetrics {
  private metrics: Map<string, number> = new Map();

  incrementMetric(name: string, value: number = 1): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  getMetric(name: string): number {
    return this.metrics.get(name) || 0;
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
  }
}

// 在BaseAgent中集成监控
export class BaseAgent extends EventEmitter implements IAgent {
  private metrics = new AgentMetrics();

  async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.processMessage(message);
      
      // 记录成功指标
      this.metrics.incrementMetric('messages_processed');
      this.metrics.incrementMetric('processing_time', Date.now() - startTime);
    } catch (error) {
      // 记录错误指标
      this.metrics.incrementMetric('messages_failed');
      throw error;
    }
  }
}
```

#### 结构化日志

```typescript
// logging/logger.ts
export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  agentId?: string;
  userId?: string;
}

export class AgentLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number;

  constructor(maxLogs: number = 1000) {
    this.maxLogs = maxLogs;
  }

  log(level: LogEntry['level'], message: string, context?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      agentId: context?.agentId,
      userId: context?.userId,
    };

    this.logs.push(entry);
    
    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 输出到控制台
    console.log(JSON.stringify(entry));
  }

  getLogs(filter?: Partial<LogEntry>): LogEntry[] {
    return this.logs.filter(log => {
      if (filter?.level && log.level !== filter.level) return false;
      if (filter?.agentId && log.agentId !== filter.agentId) return false;
      if (filter?.userId && log.userId !== filter.userId) return false;
      return true;
    });
  }
}
```

### 安全考虑

#### 输入验证

```typescript
// security/input-validator.ts
export class InputValidator {
  static validateMessage(message: any): Message {
    // 使用Zod进行严格验证
    return MessageSchema.parse(message);
  }

  static sanitizeInput(input: string): string {
    // 移除潜在的危险字符
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  static validateToolArgs(toolName: string, args: any): any {
    const tool = defaultToolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    return tool.schema.parse(args);
  }
}
```

#### 权限控制

```typescript
// security/permissions.ts
export interface Permission {
  resource: string;
  actions: string[];
}

export class PermissionManager {
  private permissions: Map<string, Permission[]> = new Map();

  grantPermissions(agentId: string, permissions: Permission[]): void {
    this.permissions.set(agentId, permissions);
  }

  hasPermission(agentId: string, resource: string, action: string): boolean {
    const agentPermissions = this.permissions.get(agentId);
    if (!agentPermissions) return false;

    return agentPermissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );
  }

  checkPermission(agentId: string, resource: string, action: string): void {
    if (!this.hasPermission(agentId, resource, action)) {
      throw new Error(`Permission denied: ${action} on ${resource}`);
    }
  }
}
```

## 总结

AgentForge通过以下核心技术实现了"让AI Agent开发像搭积木一样简单"的目标：

1. **类型安全**: 完整的TypeScript类型系统和Zod验证
2. **模块化设计**: 清晰的接口定义和可插拔架构
3. **事件驱动**: 基于EventEmitter的松耦合通信
4. **工具系统**: 可扩展的工具注册和调用机制
5. **记忆管理**: 多种记忆策略满足不同需求
6. **CLI工具**: 完整的项目脚手架和管理命令
7. **AI集成**: 深度优化的编程助手指导原则

这些技术特性共同构成了一个强大而易用的AI Agent开发框架，让开发者能够专注于业务逻辑而不是技术复杂性。
