import { BaseAgent, AgentConfig, Message } from '@agentforge/core';

/**
 * 客户服务Agent示例
 * 
 * 这是一个实际的业务Agent，展示如何使用AgentForge创建
 * 专门用于客户服务的智能助手。
 */
const config: AgentConfig = {
  name: 'customer-service',
  description: '智能客户服务助手，处理客户咨询和问题',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  tools: ['calculator', 'text_processor', 'datetime'],
  memory: {
    type: 'both',
    maxSize: 200,
  },
};

export class CustomerServiceAgent extends BaseAgent {
  private ticketId: number = 1000;
  private customerSessions: Map<string, any> = new Map();

  constructor() {
    super(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('message.received', this.handleCustomerMessage.bind(this));
    this.on('agent.started', this.initializeService.bind(this));
  }

  private async initializeService(): Promise<void> {
    console.log('🎯 客户服务Agent已启动');
    console.log('💬 准备接受客户咨询...');
  }

  protected async handleCustomerMessage(message: Message): Promise<void> {
    const customerId = this.getCustomerId(message);
    
    // 获取或创建客户会话
    let session = this.customerSessions.get(customerId);
    if (!session) {
      session = {
        customerId,
        startTime: new Date(),
        messages: [],
        ticketId: null,
        status: 'active',
      };
      this.customerSessions.set(customerId, session);
    }

    // 添加消息到会话
    session.messages.push(message);

    this.updateState({ 
      status: 'thinking', 
      currentTask: `处理客户 ${customerId} 的咨询` 
    });

    try {
      // 分析客户意图
      const intent = await this.analyzeIntent(message);
      
      // 根据意图生成响应
      const response = await this.generateResponse(message, intent, session);
      
      // 发送响应
      const replyMessage: Message = {
        id: this.generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          intent,
          customerId,
          sessionId: session.customerId,
        },
      };

      session.messages.push(replyMessage);
      this.emitEvent('message.sent', { message: replyMessage });
      
      this.updateState({ status: 'idle', currentTask: undefined });
      
    } catch (error) {
      this.updateState({ status: 'error' });
      
      // 发送错误响应
      const errorMessage: Message = {
        id: this.generateId(),
        role: 'assistant',
        content: '抱歉，我遇到了一些技术问题。请稍后再试或联系人工客服。',
        timestamp: new Date(),
      };
      
      this.emitEvent('message.sent', { message: errorMessage });
    }
  }

  private async analyzeIntent(message: Message): Promise<string> {
    const content = message.content.toLowerCase();
    
    // 简单的意图识别
    if (content.includes('订单') || content.includes('购买') || content.includes('payment')) {
      return 'order_inquiry';
    }
    if (content.includes('退货') || content.includes('退款') || content.includes('return')) {
      return 'return_request';
    }
    if (content.includes('产品') || content.includes('功能') || content.includes('使用')) {
      return 'product_info';
    }
    if (content.includes('投诉') || content.includes('问题') || content.includes('错误')) {
      return 'complaint';
    }
    if (content.includes('价格') || content.includes('费用') || content.includes('成本')) {
      return 'pricing_inquiry';
    }
    
    return 'general_inquiry';
  }

  private async generateResponse(
    message: Message, 
    intent: string, 
    session: any
  ): Promise<string> {
    const customerId = session.customerId;
    
    switch (intent) {
      case 'order_inquiry':
        return await this.handleOrderInquiry(message, customerId);
      case 'return_request':
        return await this.handleReturnRequest(message, customerId, session);
      case 'product_info':
        return await this.handleProductInfo(message);
      case 'complaint':
        return await this.handleComplaint(message, customerId, session);
      case 'pricing_inquiry':
        return await this.handlePricingInquiry(message);
      default:
        return await this.handleGeneralInquiry(message, customerId);
    }
  }

  private async handleOrderInquiry(message: Message, customerId: string): Promise<string> {
    // 模拟订单查询
    const orderId = this.extractOrderId(message.content);
    
    if (orderId) {
      return `我找到了您的订单 ${orderId}。订单状态：已发货，预计3-5个工作日送达。如需更多详情，请提供订单号。`;
    }
    
    return `我可以帮您查询订单信息。请提供您的订单号，或者告诉我您想了解的具体问题。`;
  }

  private async handleReturnRequest(
    message: Message, 
    customerId: string, 
    session: any
  ): Promise<string> {
    // 创建退货工单
    const ticketId = this.generateTicketId();
    session.ticketId = ticketId;
    
    return `我已为您创建退货工单 #${ticketId}。我们的退货团队将在24小时内联系您处理。请准备好购买凭证和商品照片。`;
  }

  private async handleProductInfo(message: Message): Promise<string> {
    return `关于产品信息，我可以帮您了解：\n• 产品功能和特性\n• 使用方法和技巧\n• 技术规格\n• 兼容性信息\n\n请告诉我您想了解的具体产品或问题。`;
  }

  private async handleComplaint(
    message: Message, 
    customerId: string, 
    session: any
  ): Promise<string> {
    // 创建投诉工单
    const ticketId = this.generateTicketId();
    session.ticketId = ticketId;
    
    return `很抱歉给您带来了不好的体验。我已将您的问题记录为工单 #${ticketId}，优先级为高。我们的客服主管将在1小时内联系您。`;
  }

  private async handlePricingInquiry(message: Message): Promise<string> {
    return `关于价格信息，我可以提供：\n• 当前产品价格\n• 促销活动信息\n• 批量采购折扣\n• 会员优惠\n\n请告诉我您想了解哪个产品的价格信息。`;
  }

  private async handleGeneralInquiry(message: Message, customerId: string): Promise<string> {
    const response = `
感谢您的咨询！我是您的专属客服助手。

我可以帮助您：
📦 订单查询和管理
🔄 退货和退款处理
📱 产品使用指导
💰 价格和优惠信息
⚠️ 问题投诉和反馈

请告诉我您需要什么帮助，我会尽力为您提供满意的解答。
    `.trim();
    
    return response;
  }

  private getCustomerId(message: Message): string {
    // 从消息元数据或内容中提取客户ID
    return message.metadata?.customerId || 'guest_' + Date.now();
  }

  private extractOrderId(content: string): string | null {
    const match = content.match(/(?:订单号|order|#)(?:[:：]?\s*)?([A-Z0-9]+)/i);
    return match ? match[1] : null;
  }

  private generateTicketId(): number {
    return ++this.ticketId;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // 公共API方法
  public getSession(customerId: string): any {
    return this.customerSessions.get(customerId);
  }

  public getActiveSessionCount(): number {
    return Array.from(this.customerSessions.values())
      .filter(session => session.status === 'active').length;
  }

  public getTicketCount(): number {
    return Array.from(this.customerSessions.values())
      .filter(session => session.ticketId !== null).length;
  }

  public async closeSession(customerId: string): Promise<void> {
    const session = this.customerSessions.get(customerId);
    if (session) {
      session.status = 'closed';
      session.endTime = new Date();
      
      // 发送结束消息
      const endMessage: Message = {
        id: this.generateId(),
        role: 'assistant',
        content: '感谢您的咨询，希望我们的服务对您有帮助。如有其他问题，欢迎随时联系我们！',
        timestamp: new Date(),
      };
      
      this.emitEvent('message.sent', { message: endMessage });
    }
  }
}

// 导出Agent实例
export const customerServiceAgent = new CustomerServiceAgent();
