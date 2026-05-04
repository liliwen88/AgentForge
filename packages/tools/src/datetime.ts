import { z } from 'zod';
import { BaseTool } from '@agentforge/core';

export class DateTimeTool extends BaseTool {
  public readonly name = 'datetime';
  public readonly description = '获取当前日期时间信息';
  public readonly schema = z.object({
    action: z.enum(['now', 'format', 'add', 'diff']).describe('要执行的操作'),
    value: z.string().optional().describe('日期值'),
    format: z.string().optional().describe('日期格式'),
    unit: z.enum(['days', 'hours', 'minutes', 'seconds']).optional().describe('时间单位'),
    amount: z.number().optional().describe('要添加或计算的数量'),
  });

  async execute(args: {
    action: 'now' | 'format' | 'add' | 'diff';
    value?: string;
    format?: string;
    unit?: 'days' | 'hours' | 'minutes' | 'seconds';
    amount?: number;
  }): Promise<any> {
    const validated = this.validateArgs(args);
    const now = new Date();

    switch (validated.action) {
      case 'now':
        return {
          iso: now.toISOString(),
          unix: Math.floor(now.getTime() / 1000),
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
        };
      case 'format':
        return now.toLocaleString(validated.format || 'zh-CN');
      case 'add':
        const addMs = this.unitToMs(validated.unit || 'days', validated.amount || 0);
        return new Date(now.getTime() + addMs).toISOString();
      case 'diff':
        return { message: 'Diff operation requires two dates' };
      default:
        throw new Error(`不支持的操作: ${validated.action}`);
    }
  }

  private unitToMs(unit: string, amount: number): number {
    const units: Record<string, number> = {
      days: 86400000,
      hours: 3600000,
      minutes: 60000,
      seconds: 1000,
    };
    return (units[unit] || 86400000) * amount;
  }
}