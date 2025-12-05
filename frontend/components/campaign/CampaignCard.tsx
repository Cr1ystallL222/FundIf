// components/campaign/CampaignCard.tsx
'use client';

import Link from 'next/link';
import { useReadContracts } from 'wagmi';
import { formatUnits, type Address } from 'viem';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { getCampaignImage } from '@/lib/constants/campaign-images';
import { CreatorBadge } from '@/components/ui/CreatorBadge';

// Ensure ABI includes marketSlug
const CampaignABI = [
  {
    type: 'function',
    name: 'title',
    inputs: [],
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'description',
    inputs: [],
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'goalAmount',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalFunded',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deadline',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'recipient',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'resolved',
    inputs: [],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'conditionId',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'marketSlug',
    inputs: [],
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
] as const;

interface CampaignCardProps {
  campaignAddress: string;
}

// --- 1. Visual Components ---

const Icons = {
  Target: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
  ),
  Polymarket: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const width = 120;
  const height = 40;
  const max = 100;
  const min = 0;
  
  if (data.length < 2) return null;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${points} L ${width},${height} L 0,${height} Z`} fill={`url(#gradient-${color})`} className={color} />
      <path d={`M ${points}`} fill="none" stroke="currentColor" strokeWidth="2" className={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const SkeletonCard = () => (
  <div className="w-full h-[550px] bg-[#09090b] rounded-2xl border border-white/5 animate-pulse relative overflow-hidden flex flex-col">
    <div className="h-40 bg-white/5" />
    <div className="p-5 flex-1 flex flex-col">
      <div className="h-6 w-3/4 bg-white/5 rounded mb-4" />
      <div className="h-10 w-full bg-white/5 rounded mb-4" />
      <div className="h-6 w-1/3 bg-white/5 rounded mb-6" />
      <div className="h-10 w-full bg-white/5 rounded mb-8" />
      <div className="mt-auto space-y-2 mb-6">
        <div className="flex justify-between">
          <div className="h-4 w-1/4 bg-white/5 rounded" />
          <div className="h-4 w-1/4 bg-white/5 rounded" />
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full" />
      </div>
      <div className="h-12 w-full bg-white/5 rounded border-t border-white/5 pt-4" />
    </div>
  </div>
);

export default function CampaignCard({ campaignAddress }: CampaignCardProps) {
  // --- A. Contract Data ---
  const campaignContract = {
    address: campaignAddress as Address,
    abi: CampaignABI,
  } as const;

  const { data: contractData, isLoading: isContractLoading } = useReadContracts({
    contracts: [
      { ...campaignContract, functionName: 'title' },
      { ...campaignContract, functionName: 'description' },
      { ...campaignContract, functionName: 'goalAmount' },
      { ...campaignContract, functionName: 'totalFunded' },
      { ...campaignContract, functionName: 'deadline' },
      { ...campaignContract, functionName: 'recipient' },
      { ...campaignContract, functionName: 'resolved' },
      { ...campaignContract, functionName: 'conditionId' },
      { ...campaignContract, functionName: 'marketSlug' },
    ],
  });

  const title = contractData?.[0].result as string;
  const description = contractData?.[1].result as string;
  const goalAmount = contractData?.[2].result as bigint;
  const totalFunded = contractData?.[3].result as bigint;
  const deadline = contractData?.[4].result as bigint;
  const recipient = contractData?.[5].result as Address;
  const resolved = contractData?.[6].result as boolean;
  const conditionId = contractData?.[7].result as `0x${string}` | undefined;
  const contractSlug = contractData?.[8].result as string | undefined;

  // --- B. Polymarket Data State ---
  const [marketData, setMarketData] = useState<{
    question: string;
    probability: number;
    found: boolean;
    slug: string;
  } | null>(null);
  
  const [isMarketLoading, setIsMarketLoading] = useState(false);

  // --- C. Fetch Polymarket Data ---
    // --- C. Fetch Polymarket Data ---
  useEffect(() => {
    const fetchMarket = async () => {
      const ZERO_CONDITION_ID = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const isValidConditionId = conditionId && conditionId !== ZERO_CONDITION_ID && conditionId !== '0x';
      
      if (!isValidConditionId && !contractSlug) {
        setMarketData({ question: "", probability: 0, found: false, slug: "" });
        return;
      }

      setIsMarketLoading(true);
      try {
        let targetMarket = null;
        let foundSlug = contractSlug || "";

        // STRATEGY 1: Fetch via Market Slug (Using local API Proxy)
        if (contractSlug && contractSlug.trim()) {
          try {
            // CHANGE: Point to your local API
            const response = await fetch(`/api/markets?slug=${contractSlug.trim()}`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.question) {
                targetMarket = data;
                if (data.slug) foundSlug = data.slug;
              }
            }
          } catch (e) {
            console.warn("Failed to fetch by slug, falling back to ID", e);
          }
        }

        // STRATEGY 2: Fallback to Condition IDs (Using local API Proxy)
        if (!targetMarket && isValidConditionId) {
          try {
            const conditionIdWithoutPrefix = conditionId!.startsWith('0x') 
              ? conditionId!.slice(2).toLowerCase()
              : conditionId!.toLowerCase();
            
            // CHANGE: Point to your local API
            const response = await fetch(`/api/markets?condition_id=${conditionIdWithoutPrefix}`);
            
            if (response.ok) {
              const data = await response.json();
              // Handling Array vs Object return types
              if (Array.isArray(data) && data.length > 0) {
                targetMarket = data[0];
                if (targetMarket.slug) foundSlug = targetMarket.slug;
              } else if (data && !Array.isArray(data) && data.question) {
                targetMarket = data;
                if (data.slug) foundSlug = data.slug;
              }
            }
          } catch (e) {
            console.error("Error fetching by condition ID:", e);
          }
        }

        if (targetMarket) {
          let yesPrice = 0;
          try {
            const rawPrices = targetMarket.outcomePrices;
            let outcomePrices: unknown[] = [];
            
            if (rawPrices) {
              if (typeof rawPrices === 'string') {
                try {
                  outcomePrices = JSON.parse(rawPrices);
                } catch {
                  outcomePrices = rawPrices.split(',').map(p => p.trim().replace(/[\[\]"]/g, ''));
                }
              } else if (Array.isArray(rawPrices)) {
                outcomePrices = rawPrices;
              }
            }

            if (Array.isArray(outcomePrices) && outcomePrices.length > 0) {
              const firstPrice = outcomePrices[0];
              yesPrice = typeof firstPrice === 'string' 
                ? parseFloat(firstPrice.replace(/[^\d.]/g, '')) 
                : Number(firstPrice);
              
              if (isNaN(yesPrice) || yesPrice < 0 || yesPrice > 1) {
                yesPrice = 0;
              }
            } 
          } catch (e) {
            console.error("[CampaignCard] Error parsing prices:", e);
          }

          setMarketData({
            question: targetMarket.question || "Market question unavailable",
            probability: Math.round(yesPrice * 100),
            found: true,
            slug: foundSlug
          });
        } else {
          setMarketData({ question: "Market data unavailable", probability: 0, found: false, slug: "" });
        }
      } catch (err) {
        console.error("Failed to fetch Polymarket data:", err);
        setMarketData({ question: "", probability: 0, found: false, slug: "" });
      } finally {
        setIsMarketLoading(false);
      }
    };

    fetchMarket();
  }, [contractSlug, conditionId]);

  // --- D. Derived Values ---
  const hasMarket = marketData?.found;
  const realProbability = hasMarket ? marketData!.probability : 0;
  const linkSlug = marketData?.slug || contractSlug;

  // Chart Generation
  const chartData = useMemo(() => {
    if (!hasMarket) return [];
    const points = [];
    const steps = 15;
    const volatility = 10;
    let current = realProbability + (Math.random() > 0.5 ? -10 : 10);
    
    for (let i = 0; i < steps; i++) {
      const progress = i / (steps - 1);
      const noise = (Math.random() - 0.5) * volatility * (1 - progress); 
      current = (current * (1 - progress)) + (realProbability * progress) + noise;
      points.push(Math.max(0, Math.min(100, current)));
    }
    points[points.length - 1] = realProbability;
    return points;
  }, [realProbability, hasMarket]);

  const progressPercent = goalAmount 
    ? Math.min((Number(totalFunded) / Number(goalAmount)) * 100, 100) 
    : 0;
  
  const isExpired = deadline ? Number(deadline) * 1000 < Date.now() : false;
  const imageUrl = getCampaignImage(campaignAddress);

  const formatMoney = (val: bigint) => 
    `$${Number(formatUnits(val || 0n, 6)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const getProbColor = (p: number) => {
    if (p >= 70) return "text-emerald-400";
    if (p >= 40) return "text-yellow-400";
    return "text-red-500";
  };
  const probColor = getProbColor(realProbability);

  let statusLabel = "Live";
  let statusStyles = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
  
  if (resolved) {
    statusLabel = "Resolved";
    statusStyles = "bg-blue-500/20 text-blue-300 border-blue-500/50";
  } else if (isExpired) {
    statusLabel = "Ended";
    statusStyles = "bg-zinc-500/20 text-zinc-300 border-zinc-500/50";
  } else if (progressPercent >= 100) {
    statusLabel = "Funded";
    statusStyles = "bg-purple-500/20 text-purple-300 border-purple-500/50";
  }

  if (isContractLoading || !contractData) return <SkeletonCard />;

  return (
    <Link href={`/campaign/${campaignAddress}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative w-full h-full bg-[#09090b] rounded-2xl border border-white/5 hover:border-white/20 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl transition-colors"
      >
        <div className="relative h-40 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent z-10" />
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
          />
          <div className="absolute top-3 left-3 z-20">
            <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusStyles}`}>
              {statusLabel}
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col bg-[#0c0c0e] -mt-2 relative z-20">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors mb-2">
              {title}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-3">
              {description}
            </p>
            
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Recipient:</span>
              <CreatorBadge address={recipient} />
            </div>

            {/* Prediction Market Link */}
            <div 
              className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm group/pill hover:bg-white/10 transition-colors cursor-pointer"
              onClick={(e) => {
                if (hasMarket && linkSlug) {
                  e.preventDefault(); // Only prevent if we actually have a link
                  e.stopPropagation();
                  window.open(`https://polymarket.com/event/${linkSlug}`, '_blank');
                }
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Icons.Polymarket className={`w-3.5 h-3.5 flex-shrink-0 ${isMarketLoading ? 'text-zinc-500 animate-pulse' : 'text-blue-500'}`} />
                <span className="text-xs font-medium text-zinc-200 truncate">
                  <span className="text-zinc-500 mr-1">If:</span>
                  {isMarketLoading ? "Syncing market..." : (hasMarket ? marketData?.question : "Prediction Market")}
                </span>
              </div>
              
              {hasMarket && linkSlug && (
                <div className="text-zinc-500 hover:text-blue-400 transition-colors flex-shrink-0" title="View on Polymarket">
                  <Icons.ExternalLink className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto mb-6 pt-2">
            <div className="flex justify-between items-end mb-2">
               <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Raised</span>
                 <span className="text-white text-xl font-bold tracking-tight">
                   {formatMoney(totalFunded)}
                 </span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Goal</span>
                  <span className="text-zinc-400 text-sm font-mono">
                    {formatMoney(goalAmount)}
                  </span>
               </div>
            </div>
            
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-0.5">Probability</span>
                {isMarketLoading ? (
                  <span className="text-sm text-zinc-500 animate-pulse">Loading...</span>
                ) : hasMarket ? (
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black tracking-tight ${probColor} drop-shadow-lg`}>
                      {realProbability}%
                    </span>
                    <span className="text-xs font-bold text-zinc-600">YES</span>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-600 italic">No market data</span>
                )}
              </div>

              {hasMarket && (
                <div className="h-12 w-28 pb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Sparkline data={chartData} color={probColor} />
                </div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </Link>
  );
}