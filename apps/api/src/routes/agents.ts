import { FastifyInstance } from 'fastify';
import { AgentRunner, AgentConfig } from '@agentforge/core';
import { z } from 'zod';

const AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  tools: z.array(z.string()).optional(),
});

const CreateAgentSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  tools: z.array(z.string()).optional(),
});

const runner = new AgentRunner();

export async function agentRoutes(fastify: FastifyInstance) {
  fastify.get('/agents', async () => {
    const agents = runner.listAgents();
    return {
      agents: agents.map(agent => ({
        id: agent.id,
        config: agent.config,
        state: agent.getState(),
      })),
    };
  });

  fastify.post('/agents', async (request) => {
    const validatedConfig = CreateAgentSchema.parse(request.body);
    const agent = await runner.createAgent(validatedConfig as AgentConfig);
    await agent.start();
    return {
      id: agent.id,
      config: agent.config,
      state: agent.getState(),
    };
  });

  fastify.get('/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = runner.getAgent(id);
    if (!agent) {
      reply.status(404);
      return { error: 'Agent not found' };
    }
    return {
      id: agent.id,
      config: agent.config,
      state: agent.getState(),
    };
  });

  fastify.delete('/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = runner.getAgent(id);
    if (!agent) {
      reply.status(404);
      return { error: 'Agent not found' };
    }
    await runner.destroyAgent(id);
    return { success: true };
  });

  fastify.post('/agents/:id/start', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = runner.getAgent(id);
    if (!agent) {
      reply.status(404);
      return { error: 'Agent not found' };
    }
    await agent.start();
    return { success: true, state: agent.getState() };
  });

  fastify.post('/agents/:id/stop', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = runner.getAgent(id);
    if (!agent) {
      reply.status(404);
      return { error: 'Agent not found' };
    }
    await agent.stop();
    return { success: true, state: agent.getState() };
  });
}