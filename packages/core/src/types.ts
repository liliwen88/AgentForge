import { z } from 'zod';

// 基础消息类型
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// Agent能力定义
export const CapabilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.any(), // Zod schema
  outputSchema: z.any(), // Zod schema
});

export type Capability = z.infer<typeof CapabilitySchema>;

// 工具调用定义
export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.any()),
  result: z.any().optional(),
  status: z.enum(['pending', 'success', 'error']),
  error: z.string().optional(),
});

export type ToolCall = z.infer<typeof ToolCallSchema>;

// Agent状态
export const AgentStateSchema = z.object({
  id: z.string(),
  status: z.enum(['idle', 'thinking', 'acting', 'error']),
  currentTask: z.string().optional(),
  progress: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;

// Agent配置
export const AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().optional(),
  capabilities: z.array(CapabilitySchema).optional(),
  tools: z.array(z.string()).optional(),
  memory: z.object({
    type: z.enum(['short-term', 'long-term', 'both']),
    maxSize: z.number().positive().optional(),
  }).default({ type: 'short-term' }),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// Agent事件
export const AgentEventSchema = z.object({
  type: z.enum([
    'agent.created',
    'agent.started',
    'agent.stopped',
    'agent.error',
    'message.received',
    'message.sent',
    'tool.called',
    'tool.completed',
    'state.changed'
  ]),
  agentId: z.string(),
  timestamp: z.date(),
  data: z.record(z.any()).optional(),
});

export type AgentEvent = z.infer<typeof AgentEventSchema>;

// 接口定义
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

export interface IAgentRunner {
  createAgent(config: AgentConfig): Promise<IAgent>;
  getAgent(id: string): IAgent | undefined;
  listAgents(): IAgent[];
  destroyAgent(id: string): Promise<void>;
}
