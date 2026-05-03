import React, { useState, useRef, useEffect } from 'react';
import { type ChatInterfaceProps, type ChatMessage } from '../types/index.js';
import { cn, formatTime } from '../utils/index.js';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Spinner } from './Spinner.js';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  agent,
  messages,
  onSendMessage,
  onClearHistory,
  placeholder = '输入消息...',
  disabled = false,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setIsTyping(true);
      
      // 模拟Agent回复
      setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getMessageRoleColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-500 text-white';
      case 'assistant':
        return 'bg-gray-100 text-gray-900';
      case 'system':
        return 'bg-yellow-100 text-yellow-900';
      case 'tool':
        return 'bg-green-100 text-green-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getMessageRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return '用户';
      case 'assistant':
        return '助手';
      case 'system':
        return '系统';
      case 'tool':
        return '工具';
      default:
        return role;
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white border rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.description}</p>
          </div>
        </div>
        {onClearHistory && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            disabled={disabled}
          >
            清空历史
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>开始与 {agent.name} 对话</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex flex-col space-y-1',
              message.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{getMessageRoleLabel(message.role)}</span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2',
                getMessageRoleColor(message.role)
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.metadata && Object.keys(message.metadata).length > 0 && (
                <div className="mt-2 text-xs opacity-75">
                  <pre>{JSON.stringify(message.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Spinner size="sm" />
            <span className="text-sm">助手正在输入...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <Button type="submit" disabled={disabled || !inputValue.trim()}>
            发送
          </Button>
        </form>
      </div>
    </div>
  );
};
