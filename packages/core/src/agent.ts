import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  type IAgent,
  type AgentConfig,
  type AgentState,
  type Message,
  type AgentEvent,
  type ITool,
  type IMemory,
  MessageSchema,
  AgentEventSchema,
  AgentStateSchema,
} from './types.js';
import { ShortTermMemory } from './memory.js';

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

  async start(): Promise<void> {
    this.updateState({ status: 'idle' });
    this.emitEvent('agent.started', { agentId: this.id });
  }

  async stop(): Promise<void> {
    this.updateState({ status: 'idle' });
    this.emitEvent('agent.stopped', { agentId: this.id });
  }

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

  getState(): AgentState {
    return { ...this.state };
  }

  addTool(tool: ITool): void {
    this.tools.set(tool.name, tool);
  }

  removeTool(name: string): boolean {
    return this.tools.delete(name);
  }

  getTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  getMessageHistory(): Message[] {
    return [...this.messageHistory];
  }

  clearHistory(): void {
    this.messageHistory = [];
  }

  protected updateState(updates: Partial<AgentState>): void {
    const oldState = { ...this.state };
    this.state = AgentStateSchema.parse({
      ...this.state,
      ...updates,
    });
    
    if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
      this.emitEvent('state.changed', { oldState, newState: this.state });
    }
  }

  protected emitEvent(type: AgentEvent['type'], data: Record<string, any> = {}): void {
    const event: AgentEvent = AgentEventSchema.parse({
      type,
      agentId: this.id,
      timestamp: new Date(),
      data,
    });
    
    this.emit(type, event);
  }

  protected getMemory(key: string): any {
    return this.memory.get(key);
  }

  protected setMemory(key: string, value: any): void {
    this.memory.set(key, value);
  }

  protected deleteMemory(key: string): void {
    this.memory.delete(key);
  }

  private async processMessage(message: Message): Promise<void> {
    this.updateState({ status: 'thinking', currentTask: `Processing ${message.role} message` });
    
    try {
      // 基础消息处理逻辑
      // 子类可以重写此方法实现具体逻辑
      await this.handleMessage(message);
      
      this.updateState({ status: 'idle', currentTask: undefined, progress: 1 });
    } catch (error) {
      this.updateState({ 
        status: 'error', 
        currentTask: undefined,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      this.emitEvent('agent.error', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  protected async handleMessage(message: Message): Promise<void> {
    // 默认实现：简单的回声
    if (message.role === 'user') {
      const response: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `I received your message: ${message.content}`,
        timestamp: new Date(),
      };
      
      this.messageHistory.push(response);
      this.emitEvent('message.sent', { message: response });
    }
  }
}
