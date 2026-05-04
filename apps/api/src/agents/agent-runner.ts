import { AgentRunner, AgentConfig } from '@agentforge/core';

/**
 * 全局 Agent 运行实例
 */
export const agentRunner = new AgentRunner();

/**
 * 创建新的 Agent
 */
export async function createAgent(config: AgentConfig) {
  const agent = await agentRunner.createAgent(config);
  await agent.start();
  return agent;
}

/**
 * 获取指定 Agent
 */
export function getAgent(id: string) {
  return agentRunner.getAgent(id);
}

/**
 * 列出所有 Agent
 */
export function listAgents() {
  return agentRunner.listAgents().map(agent => ({
    id: agent.id,
    config: agent.config,
    state: agent.getState(),
  }));
}

/**
 * 销毁指定 Agent
 */
export async function destroyAgent(id: string) {
  return agentRunner.destroyAgent(id);
}
