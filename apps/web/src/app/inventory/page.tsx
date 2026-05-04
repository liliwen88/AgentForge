'use client';

import Link from 'next/link';

export default function InventoryPage() {
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
              <Link href="/inventory" className="text-sm font-medium text-primary">
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
            <span>Inventory Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Inventory Management
          </h1>
          <p className="text-foreground-secondary">
            Track and manage your product inventory with real-time updates
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          {[
            { label: 'Total Products', value: '1,234', change: '+12%', positive: true },
            { label: 'Low Stock Items', value: '23', change: '-5%', positive: true },
            { label: 'Out of Stock', value: '8', change: '+2%', positive: false },
            { label: 'Total Value', value: '$45.2K', change: '+18%', positive: true },
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

        {/* Placeholder Content */}
        <div className="card card-elevated p-12 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Inventory Module Coming Soon
          </h3>
          <p className="text-foreground-secondary max-w-md mx-auto">
            This demo page showcases the layout structure. Full inventory management features will be implemented here.
          </p>
        </div>
      </section>
    </main>
  );
}
