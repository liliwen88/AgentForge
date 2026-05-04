import { FastifyInstance } from 'fastify';
import { defaultToolRegistry } from '@agentforge/core';

export async function toolRoutes(fastify: FastifyInstance) {
  fastify.get('/tools', async () => {
    const tools = defaultToolRegistry.list();
    return {
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
      })),
    };
  });

  fastify.get('/tools/:name', async (request, reply) => {
    const { name } = request.params as { name: string };
    const tool = defaultToolRegistry.get(name);
    if (!tool) {
      reply.status(404);
      return { error: 'Tool not found' };
    }
    return {
      name: tool.name,
      description: tool.description,
    };
  });

  fastify.post('/tools/:name/execute', async (request, reply) => {
    const { name } = request.params as { name: string };
    const tool = defaultToolRegistry.get(name);
    if (!tool) {
      reply.status(404);
      return { error: 'Tool not found' };
    }
    const args = request.body as Record<string, any>;
    try {
      const result = await tool.execute(args);
      return { success: true, result };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}