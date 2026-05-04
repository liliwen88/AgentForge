'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChatInterface } from '@agentforge/components';
import { useAgentStore } from '@/store/agent';

export default function Home() {
  const { currentAgent, messages, sendMessage, clearHistory } = useAgentStore();
  const [isConnected] = useState(true);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-foreground">AgentForge</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/inventory" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                Inventory
              </Link>
              <Link href="/hr" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                HR Platform
              </Link>
              <Link href="/projects" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                Projects
              </Link>
              <Link href="/settings" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                Settings
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/settings"
                className="btn-outline btn-sm"
              >
                Configure
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {!currentAgent && (
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 gradient-hero opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                <span className="text-sm font-medium text-primary">AI-Powered Development</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
                Build Business Apps{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Like Lego Blocks
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-foreground-secondary max-w-3xl mx-auto mb-10 text-pretty">
                AgentForge is a TypeScript full-stack + AI scaffolding framework designed for business development. 
                Rapidly build enterprise products with AI collaboration.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/settings"
                  className="btn-primary btn-lg w-full sm:w-auto"
                >
                  Get Started
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link 
                  href="#features"
                  className="btn-outline btn-lg w-full sm:w-auto"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Feature Cards */}
            <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: 'AI-Native',
                  description: 'Built-in AI agent framework with tool calling and memory management',
                  color: 'from-primary to-primary-hover',
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  ),
                  title: 'Modular Design',
                  description: 'Component-based architecture for easy extension and customization',
                  color: 'from-secondary to-secondary-hover',
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'Enterprise Ready',
                  description: 'Type-safe, tested, and production-ready scaffolding',
                  color: 'from-accent to-accent-hover',
                },
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="card card-hover p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chat Interface */}
      {currentAgent && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-scale-in">
          <div className="h-[700px]">
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
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-background mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="text-sm font-medium text-foreground-muted">
                AgentForge - Business Development Framework
              </span>
            </div>
            <p className="text-sm text-foreground-muted">
              Built with Next.js, TypeScript, and AI
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
