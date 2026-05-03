import { customerServiceAgent } from './agents/customer-service-agent.js';

/**
 * AgentForge客户服务Agent示例
 * 
 * 这个示例展示了如何使用AgentForge创建一个完整的
 * 客户服务智能助手。
 */

async function main() {
  console.log('🚀 启动AgentForge客户服务示例');
  console.log('=' .repeat(50));

  try {
    // 启动Agent
    await customerServiceAgent.start();
    
    // 模拟客户咨询
    await simulateCustomerInteractions();
    
    // 显示统计信息
    showStatistics();
    
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

async function simulateCustomerInteractions() {
  console.log('\n📞 模拟客户咨询...\n');

  // 模拟多个客户咨询
  const interactions = [
    {
      customerId: 'customer_001',
      message: '你好，我想查询我的订单状态',
      role: 'user' as const,
    },
    {
      customerId: 'customer_002', 
      message: '我要退货，订单号是ORD123456',
      role: 'user' as const,
    },
    {
      customerId: 'customer_003',
      message: '你们的产品有什么功能？',
      role: 'user' as const,
    },
    {
      customerId: 'customer_001',
      message: '我的订单号是ORD789012',
      role: 'user' as const,
    },
    {
      customerId: 'customer_004',
      message: '我对你们的服务很不满，要投诉',
      role: 'user' as const,
    },
  ];

  for (const interaction of interactions) {
    console.log(`👤 客户 ${interaction.customerId}: ${interaction.message}`);
    
    // 发送消息给Agent
    await customerServiceAgent.sendMessage({
      ...interaction,
      metadata: { customerId: interaction.customerId },
    });
    
    // 等待一段时间模拟真实对话
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

function showStatistics() {
  console.log('\n📊 服务统计');
  console.log('=' .repeat(30));
  console.log(`活跃会话数: ${customerServiceAgent.getActiveSessionCount()}`);
  console.log(`创建工单数: ${customerServiceAgent.getTicketCount()}`);
  
  // 显示会话详情
  const sessions = [
    customerServiceAgent.getSession('customer_001'),
    customerServiceAgent.getSession('customer_002'),
    customerServiceAgent.getSession('customer_003'),
    customerServiceAgent.getSession('customer_004'),
  ];

  console.log('\n会话详情:');
  sessions.forEach((session, index) => {
    if (session) {
      console.log(`${index + 1}. 客户 ${session.customerId}`);
      console.log(`   消息数: ${session.messages.length}`);
      console.log(`   状态: ${session.status}`);
      if (session.ticketId) {
        console.log(`   工单号: #${session.ticketId}`);
      }
    }
  });
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🛑 正在关闭客户服务...');
  await customerServiceAgent.stop();
  console.log('✅ 已关闭');
  process.exit(0);
});

// 启动应用
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
