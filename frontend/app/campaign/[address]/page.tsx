'use client';

import { use, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCampaign } from '@/hooks/useCampaign';
import { FundForm } from '@/components/forms/FundForm';
import ResolutionActions from '@/components/campaign/ResolutionActions';
import { OracleController } from '@/components/debug/OracleController';
import { getCampaignImage } from '@/lib/constants/campaign-images';
import { CreatorBadge } from '@/components/ui/CreatorBadge';

/* ==========================================
   ICONS
   ========================================== */
const Icons = {
  Activity: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  Target: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  ),
  Copy: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
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
  TrendingUp: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
};

// Animation Variants
const anim: Record<string, Variants> = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', stiffness: 50, damping: 20 },
    },
  },
};

// Components
const CampaignSkeleton = () => <div className="min-h-screen bg-black animate-pulse" />;
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="text-white p-4">
    {message} <button onClick={onRetry} className="underline ml-2">Retry</button>
  </div>
);
const Tooltip = ({ text, children }: { text: string; children: ReactNode }) => (
  <div title={text}>{children}</div>
);

interface CampaignPageProps {
  params: Promise<{
    address: string;
  }>;
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { address } = use(params);
  const { campaign, isLoading, error, refetch } = useCampaign(address);

  // --- Market Probability State ---
  const [marketProb, setMarketProb] = useState<number | null>(null);
  const [isMarketLoading, setIsMarketLoading] = useState(false);

  // --- Logic ---
  const goalAmount = campaign ? parseFloat(campaign.goalAmount) : 0;
  const totalFunded = campaign ? parseFloat(campaign.totalFunded) : 0;
  const userContribution = campaign ? parseFloat(campaign.userContribution) : 0;
  
  const progressPercentage = goalAmount > 0 ? Math.min((totalFunded / goalAmount) * 100, 100) : 0;
  const isExpired = campaign ? campaign.deadline < new Date() : false;
  const canFund = campaign && !campaign.resolved && !isExpired;

  const progressVariant: Variants = {
    initial: { width: 0 },
    animate: { 
      width: `${progressPercentage}%`,
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // --- Fetch Market Data (Polymarket via Proxy) ---
  useEffect(() => {
    if (!campaign) return;

    const fetchMarket = async () => {
      // Try to get slug or ID from campaign object. 
      // Note: Ensure your useCampaign hook actually returns marketSlug, otherwise fallback to conditionId
      // @ts-ignore - Assuming marketSlug might exist on the returned object even if not strictly typed yet
      const slug = campaign.marketSlug; 
      const conditionId = campaign.conditionId;

      const ZERO_CONDITION_ID = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const isValidConditionId = conditionId && conditionId !== ZERO_CONDITION_ID && conditionId !== '0x';

      if (!isValidConditionId && !slug) return;

      setIsMarketLoading(true);
      try {
        let targetMarket = null;

        // 1. Try fetching by Slug via our Proxy
        if (slug) {
          try {
            const res = await fetch(`/api/markets?slug=${slug}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.question) targetMarket = data;
            }
          } catch (e) { console.warn("Slug fetch failed", e); }
        }

        // 2. Try fetching by Condition ID via our Proxy
        if (!targetMarket && isValidConditionId) {
          try {
            const cleanId = conditionId.startsWith('0x') ? conditionId.slice(2) : conditionId;
            const res = await fetch(`/api/markets?condition_id=${cleanId}`);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) targetMarket = data[0];
              else if (data && data.question) targetMarket = data;
            }
          } catch (e) { console.warn("ID fetch failed", e); }
        }

        // 3. Parse Probability
        if (targetMarket && targetMarket.outcomePrices) {
          let outcomePrices: any[] = [];
          const raw = targetMarket.outcomePrices;
          
          if (typeof raw === 'string') {
             try { outcomePrices = JSON.parse(raw); } 
             catch { outcomePrices = raw.split(',').map(p => p.replace(/[\[\]"]/g, '')); }
          } else if (Array.isArray(raw)) {
             outcomePrices = raw;
          }

          if (outcomePrices.length > 0) {
            const yesStr = String(outcomePrices[0]);
            const yesVal = parseFloat(yesStr);
            if (!isNaN(yesVal)) setMarketProb(Math.round(yesVal * 100));
          }
        }
      } catch (err) {
        console.error("Error fetching market logic", err);
      } finally {
        setIsMarketLoading(false);
      }
    };

    fetchMarket();
  }, [campaign]);

  const getProbColor = (p: number) => {
    if (p >= 70) return "text-emerald-400";
    if (p >= 40) return "text-yellow-400";
    return "text-red-500";
  };

  if (isLoading) return <CampaignSkeleton />;
  if (error) return <ErrorState message={error.message || 'Could not load campaign.'} onRetry={() => window.location.reload()} />;
  if (!campaign) return <ErrorState message="Campaign not found." onRetry={() => window.history.back()} />;

  const formattedDeadline = campaign.deadline.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const campaignImage = getCampaignImage(address);

  return (
    <div className="min-h-screen pb-12 bg-[#09090b]">
      {/* Hero Image Banner */}
      <div className="h-64 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent z-10" />
        <img src={campaignImage} alt="Campaign Cover" className="w-full h-full object-cover opacity-60" />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 relative z-20"
        variants={anim.container}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Header Card */}
            <motion.div variants={anim.item} className="glass-panel p-8 relative overflow-hidden">
              <div className="flex flex-wrap gap-3 mb-4">
                {campaign.resolved ? (
                  <span className={`badge ${campaign.outcomeYes ? 'badge-success' : 'badge-error'}`}>
                    {campaign.outcomeYes ? 'Outcome: YES' : 'Outcome: NO'}
                  </span>
                ) : isExpired ? (
                  <span className="badge badge-warning">Expired</span>
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

              {/* Title Row with Probability on the Right */}
              <div className="flex justify-between items-start gap-6 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight flex-1">
                  {campaign.title}
                </h1>

                {/* Probability Display */}
                {(marketProb !== null || isMarketLoading) && (
                  <div className="flex-shrink-0 flex flex-col items-end bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md min-w-[100px]">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                      <Icons.TrendingUp className="w-3 h-3" /> Probability
                    </div>
                    {isMarketLoading ? (
                      <div className="h-8 w-16 bg-white/10 animate-pulse rounded" />
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${getProbColor(marketProb || 0)}`}>
                          {marketProb}%
                        </span>
                        <span className="text-xs font-bold text-zinc-600">YES</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Verified Badges Section */}
              <div className="flex flex-wrap gap-8 p-4 bg-white/5 rounded-xl border border-white/5">
                <CreatorBadge address={campaign.creator} label="Creator" />
                <CreatorBadge address={campaign.recipient} label="Recipient" />
              </div>
            </motion.div>

            {/* 2. Description */}
            <motion.div variants={anim.item} className="glass-panel p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <Icons.Activity className="text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Campaign Brief</h2>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {campaign.description}
              </div>
            </motion.div>

            {/* 3. Stats & Personal Contribution */}
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

              {/* Progress Bar */}
              <div className="relative h-6 w-full bg-zinc-900/50 rounded-full border border-white/5 overflow-hidden mb-2">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  variants={progressVariant}
                  initial="initial"
                  animate="animate"
                />
              </div>

              <div className="flex justify-between items-center text-sm mb-6">
                <span className="text-zinc-400 font-mono">
                  <strong className="text-white">{totalFunded.toLocaleString()}</strong> USDC Raised
                </span>
                <span className="text-blue-400 font-mono">{progressPercentage.toFixed(1)}%</span>
              </div>

              {/* Personal Contribution Card */}
              {userContribution > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                      <Icons.Target className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">You Backed This</div>
                      <div className="text-zinc-400 text-xs">Funds locked in escrow</div>
                    </div>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {userContribution.toLocaleString()} <span className="text-sm text-zinc-500">USDC</span>
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* 4. Oracle Technical */}
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

          {/* RIGHT COLUMN: ACTIONS */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-6 space-y-6">
              
              <motion.div variants={anim.item} className="glass-panel p-1 overflow-hidden">
                 <div className="p-6 bg-zinc-900/50 rounded-[calc(var(--radius-xl)-4px)]">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <div className="w-1 h-5 bg-blue-500 rounded-full" />
                      Actions
                    </h2>
                    
                    <ResolutionActions campaignAddress={address} />
                    
                    <div className="mt-6">
                      {canFund ? (
                        <FundForm 
                          campaignAddress={address} 
                          onSuccess={refetch}
                        />
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

              {/* Status Timeline */}
              <motion.div variants={anim.item} className="glass-panel p-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                  Timeline
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Icons.Calendar /> Deadline
                      </div>
                      <div className="text-sm text-white font-mono">{formattedDeadline}</div>
                   </div>
                </div>
              </motion.div>

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