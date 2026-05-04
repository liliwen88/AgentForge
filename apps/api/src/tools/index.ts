import { defaultToolRegistry } from '@agentforge/core';

/**
 * 列出所有可用工具
 */
export function listTools() {
  return defaultToolRegistry.list().map(tool => ({
    name: tool.name,
    description: tool.description,
  }));
}

/**
 * 获取指定工具
 */
export function getTool(name: string) {
  return defaultToolRegistry.get(name);
}

/**
 * 执行工具
 */
export async function executeTool(name: string, args: Record<string, any>) {
  const tool = defaultToolRegistry.get(name);
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  return tool.execute(args);
}
