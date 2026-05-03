import { v4 as uuidv4 } from 'uuid';
import {
  type IAgent,
  type IAgentRunner,
  type AgentConfig,
  AgentConfigSchema,
} from './types.js';
import { BaseAgent } from './agent.js';
import { defaultToolRegistry } from './tools.js';

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

  getAgentCount(): number {
    return this.agents.size;
  }
}
