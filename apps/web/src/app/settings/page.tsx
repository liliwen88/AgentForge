'use client';

import { useState } from 'react';
import { useAgentStore } from '@/store/agent';

export default function SettingsPage() {
  const { setCurrentAgent } = useAgentStore();
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAgent = async () => {
    if (!agentName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          description: agentDescription,
          model,
          temperature: 0.7,
          tools: [],
        }),
      });

      const data = await response.json();
      setCurrentAgent({
        id: data.id,
        config: data.config,
      });
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Agent 设置</h1>

      <div className="max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Agent 名称</label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="输入 Agent 名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">描述</label>
          <textarea
            value={agentDescription}
            onChange={(e) => setAgentDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="描述 Agent 的功能"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">模型</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          </select>
        </div>

        <button
          onClick={handleCreateAgent}
          disabled={!agentName.trim() || isCreating}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {isCreating ? '创建中...' : '创建 Agent'}
        </button>
      </div>
    </div>
  );
}