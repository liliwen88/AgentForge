'use client';

import { useState } from 'react';
import { ChatInterface } from '@agentforge/components';
import { useAgentStore } from '@/store/agent';

export default function Home() {
  const { currentAgent, messages, sendMessage, clearHistory } = useAgentStore();
  const [isConnected] = useState(true);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">AgentForge</h1>
        {currentAgent ? (
          <div className="w-full h-[600px]">
            <ChatInterface
              agent={{
                id: currentAgent.id,
                name: currentAgent.config.name,
                description: currentAgent.config.description,
              }}
              messages={messages}
              onSendMessage={sendMessage}
              onClearHistory={clearHistory}
              disabled={!isConnected}
            />
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              暂无活跃的 Agent
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              请在设置页面创建一个新的 Agent
            </p>
          </div>
        )}
      </div>
    </main>
  );
}