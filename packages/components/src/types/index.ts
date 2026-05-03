import { type AgentState, type Message, type AgentEvent } from '@agentforge/core';

// UI组件通用属性
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Agent相关类型
export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  status: AgentState['status'];
  currentTask?: string;
  progress?: number;
}

// 消息相关类型
export interface ChatMessage extends Message {
  isTyping?: boolean;
}

// 聊天界面类型
export interface ChatInterfaceProps extends BaseComponentProps {
  agent: AgentInfo;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearHistory?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

// Agent状态指示器类型
export interface AgentStatusIndicatorProps extends BaseComponentProps {
  agent: AgentInfo;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// 工具面板类型
export interface ToolPanelProps extends BaseComponentProps {
  tools: Array<{
    name: string;
    description: string;
    status: 'idle' | 'running' | 'success' | 'error';
    result?: any;
  }>;
  onToolExecute?: (toolName: string, args: any) => void;
}

// 记忆面板类型
export interface MemoryPanelProps extends BaseComponentProps {
  memory: Record<string, any>;
  onMemoryUpdate?: (key: string, value: any) => void;
  onMemoryDelete?: (key: string) => void;
}

// 事件日志类型
export interface EventLogProps extends BaseComponentProps {
  events: AgentEvent[];
  maxEvents?: number;
  showTimestamp?: boolean;
}

// 配置面板类型
export interface ConfigPanelProps extends BaseComponentProps {
  config: {
    model: string;
    temperature: number;
    maxTokens?: number;
    tools: string[];
  };
  onConfigUpdate: (config: any) => void;
  availableModels?: string[];
  availableTools?: string[];
}
