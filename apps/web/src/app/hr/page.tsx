'use client';

import Link from 'next/link';

export default function HRPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-foreground">AgentForge</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/inventory" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                Inventory
              </Link>
              <Link href="/hr" className="text-sm font-medium text-primary">
                HR Platform
              </Link>
              <Link href="/projects" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                Projects
              </Link>
              <Link href="/settings" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                Settings
              </Link>
            </div>

            <Link href="/settings" className="btn-outline btn-sm">
              Configure
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span>HR Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            HR Platform
          </h1>
          <p className="text-foreground-secondary">
            Manage employees, recruitment, and HR operations efficiently
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          {[
            { label: 'Total Employees', value: '486', change: '+8%', positive: true },
            { label: 'Open Positions', value: '24', change: '+3', positive: true },
            { label: 'On Leave', value: '12', change: '-2', positive: true },
            { label: 'New Hires (MTD)', value: '18', change: '+25%', positive: true },
          ].map((stat, index) => (
            <div key={index} className="card p-5">
              <p className="text-sm text-foreground-muted mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive 
                    ? 'bg-success/10 text-success' 
                    : 'bg-error/10 text-error'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Employee Directory',
              description: 'Browse and manage employee records',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
            },
            {
              title: 'Recruitment',
              description: 'Manage job postings and applications',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              title: 'Payroll',
              description: 'Process salaries and benefits',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ].map((action, index) => (
            <button
              key={index}
              className="card card-hover p-6 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">{action.title}</h3>
              <p className="text-sm text-foreground-secondary">{action.description}</p>
            </button>
          ))}
        </div>

        {/* Placeholder Content */}
        <div className="card card-elevated p-12 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            HR Platform Module Coming Soon
          </h3>
          <p className="text-foreground-secondary max-w-md mx-auto">
            This demo page showcases the layout structure. Full HR management features will be implemented here.
          </p>
        </div>
      </section>
    </main>
  );
}
