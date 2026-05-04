import { z } from 'zod';
import { BaseTool } from '@agentforge/core';

export class WebSearchTool extends BaseTool {
  public readonly name = 'web_search';
  public readonly description = '搜索网页内容';
  public readonly schema = z.object({
    query: z.string().describe('搜索查询'),
    limit: z.number().optional().describe('返回结果数量限制'),
  });

  async execute(args: { query: string; limit?: number }): Promise<any> {
    const validated = this.validateArgs(args);

    return {
      query: validated.query,
      results: [],
      message: 'Web search tool requires API configuration',
    };
  }
}