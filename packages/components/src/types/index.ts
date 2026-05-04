// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Agent info
export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  status?: 'idle' | 'running' | 'paused' | 'error';
  currentTask?: string;
  progress?: number;
}

// Message type
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  isTyping?: boolean;
}

// Chat interface props
export interface ChatInterfaceProps extends BaseComponentProps {
  agent: AgentInfo;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearHistory?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

// Agent status indicator props
export interface AgentStatusIndicatorProps extends BaseComponentProps {
  agent: AgentInfo;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Tool panel props
export interface ToolPanelProps extends BaseComponentProps {
  tools: Array<{
    name: string;
    description: string;
    status: 'idle' | 'running' | 'success' | 'error';
    result?: any;
  }>;
  onToolExecute?: (toolName: string, args: any) => void;
}

// Memory panel props
export interface MemoryPanelProps extends BaseComponentProps {
  memory: Record<string, any>;
  onMemoryUpdate?: (key: string, value: any) => void;
  onMemoryDelete?: (key: string) => void;
}

// Event log props
export interface AgentEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
}

export interface EventLogProps extends BaseComponentProps {
  events: AgentEvent[];
  maxEvents?: number;
  showTimestamp?: boolean;
}

// Config panel props
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
