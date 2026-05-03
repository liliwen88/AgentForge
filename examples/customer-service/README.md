# AgentForge客户服务Agent示例

这是一个完整的AgentForge示例项目，展示了如何创建一个智能客户服务助手。

## 🎯 项目概述

这个示例演示了：
- 创建专门的客户服务Agent
- 处理多种客户咨询类型
- 会话管理和工单创建
- 意图识别和智能响应

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行示例

```bash
npm run dev
```

### 构建项目

```bash
npm run build
npm start
```

## 📁 项目结构

```
customer-service/
├── src/
│   ├── agents/
│   │   └── customer-service-agent.ts    # 客户服务Agent
│   └── index.ts                         # 主入口文件
├── package.json
└── README.md
```

## 🤖 Agent功能

### 支持的咨询类型

1. **订单查询** - 订单状态、物流信息
2. **退货处理** - 创建退货工单
3. **产品信息** - 功能介绍、使用指导
4. **投诉处理** - 问题记录和升级
5. **价格咨询** - 产品价格、优惠信息
6. **一般咨询** - 综合问题解答

### 智能特性

- **意图识别** - 自动识别客户咨询类型
- **会话管理** - 跟踪客户对话历史
- **工单系统** - 自动创建服务工单
- **状态管理** - 实时Agent状态监控

## 💡 代码示例

### 创建客户服务Agent

```typescript
import { BaseAgent, AgentConfig } from '@agentforge/core';

const config: AgentConfig = {
  name: 'customer-service',
  description: '智能客户服务助手',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  tools: ['calculator', 'text_processor', 'datetime'],
  memory: {
    type: 'both',
    maxSize: 200,
  },
};

export class CustomerServiceAgent extends BaseAgent {
  // Agent实现
}
```

### 处理客户消息

```typescript
protected async handleCustomerMessage(message: Message): Promise<void> {
  const intent = await this.analyzeIntent(message);
  const response = await this.generateResponse(message, intent, session);
  
  const replyMessage: Message = {
    id: this.generateId(),
    role: 'assistant',
    content: response,
    timestamp: new Date(),
  };
  
  this.emitEvent('message.sent', { message: replyMessage });
}
```

## 🔧 自定义扩展

### 添加新的咨询类型

1. 在 `analyzeIntent` 方法中添加新的意图识别
2. 在 `generateResponse` 方法中添加处理逻辑
3. 创建相应的响应模板

### 集成外部系统

```typescript
// 集成订单系统
private async queryOrder(orderId: string): Promise<OrderInfo> {
  // 调用订单API
}

// 集成CRM系统
private async createTicket(issue: string): Promise<Ticket> {
  // 创建工单
}
```

## 📊 监控和统计

Agent提供内置的统计功能：

```typescript
// 获取活跃会话数
const activeSessions = agent.getActiveSessionCount();

// 获取工单数量
const ticketCount = agent.getTicketCount();

// 获取会话详情
const session = agent.getSession('customer_001');
```

## 🧪 测试

### 运行测试

```bash
npm test
```

### 测试覆盖

- Agent基本功能测试
- 意图识别测试
- 响应生成测试
- 会话管理测试

## 📚 学习要点

这个示例展示了AgentForge的核心概念：

1. **继承BaseAgent** - 使用框架提供的基础功能
2. **事件驱动** - 通过事件处理消息和状态变化
3. **工具集成** - 使用内置工具扩展Agent能力
4. **记忆管理** - 维护对话历史和上下文
5. **错误处理** - 优雅处理异常情况

## 🎨 最佳实践

- **保持简洁** - 避免过度复杂的逻辑
- **明确意图** - 清晰的意图识别和分类
- **优雅降级** - 在错误时提供有用的反馈
- **状态透明** - 让用户了解Agent的状态

## 🚀 下一步

1. **扩展功能** - 添加更多咨询类型
2. **集成AI** - 接入真实的LLM API
3. **数据持久化** - 添加数据库支持
4. **Web界面** - 创建前端管理界面
5. **多语言** - 支持多种语言

## 📖 相关文档

- [AgentForge AI 原则（CLAUDE.md）](../../CLAUDE.md) · [AGENTS.md](../../AGENTS.md)
- [技术实现与架构说明](../../docs/TECHNICAL_IMPLEMENTATION.md)（含 Agent 与工具系统设计）

---

**这个示例展示了AgentForge如何让AI Agent开发像搭积木一样简单！**
