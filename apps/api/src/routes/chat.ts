import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getAgent } from '../agents';

const SendMessageSchema = z.object({
  agentId: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post('/message', async (request, reply) => {
    const validatedData = SendMessageSchema.parse(request.body);
    const agent = getAgent(validatedData.agentId);

    if (!agent) {
      reply.status(404);
      return { error: 'Agent not found' };
    }

    try {
      await agent.sendMessage({
        role: validatedData.role,
        content: validatedData.content,
        metadata: validatedData.metadata,
      });

      const history = agent.getMessageHistory();
      return {
        success: true,
        message: history[history.length - 1],
        history,
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  fastify.get('/history/:agentId', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };
    const agent = getAgent(agentId);

    if (!agent) {
      reply.status(404);
      return { error: 'Agent not found' };
    }

    return {
      history: agent.getMessageHistory(),
    };
  });

  fastify.delete('/history/:agentId', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };
    const agent = getAgent(agentId);

    if (!agent) {
      reply.status(404);
      return { error: 'Agent not found' };
    }

    agent.clearHistory();
    return { success: true };
  });
}