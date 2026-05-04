import { create } from 'zustand';

interface AgentConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  tools: string[];
}

interface Agent {
  id: string;
  config: AgentConfig;
}

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface AgentStore {
  currentAgent: Agent | null;
  messages: Message[];
  setCurrentAgent: (agent: Agent | null) => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  currentAgent: null,
  messages: [],

  setCurrentAgent: (agent) => set({ currentAgent: agent, messages: [] }),

  sendMessage: async (content) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set((state) => ({ messages: [...state.messages, userMessage] }));

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.id,
          role: 'user',
          content,
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        set((state) => ({
          messages: [...state.messages, data.message],
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  clearHistory: () => set({ messages: [] }),
}));