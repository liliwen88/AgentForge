import { type IMemory } from './types.js';

export class ShortTermMemory implements IMemory {
  private data: Map<string, any> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): any {
    return this.data.get(key);
  }

  set(key: string, value: any): void {
    if (this.data.size >= this.maxSize && !this.data.has(key)) {
      // 删除最旧的条目（简单的FIFO策略）
      const firstKey = this.data.keys().next().value;
      if (firstKey) {
        this.data.delete(firstKey);
      }
    }
    this.data.set(key, value);
  }

  delete(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  size(): number {
    return this.data.size;
  }
}

export class LongTermMemory implements IMemory {
  private data: Map<string, any> = new Map();
  private storageKey: string;

  constructor(storageKey: string = 'agentforge-memory') {
    this.storageKey = storageKey;
    this.load();
  }

  private load(): void {
    try {
      if (this.isBrowser()) {
        const stored = (globalThis as any).localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.data = new Map(Object.entries(parsed));
        }
      }
    } catch (error) {
      // 静默处理错误，避免在服务端环境中报错
    }
  }

  private save(): void {
    try {
      if (this.isBrowser()) {
        const serialized = JSON.stringify(Object.fromEntries(this.data));
        (globalThis as any).localStorage.setItem(this.storageKey, serialized);
      }
    } catch (error) {
      // 静默处理错误，避免在服务端环境中报错
    }
  }

  private isBrowser(): boolean {
    return typeof globalThis !== 'undefined' && 
           typeof (globalThis as any).localStorage !== 'undefined';
  }

  get(key: string): any {
    return this.data.get(key);
  }

  set(key: string, value: any): void {
    this.data.set(key, value);
    this.save();
  }

  delete(key: string): void {
    this.data.delete(key);
    this.save();
  }

  clear(): void {
    this.data.clear();
    this.save();
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  size(): number {
    return this.data.size;
  }
}

export class HybridMemory implements IMemory {
  private shortTerm: ShortTermMemory;
  private longTerm: LongTermMemory;
  private shortTermThreshold: number;

  constructor(
    shortTermSize: number = 100,
    longTermStorageKey: string = 'agentforge-longterm-memory',
    shortTermThreshold: number = 50
  ) {
    this.shortTerm = new ShortTermMemory(shortTermSize);
    this.longTerm = new LongTermMemory(longTermStorageKey);
    this.shortTermThreshold = shortTermThreshold;
  }

  get(key: string): any {
    // 先从短期记忆查找
    let value = this.shortTerm.get(key);
    if (value !== undefined) {
      return value;
    }

    // 再从长期记忆查找
    value = this.longTerm.get(key);
    if (value !== undefined) {
      // 将找到的值移到短期记忆
      this.shortTerm.set(key, value);
    }

    return value;
  }

  set(key: string, value: any): void {
    // 总是设置到短期记忆
    this.shortTerm.set(key, value);

    // 如果短期记忆超过阈值，将旧数据移到长期记忆
    if (this.shortTerm.size() > this.shortTermThreshold) {
      const keys = this.shortTerm.keys();
      const keysToMove = keys.slice(0, Math.floor(keys.length / 2));
      
      for (const keyToMove of keysToMove) {
        const value = this.shortTerm.get(keyToMove);
        if (value !== undefined) {
          this.longTerm.set(keyToMove, value);
          this.shortTerm.delete(keyToMove);
        }
      }
    }
  }

  delete(key: string): void {
    this.shortTerm.delete(key);
    this.longTerm.delete(key);
  }

  clear(): void {
    this.shortTerm.clear();
    this.longTerm.clear();
  }

  keys(): string[] {
    const shortKeys = new Set(this.shortTerm.keys());
    const longKeys = new Set(this.longTerm.keys());
    
    // 合并两个集合
    for (const key of longKeys) {
      shortKeys.add(key);
    }
    
    return Array.from(shortKeys);
  }

  size(): number {
    const shortKeys = new Set(this.shortTerm.keys());
    const longKeys = new Set(this.longTerm.keys());
    
    // 计算唯一键的数量
    for (const key of longKeys) {
      shortKeys.add(key);
    }
    
    return shortKeys.size;
  }
}
