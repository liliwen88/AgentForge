import { z } from 'zod';
import { BaseTool } from '@agentforge/core';

export class CalculatorTool extends BaseTool {
  public readonly name = 'calculator';
  public readonly description = '执行基本数学计算';
  public readonly schema = z.object({
    expression: z.string().describe('要计算的数学表达式，如 "2 + 3 * 4"'),
  });

  async execute(args: { expression: string }): Promise<number> {
    const validated = this.validateArgs(args);

    try {
      const result = this.evaluateExpression(validated.expression);
      return result;
    } catch (error) {
      throw new Error(`计算错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private evaluateExpression(expression: string): number {
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

    if (sanitized !== expression) {
      throw new Error('表达式包含不允许的字符');
    }

    try {
      return Function(`"use strict"; return (${sanitized})`)();
    } catch (error) {
      throw new Error('无效的数学表达式');
    }
  }
}