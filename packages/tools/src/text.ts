import { z } from 'zod';
import { BaseTool } from '@agentforge/core';

export class TextTool extends BaseTool {
  public readonly name = 'text_processor';
  public readonly description = '文本处理工具，包括统计、转换等操作';
  public readonly schema = z.object({
    action: z.enum(['count', 'upper', 'lower', 'reverse', 'trim']).describe('要执行的操作'),
    text: z.string().describe('要处理的文本'),
  });

  async execute(args: {
    action: 'count' | 'upper' | 'lower' | 'reverse' | 'trim';
    text: string;
  }): Promise<any> {
    const validated = this.validateArgs(args);

    switch (validated.action) {
      case 'count':
        return {
          characters: validated.text.length,
          words: validated.text.split(/\s+/).filter(word => word.length > 0).length,
          lines: validated.text.split('\n').length,
        };
      case 'upper':
        return validated.text.toUpperCase();
      case 'lower':
        return validated.text.toLowerCase();
      case 'reverse':
        return validated.text.split('').reverse().join('');
      case 'trim':
        return validated.text.trim();
      default:
        throw new Error(`不支持的操作: ${validated.action}`);
    }
  }
}