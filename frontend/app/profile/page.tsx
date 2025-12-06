// app/profile/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useReadContract, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CampaignFactoryABI, ERC20ABI } from '@/lib/contracts/abis';
import { CAMPAIGN_FACTORY_ADDRESS, USDC_ADDRESS } from '@/lib/contracts/addresses';
import ConnectButton from '@/components/wallet/ConnectButton';
import CampaignCard from '@/components/campaign/CampaignCard';

/* ==================================================================================
   1. CONFIG & ABIS
   ================================================================================== */

// Extended ABI to include creator fetch if missing in base, 
// though we will calculate backer positions manually now.
const ExtendedFactoryABI = [
  ...CampaignFactoryABI,
  // getCampaignsByBacker removed as it does not exist on contract
] as const;

// Minimal Metadata ABI
const CampaignMetadataABI = [
  {
    inputs: [],
    name: "title",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "resolved",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deadline",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
] as const;

// Minimal Contribution ABI to check backer status
const CampaignContributionABI = [
  {
    inputs: [{ internalType: "address", name: "funder", type: "address" }],
    name: "getContribution",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
] as const;

interface IconProps { className?: string; strokeWidth?: number; }
interface AssetRowProps { label: string; value: string; icon: React.ReactNode; symbol?: string; symbolPosition?: 'left' | 'right'; }
type TabType = 'all' | 'active' | 'completed';
type ViewMode = 'creator' | 'backer';

/* ==================================================================================
   2. ICONS
   ================================================================================== */

const IconWrapper = ({ children, className = "w-4 h-4", strokeWidth = 1.5 }: { children: React.ReactNode } & IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

const Icons = {
  Wallet: (p: IconProps) => <IconWrapper {...p}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></IconWrapper>,
  Eth: (p: IconProps) => <IconWrapper {...p}><path d="m12 2 9 15-9 5-9-5Z" /><path d="M12 2v20" /></IconWrapper>,
  Search: (p: IconProps) => <IconWrapper {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></IconWrapper>,
  Plus: (p: IconProps) => <IconWrapper {...p}><path d="M5 12h14" /><path d="M12 5v14" /></IconWrapper>,
  Copy: (p: IconProps) => <IconWrapper {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></IconWrapper>,
  Check: (p: IconProps) => <IconWrapper {...p}><polyline points="20 6 9 17 4 12" /></IconWrapper>,
  Box: (p: IconProps) => <IconWrapper {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" x2="12" y1="22.08" y2="12" /></IconWrapper>,
  Lock: (p: IconProps) => <IconWrapper {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></IconWrapper>,
  Layers: (p: IconProps) => <IconWrapper {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></IconWrapper>,
  PieChart: (p: IconProps) => <IconWrapper {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></IconWrapper>,
};

const generateGradient = (address: string) => {
  if (!address) return 'linear-gradient(135deg, #333, #000)';
  const hash = address.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 50) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 85%, 65%), hsl(${hue2}, 85%, 45%))`;
};

/* ==================================================================================
   3. UI COMPONENTS
   ================================================================================== */

const ViewToggle = ({ mode, setMode }: { mode: ViewMode, setMode: (m: ViewMode) => void }) => (
  <div className="flex p-1 bg-black/40 rounded-lg border border-white/10 w-fit backdrop-blur-md">
    <button onClick={() => setMode('creator')} className="relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors outline-none">
      {mode === 'creator' && (
        <motion.div layoutId="viewMode" className="absolute inset-0 bg-zinc-700/80 rounded-md border border-white/10 shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
      )}
      <span className={`relative z-10 flex items-center gap-2 ${mode === 'creator' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <Icons.Layers className="w-3.5 h-3.5" />
        <span>Creator</span>
      </span>
    </button>
    <button onClick={() => setMode('backer')} className="relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors outline-none">
      {mode === 'backer' && (
        <motion.div layoutId="viewMode" className="absolute inset-0 bg-zinc-700/80 rounded-md border border-white/10 shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
      )}
      <span className={`relative z-10 flex items-center gap-2 ${mode === 'backer' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <Icons.PieChart className="w-3.5 h-3.5" />
        <span>Backer</span>
      </span>
    </button>
  </div>
);

const IdentityBadge = ({ address, title }: { address: string, title: string }) => {
  const [copied, setCopied] = useState(false);
  const gradient = useMemo(() => generateGradient(address), [address]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-5">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden shrink-0" style={{ background: gradient }}>
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('/noise.svg')]" />
      </div>
      <div className="min-w-0">
        <motion.h1 key={title} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white tracking-tight truncate">
          {title}
        </motion.h1>
        <button onClick={handleCopy} className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-1.5">
          <span className="font-mono bg-zinc-900/50 px-2 py-0.5 rounded border border-white/5 truncate">{address}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            {copied ? <Icons.Check className="w-3.5 h-3.5 text-[#a3c229]" /> : <Icons.Copy className="w-3.5 h-3.5" />}
          </span>
        </button>
      </div>
    </div>
  );
};

const AssetRow = ({ label, value, icon, symbol, symbolPosition = 'right' }: AssetRowProps) => (
  <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-white/5 transition-colors group cursor-default">
    <div className="flex items-center gap-3">
      <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0">{icon}</div>
      <span className="text-base text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">{label}</span>
    </div>
    <div className="text-right flex items-baseline justify-end gap-1.5 min-w-[120px]">
      {symbolPosition === 'left' && <span className="text-xl text-zinc-600 font-medium translate-y-[1px]">{symbol}</span>}
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {symbolPosition === 'right' && <span className="text-sm text-zinc-600 font-bold self-center pt-1.5">{symbol}</span>}
    </div>
  </div>
);

/* ==================================================================================
   4. MAIN PAGE LOGIC (Optimized)
   ================================================================================== */

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('creator');

  useEffect(() => setMounted(true), []);

  // --- 1. INSTANT DATA (Balances) ---
  const { data: ethBalance, isLoading: ethLoading } = useBalance({ address, query: { enabled: !!address } });
  const { data: usdcBalance, isLoading: usdcLoading } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // --- 2. LIST DATA (Addresses) ---
  
  // A. Creator: Native function exists
  const { data: createdCampaigns, isLoading: createdLoading } = useReadContract({
    address: CAMPAIGN_FACTORY_ADDRESS as `0x${string}`,
    abi: ExtendedFactoryABI,
    functionName: 'getCampaignsByCreator',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // B. Backer: Native function DOES NOT exist. We must fetch all and filter.
  // 1. Get All Campaigns
  const { data: allCampaigns, isLoading: allCampaignsLoading } = useReadContract({
    address: CAMPAIGN_FACTORY_ADDRESS as `0x${string}`,
    abi: CampaignFactoryABI,
    functionName: 'getCampaigns',
    query: { enabled: !!address && viewMode === 'backer' } // Only fetch if looking at backer view
  });

  // 2. Check Contributions on All Campaigns
  const { data: contributionsResults, isLoading: contributionsLoading } = useReadContracts({
    contracts: (allCampaigns as `0x${string}`[] || []).map(campaignAddr => ({
      address: campaignAddr,
      abi: CampaignContributionABI,
      functionName: 'getContribution',
      args: address ? [address] : undefined
    })),
    query: { enabled: !!allCampaigns && !!address && viewMode === 'backer' },
    batchSize: 12
  });

  // 3. Derive Backed List
  const backedCampaigns = useMemo(() => {
    if (!allCampaigns || !contributionsResults) return [];
    
    return (allCampaigns as `0x${string}`[]).filter((_, index) => {
      const result = contributionsResults[index]?.result as bigint;
      return result && result > 0n;
    });
  }, [allCampaigns, contributionsResults]);

  const backedLoading = allCampaignsLoading || contributionsLoading;

  // Determine active list
  const campaignsAddresses = useMemo(() => {
    if (viewMode === 'creator') return (createdCampaigns as `0x${string}`[]) || [];
    return backedCampaigns;
  }, [viewMode, createdCampaigns, backedCampaigns]);

  // --- 3. METADATA (Batch Fetching) ---
  // Using batchSize to prevent RPC limits on large lists
  const { data: metadataResults, isLoading: metadataLoading } = useReadContracts({
    contracts: campaignsAddresses.flatMap(addr => [
      { address: addr, abi: CampaignMetadataABI, functionName: 'title' },
      { address: addr, abi: CampaignMetadataABI, functionName: 'resolved' },
      { address: addr, abi: CampaignMetadataABI, functionName: 'deadline' }
    ]),
    query: { enabled: campaignsAddresses.length > 0 },
    batchSize: 12, // Chunk requests to prevent timeout
  });

  // --- 4. LOGIC ---
  const filteredCampaigns = useMemo(() => {
    if (!campaignsAddresses) return [];
    
    // If metadata hasn't loaded yet, we can still show something if we wanted, 
    // but for filtering we need it.
    if (!metadataResults && campaignsAddresses.length > 0) return [];

    const now = Date.now() / 1000;

    const campaignsWithMeta = campaignsAddresses.map((addr, idx) => {
      const baseIdx = idx * 3;
      const title = (metadataResults?.[baseIdx]?.result as string) || '';
      const resolved = (metadataResults?.[baseIdx + 1]?.result as boolean) || false;
      const deadline = Number(metadataResults?.[baseIdx + 2]?.result || 0n);
      return { address: addr, title, resolved, deadline };
    });

    return campaignsWithMeta.filter((campaign) => {
      // Search Filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = campaign.address.toLowerCase().includes(searchLower) || 
                            campaign.title.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;

      // Tab Filter
      const isExpired = campaign.deadline > 0 && campaign.deadline < now;
      const isActive = !campaign.resolved && !isExpired;
      const isCompleted = campaign.resolved || isExpired;

      if (activeTab === 'active') return isActive;
      if (activeTab === 'completed') return isCompleted;
      return true;
    });
  }, [campaignsAddresses, metadataResults, searchTerm, activeTab]);

  const ethDisplay = ethBalance ? Number(formatUnits(ethBalance.value, 18)).toFixed(4) : '0.0000';
  const usdcDisplay = usdcBalance ? Number(formatUnits(usdcBalance as bigint, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

  // --- 5. RENDER STATES ---
  
  // Auth Gate
  if (mounted && !isConnected) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#09090b]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 text-center max-w-md border border-white/10 bg-zinc-900/50 backdrop-blur-xl rounded-2xl shadow-2xl">
          <div className="w-16 h-16 bg-zinc-900/80 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
            <Icons.Lock className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your Profile</h2>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">Connect your wallet to manage your campaigns and view your backing positions.</p>
          <div className="flex justify-center"><ConnectButton /></div>
        </motion.div>
      </div>
    );
  }

  // PERFORMANCE OPTIMIZATION:
  // Do NOT block the whole page on loading. Only block if we don't have basic account info.
  // The grid will handle its own loading state.
  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#09090b] text-zinc-200 overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#a3c229]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* --- HEADER SECTION (Loads Instantly) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Identity Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-panel p-8 relative overflow-hidden bg-zinc-900/30 border border-white/5 rounded-3xl flex flex-col justify-between min-h-[240px]"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                <IdentityBadge address={address || ''} title={viewMode === 'creator' ? "Your Campaigns" : "Your Positions"} />
                <ViewToggle mode={viewMode} setMode={setViewMode} />
              </div>
            </div>
            
            <div className="pt-4">
              {viewMode === 'creator' ? (
                <Link href="/create" className="inline-block">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#b5d63a" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-3 bg-[#a3c229] text-black text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(163,194,41,0.15)] transition-colors"
                  >
                    <Icons.Plus className="w-4 h-4 text-black" strokeWidth={3} />
                    <span>Create Campaign</span>
                  </motion.button>
                </Link>
              ) : (
                <div className="h-[44px] flex items-center">
                  <span className="text-zinc-500 text-sm font-medium px-1">
                    Tracking <span className="text-white font-bold">{campaignsAddresses.length}</span> active positions
                  </span>
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          {/* Assets Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 bg-zinc-900/30 border border-white/20 rounded-3xl flex flex-col justify-center gap-2"
          >
            <div className="mb-2 pl-3 pb-3 border-b-2 border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Wallet Assets</h3>
            </div>
            <div className="flex flex-col gap-0">
              <AssetRow label="Ethereum" value={ethLoading ? "..." : ethDisplay} symbol="ETH" symbolPosition="right" icon={<Icons.Eth className="w-5 h-5" />} />
              <AssetRow label="USDC Coin" value={usdcLoading ? "..." : usdcDisplay} symbol="$" symbolPosition="left" icon={<span className="text-blue-400 font-black text-lg">$</span>} />
            </div>
          </motion.div>
        </div>

        {/* --- GRID SECTION (Handles its own loading) --- */}
        
        {/* Toolbar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-4 z-20 bg-[#09090b]/90 backdrop-blur-xl p-2.5 -mx-2.5 rounded-2xl border border-white/5 shadow-xl"
        >
          <div className="flex p-1 bg-zinc-900/80 rounded-xl border border-white/5 w-full sm:w-auto relative">
            {(['all', 'active', 'completed'] as TabType[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="relative px-6 py-2 text-sm font-medium rounded-lg transition-colors capitalize w-full sm:w-auto outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-zinc-800 shadow-sm rounded-lg border border-white/5" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className={`relative z-10 ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{tab}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80 group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#a3c229] transition-colors"><Icons.Search /></div>
            <input 
              type="text" 
              placeholder={`Search ${viewMode === 'creator' ? 'campaigns' : 'positions'}...`} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#a3c229]/50 focus:ring-1 focus:ring-[#a3c229]/50 transition-all" 
            />
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {/* 
              Performance Logic:
              1. If createdLoading/backedLoading is true, show full skeleton (we don't know address list yet).
              2. If metadataLoading is true, show grid skeleton (we have addresses, but can't filter yet).
            */}
            {(viewMode === 'creator' ? createdLoading : backedLoading) || metadataLoading ? (
              [1, 2, 3].map((i) => (
                 <motion.div
                    key={`skel-${i}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-[380px] bg-zinc-900/20 rounded-2xl border border-white/5 animate-pulse"
                  />
              ))
            ) : filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((item, index) => (
                <motion.div
                  key={item.address}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="h-full transition-transform hover:-translate-y-1 duration-300">
                    <CampaignCard campaignAddress={item.address} />
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner"><Icons.Box className="w-8 h-8 text-zinc-600" /></div>
                <h3 className="text-white font-medium text-lg">{activeTab === 'all' ? `No ${viewMode} campaigns found` : `No ${activeTab} campaigns`}</h3>
                <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">
                  {searchTerm 
                    ? "No results match your search query." 
                    : viewMode === 'creator' ? "Start by creating your first outcome-based campaign." : "You haven't backed any campaigns yet."
                  }
                </p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="mt-6 text-[#a3c229] text-sm font-bold hover:underline transition-all">Clear Search</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}