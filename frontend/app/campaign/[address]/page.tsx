'use client';

import { use, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCampaign } from '@/hooks/useCampaign';
import { FundForm } from '@/components/forms/FundForm';
import ResolutionActions from '@/components/campaign/ResolutionActions';
import { OracleController } from '@/components/debug/OracleController';

/* ==========================================
   DESIGN SYSTEM: ICONS
   Hand-crafted, stroke-based SVGs for high-DPI clarity.
   ========================================== */
const Icons = {
  Copy: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  ),
  Alert: ({ className }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Refresh: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 4v6h-6"></path>
      <path d="M1 20v-6h6"></path>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  ),
  User: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Target: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  ),
  Calendar: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Activity: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
};

/* ==========================================
   ANIMATION ORCHESTRATION
   Smooth, spring-based physics for Linear-like feel.
   ========================================== */
const anim = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 50, damping: 20 },
    },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.98,
  },
};

/* ==========================================
   MICRO-COMPONENTS
   ========================================== */

// 1. Tooltip Component - Context-aware helper
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-md shadow-xl z-50"
          >
            <span className="text-[10px] font-medium text-zinc-200 whitespace-nowrap">{text}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 2. Copyable Address - Interactive hash display
const AddressPill = ({ label, address }: { label: string; address: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip text="Click to copy address">
      <motion.button
        onClick={handleCopy}
        whileHover="hover"
        whileTap="tap"
        variants={anim}
        className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors w-full sm:w-auto"
      >
        <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
          <Icons.User />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</span>
          <span className="font-mono text-xs text-zinc-300 group-hover:text-white transition-colors">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <div className="ml-2 text-zinc-600 group-hover:text-blue-400 transition-colors">
          {copied ? <Icons.Check /> : <Icons.Copy />}
        </div>
      </motion.button>
    </Tooltip>
  );
};

/* ==========================================
   LOADING SKELETON
   Geometry-based loading state. No spinners.
   ========================================== */
const CampaignSkeleton = () => (
  <div className="min-h-screen py-12 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-6">
      {/* Title Skeleton */}
      <div className="glass-panel h-[200px] p-8 space-y-4 animate-pulse">
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-zinc-800/50 rounded-full" />
          <div className="h-6 w-24 bg-zinc-800/50 rounded-full" />
        </div>
        <div className="h-10 w-3/4 bg-zinc-800 rounded-lg" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-40 bg-zinc-800/50 rounded-lg" />
          <div className="h-12 w-40 bg-zinc-800/50 rounded-lg" />
        </div>
      </div>
      {/* Description Skeleton */}
      <div className="glass-panel h-[300px] p-8 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded-lg mb-6" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-zinc-800/50 rounded" />
          <div className="h-4 w-full bg-zinc-800/50 rounded" />
          <div className="h-4 w-5/6 bg-zinc-800/50 rounded" />
          <div className="h-4 w-4/6 bg-zinc-800/50 rounded" />
        </div>
      </div>
    </div>
    <div className="lg:col-span-1 space-y-6">
      <div className="glass-panel h-[400px] animate-pulse" />
    </div>
  </div>
);

/* ==========================================
   ERROR STATE
   High-design error handling with recovery.
   ========================================== */
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-panel max-w-md w-full p-8 text-center border-red-500/20"
    >
      <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
        <Icons.Alert />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Data Retrieval Failed</h2>
      <p className="text-zinc-400 text-sm mb-6">{message}</p>
      <motion.button
        onClick={onRetry}
        whileHover="hover"
        whileTap="tap"
        variants={anim}
        className="btn-secondary w-full justify-center"
      >
        <Icons.Refresh className="mr-2" /> Retry Connection
      </motion.button>
    </motion.div>
  </div>
);

/* ==========================================
   MAIN PAGE COMPONENT
   ========================================== */
interface CampaignPageProps {
  params: Promise<{
    address: string;
  }>;
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { address } = use(params);
  const { campaign, isLoading, error, refetch } = useCampaign(address);

  // --- Logic: Status Determination ---
  const goalAmount = campaign ? parseFloat(campaign.goalAmount) : 0;
  const totalFunded = campaign ? parseFloat(campaign.totalFunded) : 0;
  const progressPercentage = goalAmount > 0 ? Math.min((totalFunded / goalAmount) * 100, 100) : 0;
  const isExpired = campaign ? campaign.deadline < new Date() : false;
  const canFund = campaign && !campaign.resolved && !isExpired;

  // --- Animation: Progress Bar Width ---
  const progressVariant = {
    initial: { width: 0 },
    animate: { 
      width: `${progressPercentage}%`,
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } // Custom easing
    }
  };

  // --- Render: Loading ---
  if (isLoading) return <CampaignSkeleton />;

  // --- Render: Error ---
  if (error) return <ErrorState message={error.message || 'Could not load campaign data.'} onRetry={() => window.location.reload()} />;

  // --- Render: Not Found ---
  if (!campaign) return <ErrorState message="The campaign at this address does not exist." onRetry={() => window.history.back()} />;

  // --- Formatter Helpers ---
  const formattedDeadline = campaign.deadline.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 bg-[#09090b]">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={anim.container}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: DETAILS & CONTEXT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Header Card */}
            <motion.div variants={anim.item} className="glass-panel p-8 relative overflow-hidden group">
              {/* Ambient Background Glow */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {campaign.resolved ? (
                  <span className={`badge ${campaign.outcomeYes ? 'badge-success' : 'badge-error'}`}>
                    {campaign.outcomeYes ? 'Outcome: YES' : 'Outcome: NO'}
                  </span>
                ) : isExpired ? (
                  <span className="badge badge-warning">Expired &bull; Pending Resolution</span>
                ) : (
                  <span className="badge badge-primary flex items-center gap-1">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Active Campaign
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight text-balance">
                {campaign.title}
              </h1>

              <div className="flex flex-wrap gap-4">
                <AddressPill label="Creator" address={campaign.creator} />
                <AddressPill label="Recipient" address={campaign.recipient} />
              </div>
            </motion.div>

            {/* 2. Description Card */}
            <motion.div variants={anim.item} className="glass-panel p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <Icons.Activity className="text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Campaign Brief</h2>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {campaign.description}
              </div>
            </motion.div>

            {/* 3. Progress & Stats Card */}
            <motion.div variants={anim.item} className="glass-panel p-8">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                    <Icons.Target className="text-blue-500" />
                    <h2 className="text-lg font-semibold text-white">Funding Status</h2>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-zinc-500 uppercase font-medium">Goal</div>
                    <div className="text-white font-mono font-medium">{goalAmount.toLocaleString()} USDC</div>
                 </div>
              </div>

              {/* Cyber Progress Bar */}
              <div className="relative h-6 w-full bg-zinc-900/50 rounded-full border border-white/5 overflow-hidden mb-2">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  variants={progressVariant}
                  initial="initial"
                  animate="animate"
                />
                {/* Progress Pattern Overlay */}
                <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDNoMXYxHDF6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] pointer-events-none" />
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 font-mono">
                  <strong className="text-white">{totalFunded.toLocaleString()}</strong> USDC Raised
                </span>
                <span className="text-blue-400 font-mono">{progressPercentage.toFixed(1)}%</span>
              </div>
            </motion.div>

            {/* 4. Oracle Condition Technical Data */}
            <motion.div variants={anim.item} className="glass-panel-subtle p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Oracle Configuration</h3>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-white/5 flex items-start justify-between gap-4 group hover:border-white/10 transition-colors">
                 <code className="text-xs text-zinc-500 font-mono break-all leading-relaxed">
                   {campaign.conditionId}
                 </code>
                 <Tooltip text="Copy Condition ID">
                   <button 
                     className="text-zinc-600 hover:text-white transition-colors"
                     onClick={() => navigator.clipboard.writeText(campaign.conditionId)}
                   >
                     <Icons.Copy />
                   </button>
                 </Tooltip>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: ACTIONS (STICKY) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-6 space-y-6">
              
              {/* 1. Action Module */}
              <motion.div variants={anim.item} className="glass-panel p-1 overflow-hidden">
                 <div className="p-6 bg-zinc-900/50 rounded-[calc(var(--radius-xl)-4px)]">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <div className="w-1 h-5 bg-blue-500 rounded-full" />
                      Actions
                    </h2>
                    
                    <ResolutionActions campaignAddress={address} />
                    
                    <div className="mt-6">
                      {canFund ? (
                        <FundForm campaignAddress={address} onSuccess={refetch} />
                      ) : (
                        <div className="p-4 rounded-lg bg-zinc-800/50 border border-white/5 text-center">
                           <p className="text-sm text-zinc-400">
                             {campaign.resolved ? 'Campaign resolved. Funding closed.' : 'Deadline passed. Awaiting resolution.'}
                           </p>
                        </div>
                      )}
                    </div>
                 </div>
              </motion.div>

              {/* 2. Status Module */}
              <motion.div variants={anim.item} className="glass-panel p-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                  Timeline & Status
                </h3>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Icons.Calendar /> Deadline
                      </div>
                      <div className="text-sm text-white font-mono">{formattedDeadline}</div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Icons.Activity /> State
                      </div>
                      <div className={`text-sm font-medium ${campaign.resolved ? 'text-zinc-300' : 'text-blue-400'}`}>
                        {campaign.resolved ? 'Finalized' : 'Live'}
                      </div>
                   </div>

                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                         <Icons.Target /> Outcome
                      </div>
                      <div className="text-sm text-white">
                         {campaign.resolved ? (campaign.outcomeYes ? 'YES' : 'NO') : 'Pending'}
                      </div>
                   </div>
                </div>
              </motion.div>

              {/* 3. Debug Controller */}
              <motion.div variants={anim.item} className="opacity-50 hover:opacity-100 transition-opacity">
                 <OracleController conditionId={campaign.conditionId} campaignAddress={address} />
              </motion.div>

            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}