import React, { useState, useRef, useEffect } from 'react';
import { type ChatInterfaceProps } from '../types';
import { cn, formatTime } from '../utils';
import { Button } from './Button';
import { Input } from './Input';
import { Spinner } from './Spinner';

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
      
      // Simulate agent response
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
        return 'bg-primary text-primary-foreground';
      case 'assistant':
        return 'bg-background-muted text-foreground border border-border';
      case 'system':
        return 'bg-warning/10 text-warning border border-warning/20';
      case 'tool':
        return 'bg-success/10 text-success border border-success/20';
      default:
        return 'bg-background-muted text-foreground border border-border';
    }
  };

  const getMessageRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return 'You';
      case 'assistant':
        return 'Assistant';
      case 'system':
        return 'System';
      case 'tool':
        return 'Tool';
      default:
        return role;
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-card rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">{agent.name}</h3>
            <p className="text-xs text-foreground-muted mt-0.5">{agent.description}</p>
          </div>
        </div>
        {onClearHistory && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            disabled={disabled}
            className="shrink-0"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-gradient-to-b from-background to-background-secondary">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg 
                className="w-8 h-8 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </div>
            <p className="text-foreground-secondary font-medium">Start chatting with {agent.name}</p>
            <p className="text-sm text-foreground-muted mt-1">Type a message to begin the conversation</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex flex-col animate-slide-up',
              message.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1.5 px-1">
              <span className="font-medium">{getMessageRoleLabel(message.role)}</span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
                getMessageRoleColor(message.role),
                message.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              {message.metadata && Object.keys(message.metadata).length > 0 && (
                <details className="mt-2 text-xs opacity-75 cursor-pointer">
                  <summary className="font-medium">Metadata</summary>
                  <pre className="mt-2 p-2 bg-black/10 rounded text-xs overflow-x-auto">
                    {JSON.stringify(message.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-foreground-muted px-1 animate-pulse">
            <Spinner size="sm" />
            <span className="text-sm">{agent.name} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={disabled || !inputValue.trim()}
            loading={isTyping}
            className="shrink-0"
          >
            Send
          </Button>
        </form>
        <p className="text-xs text-foreground-muted mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};
