'use client';

import Link from 'next/link';

export default function ProjectsPage() {
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
              <Link href="/hr" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
                HR Platform
              </Link>
              <Link href="/projects" className="text-sm font-medium text-primary">
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
            <span>Project Management</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Project Management
              </h1>
              <p className="text-foreground-secondary">
                Track projects, tasks, and team collaboration
              </p>
            </div>
            <button className="btn-primary self-start">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          {[
            { label: 'Active Projects', value: '12', change: '+2', positive: true },
            { label: 'Completed (MTD)', value: '8', change: '+3', positive: true },
            { label: 'Pending Tasks', value: '156', change: '-12%', positive: true },
            { label: 'Team Members', value: '48', change: '+5', positive: true },
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

        {/* Project Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { status: 'In Progress', count: 8, color: 'from-primary to-primary-hover', bgColor: 'bg-primary/10' },
            { status: 'On Hold', count: 3, color: 'from-warning to-warning-hover', bgColor: 'bg-warning/10' },
            { status: 'Completed', count: 24, color: 'from-success to-success-hover', bgColor: 'bg-success/10' },
          ].map((item, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                  <span className={`text-lg font-bold bg-gradient-to-br ${item.color} bg-clip-text text-transparent`}>
                    {item.count}
                  </span>
                </div>
                <span className="badge badge-muted">{item.status}</span>
              </div>
              <p className="text-sm text-foreground-muted">Projects {item.status.toLowerCase()}</p>
            </div>
          ))}
        </div>

        {/* Placeholder Content */}
        <div className="card card-elevated p-12 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Project Management Module Coming Soon
          </h3>
          <p className="text-foreground-secondary max-w-md mx-auto">
            This demo page showcases the layout structure. Full project management features including Kanban boards, Gantt charts, and task tracking will be implemented here.
          </p>
        </div>
      </section>
    </main>
  );
}
