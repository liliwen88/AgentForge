import { z } from 'zod';
import { type ITool } from './types.js';

export abstract class BaseTool implements ITool {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly schema: z.ZodSchema;

  abstract execute(args: any): Promise<any>;

  protected validateArgs(args: any): any {
    return this.schema.parse(args);
  }
}

export class CalculatorTool extends BaseTool {
  public readonly name = 'calculator';
  public readonly description = '执行基本数学计算';
  public readonly schema = z.object({
    expression: z.string().describe('要计算的数学表达式，如 "2 + 3 * 4"'),
  });

  async execute(args: { expression: string }): Promise<number> {
    const validated = this.validateArgs(args);
    
    try {
      // 安全的数学表达式计算
      const result = this.evaluateExpression(validated.expression);
      return result;
    } catch (error) {
      throw new Error(`计算错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private evaluateExpression(expression: string): number {
    // 只允许数字、基本运算符和括号
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    if (sanitized !== expression) {
      throw new Error('表达式包含不允许的字符');
    }

    try {
      // 使用Function构造函数进行安全计算
      return Function(`"use strict"; return (${sanitized})`)();
    } catch (error) {
      throw new Error('无效的数学表达式');
    }
  }
}

export class TextTool extends BaseTool {
  public readonly name = 'text_processor';
  public readonly description = '文本处理工具，包括统计、转换等操作';
  public readonly schema = z.object({
    action: z.enum(['count', 'upper', 'lower', 'reverse']).describe('要执行的操作'),
    text: z.string().describe('要处理的文本'),
  });

  async execute(args: { action: 'count' | 'upper' | 'lower' | 'reverse'; text: string }): Promise<any> {
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
      default:
        throw new Error(`不支持的操作: ${validated.action}`);
    }
  }
}

export class DateTimeTool extends BaseTool {
  public readonly name = 'datetime';
  public readonly description = '日期时间处理工具';
  public readonly schema = z.object({
    action: z.enum(['now', 'format', 'parse']).describe('要执行的操作'),
    input: z.string().optional().describe('输入值，用于format和parse操作'),
    format: z.string().optional().describe('日期格式，如 "YYYY-MM-DD HH:mm:ss"'),
  });

  async execute(args: { 
    action: 'now' | 'format' | 'parse'; 
    input?: string; 
    format?: string;
  }): Promise<any> {
    const validated = this.validateArgs(args);

    switch (validated.action) {
      case 'now':
        return {
          timestamp: Date.now(),
          iso: new Date().toISOString(),
          local: new Date().toLocaleString(),
        };
      case 'format':
        if (!validated.input) {
          throw new Error('format操作需要input参数');
        }
        return this.formatDate(validated.input, validated.format);
      case 'parse':
        if (!validated.input) {
          throw new Error('parse操作需要input参数');
        }
        return this.parseDate(validated.input);
      default:
        throw new Error(`不支持的操作: ${validated.action}`);
    }
  }

  private formatDate(dateString: string, format?: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('无效的日期字符串');
    }

    if (!format) {
      return date.toISOString();
    }

    // 简单的格式化实现
    return format
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', date.getDate().toString().padStart(2, '0'))
      .replace('HH', date.getHours().toString().padStart(2, '0'))
      .replace('mm', date.getMinutes().toString().padStart(2, '0'))
      .replace('ss', date.getSeconds().toString().padStart(2, '0'));
  }

  private parseDate(dateString: string): any {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('无效的日期字符串');
    }

    return {
      timestamp: date.getTime(),
      iso: date.toISOString(),
      local: date.toLocaleString(),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }
}

export class FileSystemTool extends BaseTool {
  public readonly name = 'filesystem';
  public readonly description = '文件系统操作工具（仅限安全操作）';
  public readonly schema = z.object({
    action: z.enum(['read', 'write', 'exists', 'list']).describe('要执行的操作'),
    path: z.string().describe('文件路径'),
    content: z.string().optional().describe('文件内容，用于write操作'),
  });

  async execute(args: { 
    action: 'read' | 'write' | 'exists' | 'list'; 
    path: string; 
    content?: string;
  }): Promise<any> {
    const validated = this.validateArgs(args);

    // 在浏览器环境中，这些操作可能不可用
    if (typeof window !== 'undefined') {
      throw new Error('文件系统操作在浏览器环境中不可用');
    }

    switch (validated.action) {
      case 'read':
        return this.readFile(validated.path);
      case 'write':
        if (!validated.content) {
          throw new Error('write操作需要content参数');
        }
        return this.writeFile(validated.path, validated.content);
      case 'exists':
        return this.fileExists(validated.path);
      case 'list':
        return this.listFiles(validated.path);
      default:
        throw new Error(`不支持的操作: ${validated.action}`);
    }
  }

  private async readFile(path: string): Promise<string> {
    try {
      const fs = await import('fs/promises');
      return await fs.readFile(path, 'utf-8');
    } catch (error) {
      throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async writeFile(path: string, content: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(path, content, 'utf-8');
    } catch (error) {
      throw new Error(`写入文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private async listFiles(path: string): Promise<string[]> {
    try {
      const fs = await import('fs/promises');
      return await fs.readdir(path);
    } catch (error) {
      throw new Error(`列出目录失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// 工具注册表
export class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  register(tool: ITool): void {
    this.tools.set(tool.name, tool);
  }

  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  get(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  list(): ITool[] {
    return Array.from(this.tools.values());
  }

  listNames(): string[] {
    return Array.from(this.tools.keys());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

// 默认工具注册表
export const defaultToolRegistry = new ToolRegistry();

// 注册默认工具
defaultToolRegistry.register(new CalculatorTool());
defaultToolRegistry.register(new TextTool());
defaultToolRegistry.register(new DateTimeTool());
defaultToolRegistry.register(new FileSystemTool());
