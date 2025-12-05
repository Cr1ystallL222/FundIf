'use client';

import Link from 'next/link';
import { useReadContracts } from 'wagmi';
import { formatUnits, type Address } from 'viem';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { CampaignABI } from '@/lib/contracts/abis';
import { getCampaignImage } from '@/lib/constants/campaign-images';
import { CreatorBadge } from '@/components/ui/CreatorBadge';
import { type CleanMarket, type MarketsApiResponse } from '@/app/api/markets/route';

interface CampaignCardProps {
  campaignAddress: string;
}

// --- 1. Visual Components (Icons & Graph) ---

const Icons = {
  Target: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
  ),
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const width = 120;
  const height = 40;
  const max = 100;
  const min = 0;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={`M ${points}`} fill="none" stroke="currentColor" strokeWidth="2" className={color} vectorEffect="non-scaling-stroke" />
      <path d={`M ${points} L ${width},${height} L 0,${height} Z`} fill="currentColor" className={color} fillOpacity="0.1" />
    </svg>
  );
};

// --- 2. Skeleton Loader ---

const SkeletonCard = () => (
  <div className="w-full h-[550px] bg-[#09090b] rounded-2xl border border-white/5 animate-pulse relative overflow-hidden flex flex-col">
    <div className="h-40 bg-white/5" />
    <div className="p-5 flex-1 flex flex-col">
      <div className="h-6 w-3/4 bg-white/5 rounded mb-4" />
      <div className="h-10 w-full bg-white/5 rounded mb-4" />
      <div className="h-6 w-1/3 bg-white/5 rounded mb-6" /> {/* Recipient */}
      <div className="h-10 w-full bg-white/5 rounded mb-8" /> {/* If Pill */}
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

// --- 3. Helper: Deterministic Fake Data (Fallback) ---
const generateFakeMetrics = (address: string) => {
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const probability = (seed % 85) + 10; 
  
  let points = [50];
  let current = 50;
  const trend = seed % 2 === 0 ? 'up' : 'down';
  
  for (let i = 0; i < 20; i++) {
    const change = (Math.sin(seed + i) * 10) + (trend === 'up' ? 2 : -2);
    current = Math.max(0, Math.min(100, current + change));
    points.push(current);
  }
  return { probability, chartData: points };
};

export default function CampaignCard({ campaignAddress }: CampaignCardProps) {
  // --- A. Contract Logic ---
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
      { ...campaignContract, functionName: 'conditionId' }, // Added to link to Polymarket
    ],
  });

  // --- B. Polymarket API Logic ---
  const [market, setMarket] = useState<CleanMarket | null>(null);

  // Parse Contract Data safely
  const title = contractData?.[0].result as string;
  const description = contractData?.[1].result as string;
  const goalAmount = contractData?.[2].result as bigint;
  const totalFunded = contractData?.[3].result as bigint;
  const deadline = contractData?.[4].result as bigint;
  const recipient = contractData?.[5].result as Address;
  const resolved = contractData?.[6].result as boolean;
  const conditionId = contractData?.[7].result as string; // Assuming bytes32/string

  // Fetch Market Data when title/conditionId is available
  useEffect(() => {
    const fetchMarket = async () => {
      if (!title) return;
      try {
        // Search by title or grab generic list to filter by conditionId
        const res = await fetch(`/api/markets?limit=20&search=${encodeURIComponent(title)}`);
        const json: MarketsApiResponse = await res.json();
        
        if (json.success && json.data.length > 0) {
          // 1. Try to find exact match by Condition ID
          let found = json.data.find(m => m.conditionId === conditionId);
          // 2. Fallback: Use the first search result
          if (!found) found = json.data[0];
          setMarket(found);
        }
      } catch (err) {
        console.error("Failed to fetch market data", err);
      }
    };
    fetchMarket();
  }, [title, conditionId]);


  // --- C. Derived State & Metrics ---

  // 1. Fake fallback data
  const fakeMetrics = useMemo(() => generateFakeMetrics(campaignAddress), [campaignAddress]);

  // 2. Real data if available, otherwise fake
  const displayProbability = market 
    ? Math.round((market.outcomePrices[0] || 0.5) * 100) 
    : fakeMetrics.probability;
  
  // Note: API doesn't return chart history, so we stick to the generated chart style but color it by real probability
  const chartData = fakeMetrics.chartData; 

  const progressPercent = goalAmount 
    ? Math.min((Number(totalFunded) / Number(goalAmount)) * 100, 100) 
    : 0;
  
  const isExpired = Number(deadline) * 1000 < Date.now();
  const imageUrl = getCampaignImage(campaignAddress);

  const formatMoney = (val: bigint) => 
    `$${Number(formatUnits(val || 0n, 6)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const getProbColor = (p: number) => {
    if (p >= 80) return "text-emerald-400";
    if (p >= 50) return "text-lime-400";
    if (p >= 30) return "text-yellow-400";
    return "text-red-500";
  };
  const probColor = getProbColor(displayProbability);

  // Status Logic
  let statusLabel = "live";
  let statusStyles = "bg-emerald-500 text-black border-emerald-400";
  
  if (resolved) {
    statusLabel = "funded";
    statusStyles = "bg-blue-500 text-white border-blue-400";
  } else if (isExpired) {
    statusLabel = "ended";
    statusStyles = "bg-zinc-600 text-white border-zinc-500";
  } else if (progressPercent >= 100) {
    statusLabel = "funded";
    statusStyles = "bg-blue-500 text-white border-blue-400";
  }

  if (isContractLoading || !contractData) return <SkeletonCard />;

  return (
    <Link href={`/campaign/${campaignAddress}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative w-full h-full bg-[#09090b] rounded-2xl border border-white/5 hover:border-white/20 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl transition-colors"
      >
        {/* 1. Header Image */}
        <div className="relative h-40 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent z-10" />
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
          />
          <div className="absolute top-3 left-3 z-20">
            <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusStyles} shadow-lg`}>
              {statusLabel}
            </div>
          </div>
        </div>

        {/* 2. Content Body */}
        <div className="flex-1 p-5 flex flex-col bg-[#0c0c0e] -mt-2 relative z-20">
          
          {/* Title & Description */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors mb-2">
              {title}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-3">
              {description}
            </p>
            
            {/* SEPARATE SECTION: Recipient / Creator Badge */}
            <div className="mb-4">
              <CreatorBadge address={recipient} label="Recipient" />
            </div>

            {/* SEPARATE SECTION: "If" / Condition Pill */}
            {/* If we have market data, use the real question. Otherwise generic title logic */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm group/pill hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <Icons.Target className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <span className="text-xs font-medium text-zinc-200 truncate">
                  <span className="text-zinc-500 mr-1">If:</span>
                  {market ? market.question : `Prediction Market Outcome`}
                </span>
              </div>
              
              {market && (
                <div className="text-zinc-500 hover:text-blue-400 transition-colors flex-shrink-0" title="View on Polymarket">
                  <Icons.ExternalLink className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>

          {/* 3. Funding Progress */}
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

          {/* 4. Graph & Probability Area */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-end justify-between gap-4">
              
              {/* Left: Probability Big Text */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-0.5">Probability</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black tracking-tight ${probColor} drop-shadow-lg`}>
                    {displayProbability}%
                  </span>
                </div>
              </div>

              {/* Right: Sparkline Graph */}
              <div className="h-10 w-24 pb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <Sparkline data={chartData} color={probColor} />
              </div>

            </div>
          </div>

        </div>
      </motion.div>
    </Link>
  );
}