import { FastifyInstance } from 'fastify';
import { listTools, getTool, executeTool } from '../tools';

export async function toolRoutes(fastify: FastifyInstance) {
  fastify.get('/tools', async () => {
    return { tools: listTools() };
  });

  fastify.get('/tools/:name', async (request, reply) => {
    const { name } = request.params as { name: string };
    const tool = getTool(name);
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
    const args = request.body as Record<string, any>;
    try {
      const result = await executeTool(name, args);
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