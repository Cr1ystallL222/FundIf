// app/explore/page.tsx

import { Search, Filter, TrendingUp } from 'lucide-react';

export default function Explore() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="heading-hero text-text-main mb-4">
          Explore Campaigns
        </h1>
        <p className="text-text-muted text-lg max-w-2xl">
          Discover prediction-gated crowdfunding campaigns and support the future you believe in.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="input-field pl-12"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface text-text-main rounded-box border border-border hover:bg-white/5 transition-colors font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="glass-panel p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-full flex items-center justify-center border border-secondary/30">
          <TrendingUp className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">
          No Campaigns Yet
        </h2>
        <p className="text-text-muted mb-6 max-w-md mx-auto">
          Be the first to create a prediction-gated crowdfunding campaign on FundIf.
        </p>
        <a href="/create" className="btn-primary inline-flex">
          Create First Campaign
        </a>
      </div>

      {/* Campaign Grid Placeholder */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards for future campaigns */}
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="glass-panel p-6 opacity-50 animate-pulse"
          >
            <div className="h-4 bg-border rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-border rounded w-full mb-2"></div>
            <div className="h-3 bg-border rounded w-2/3 mb-6"></div>
            <div className="flex justify-between items-center">
              <div className="h-8 bg-border rounded w-24"></div>
              <div className="h-8 bg-border rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}