"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup, Variants } from "framer-motion";
import { usePublicClient } from 'wagmi';
import { type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

import CampaignCard from '@/components/campaign/CampaignCard';

/* ==================================================================================
   1. BLOCKCHAIN CONFIG & ABIS
   ================================================================================== */

const CAMPAIGN_FACTORY_ADDRESS = '0xc02d6a2c24cd9851f2AF6bd7dFe3Da766466cE8B';

const FACTORY_ABI = [
  {
    type: "function",
    name: "getCampaigns",
    inputs: [],
    outputs: [{ type: "address[]", name: "", internalType: "address[]" }],
    stateMutability: "view"
  }
] as const;

const CAMPAIGN_METADATA_ABI = [
  {
    type: "function",
    name: "title",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "marketSlug",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "deadline",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view"
  }
] as const;

/* ==================================================================================
   2. ANIMATION CONFIG
   ================================================================================== */

const LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 70,
  damping: 20,
  mass: 1.2
} as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.4 }
  },
  exit: { 
    opacity: 0, scale: 0.95, transition: { duration: 0.2 } 
  }
};

/* ==================================================================================
   3. TYPES & HELPERS
   ================================================================================== */

// Reduced to the core 7 categories
const CATEGORIES = [
  { id: "tech", label: "Deep Tech" },
  { id: "politics", label: "Politics" },
  { id: "public_goods", label: "Public Goods" },
  { id: "climate", label: "Climate" },
  { id: "crypto", label: "Crypto" },
  { id: "ai", label: "AI Safety" },
  { id: "science", label: "Science" },
];

interface CampaignMetadata {
  address: string;
  title: string;
  marketSlug: string;
  deadline: number;
  tags: string[];
}

const deriveTags = (text: string): string[] => {
  const t = text.toLowerCase();
  const tags: string[] = [];

  // Crypto
  if (t.includes('eth') || t.includes('btc') || t.includes('crypto') || t.includes('base') || t.includes('token') || t.includes('defi') || t.includes('chain')) tags.push('crypto');
  
  // Politics
  if (t.includes('trump') || t.includes('harris') || t.includes('election') || t.includes('vote') || t.includes('policy') || t.includes('law') || t.includes('senate') || t.includes('war') || t.includes('defense')) tags.push('politics');
  
  // Climate
  if (t.includes('climate') || t.includes('carbon') || t.includes('temp') || t.includes('global warming') || t.includes('energy') || t.includes('green')) tags.push('climate');
  
  // AI
  if (t.includes('ai') || t.includes('gpt') || t.includes('model') || t.includes('agi') || t.includes('intelligence')) tags.push('ai');
  
  // Science (Merged Bio/DeSci here)
  if (t.includes('science') || t.includes('research') || t.includes('lab') || t.includes('bio') || t.includes('dna') || t.includes('medicine') || t.includes('health') || t.includes('longevity') || t.includes('study')) tags.push('science');
  
  // Tech (Merged Space here)
  if (t.includes('launch') || t.includes('tech') || t.includes('code') || t.includes('soft') || t.includes('app') || t.includes('space') || t.includes('rocket') || t.includes('mars') || t.includes('orbit')) tags.push('tech');
  
  // Default
  if (tags.length === 0) tags.push('public_goods');
  
  return tags;
};

/* ==================================================================================
   4. UI COMPONENTS
   ================================================================================== */

const Icons = {
  Search: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  ),
  Close: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
  ),
};

const Typewriter = () => {
  const words = ["Moonshot.", "Impossible.", "Future.", "Inevitable."];
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentWord = words[wordIndex];
    const typeSpeed = isDeleting ? 100 : 200;
    const delay = isDeleting ? 0 : 3000;

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      } else {
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 inline-block min-w-[4ch]">
      {text}
      <span className="animate-blink text-white ml-1">|</span>
    </span>
  );
};

const FilterDropdown = ({ 
  value, 
  onChange 
}: { 
  value: 'live' | 'completed'; 
  onChange: (v: 'live' | 'completed') => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative h-full flex items-center pr-2">
      <div className="w-px h-8 bg-zinc-800 mr-3" />
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
      >
        {value === 'live' ? 'Active' : 'Completed'}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <Icons.ChevronDown className="w-3 h-3" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-2 mt-2 w-32 bg-[#111113] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-1">
              {['live', 'completed'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option as any);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    value === option ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  {option === 'live' ? 'Active' : 'Completed'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ==================================================================================
   5. DATA HOOK
   ================================================================================== */

const useCampaignsFeed = () => {
  const publicClient = usePublicClient({ chainId: baseSepolia.id });
  const [campaigns, setCampaigns] = useState<CampaignMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!publicClient) return;
      
      try {
        const addresses = await publicClient.readContract({
          address: CAMPAIGN_FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: 'getCampaigns',
        }) as Address[];

        if (!addresses || addresses.length === 0) {
          setCampaigns([]);
          setIsLoading(false);
          return;
        }

        const contracts = [];
        for (const addr of addresses) {
          contracts.push(
            { address: addr, abi: CAMPAIGN_METADATA_ABI, functionName: 'title' },
            { address: addr, abi: CAMPAIGN_METADATA_ABI, functionName: 'marketSlug' },
            { address: addr, abi: CAMPAIGN_METADATA_ABI, functionName: 'deadline' }
          );
        }

        const results = await publicClient.multicall({ contracts });
        const formatted: CampaignMetadata[] = [];
        const itemCount = addresses.length;

        for (let i = 0; i < itemCount; i++) {
          const addr = addresses[i];
          const titleResult = results[i * 3];
          const slugResult = results[i * 3 + 1];
          const deadlineResult = results[i * 3 + 2];

          if (titleResult.status === 'success') {
             const title = titleResult.result as string;
             const marketSlug = (slugResult.result as string) || "";
             const deadline = Number(deadlineResult.result as bigint);

             formatted.push({
               address: addr,
               title: title,
               marketSlug: marketSlug,
               deadline: deadline,
               tags: deriveTags(`${title} ${marketSlug}`),
             });
          }
        }

        setCampaigns(formatted.reverse());
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [publicClient]);

  return { campaigns, isLoading };
};

/* ==================================================================================
   6. MAIN PAGE
   ================================================================================== */

export default function Explore() {
  const { campaigns, isLoading } = useCampaignsFeed();
  
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'live' | 'completed'>('live');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTag = (tagId: string) => {
    const next = new Set(selectedTags);
    if (next.has(tagId)) {
      next.delete(tagId);
    } else {
      next.add(tagId);
    }
    setSelectedTags(next);
  };

  const clearFilters = () => {
    setSelectedTags(new Set());
    setSearch("");
    setStatusFilter('live');
  };

  const filteredData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);

    return campaigns.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                            c.marketSlug.toLowerCase().includes(search.toLowerCase());
      
      const matchesTags = selectedTags.size === 0 || 
                          c.tags.some(t => selectedTags.has(t));
      
      const isExpired = c.deadline < now;
      const matchesStatus = statusFilter === 'live' 
        ? !isExpired 
        : isExpired;

      return matchesSearch && matchesTags && matchesStatus;
    });
  }, [search, selectedTags, statusFilter, campaigns]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* HERO SECTION */}
        <div className="mb-16 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-6xl md:text-7xl font-bold tracking-tight text-white mb-6"
          >
            Fund the <Typewriter />
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-zinc-400 leading-relaxed max-w-2xl"
          >
            Support projects conditional on real-world outcomes. 
            Funds are held in escrow and only released if the prediction comes true.
          </motion.p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="sticky top-6 z-40 mb-12">
          <div className="relative group">
            {/* Search Input Bar */}
            <div className="relative z-10 flex items-center bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl focus-within:border-white focus-within:ring-4 focus-within:ring-white/10 focus-within:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300">
              
              {/* Left Icon */}
              <div className="pl-4 flex items-center pointer-events-none">
                <Icons.Search className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
              </div>
              
              {/* Input Field */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-4 py-4 bg-transparent text-zinc-100 placeholder-zinc-500 focus:placeholder-zinc-100 focus:outline-none"
                placeholder="What do you believe in?"
              />

              {/* Right Side Controls */}
              <div className="flex items-center h-full py-1.5">
                {search && (
                  <button 
                    onClick={() => setSearch("")}
                    className="mr-2 p-1 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                  >
                    <Icons.Close className="w-4 h-4" />
                  </button>
                )}
                
                <FilterDropdown value={statusFilter} onChange={setStatusFilter} />
              </div>
            </div>

            {/* Filter Toggles */}
            <motion.div 
              layout
              transition={LAYOUT_TRANSITION}
              className="mt-6 flex flex-wrap gap-x-2 gap-y-3"
            >
              <AnimatePresence>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedTags.has(cat.id);
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => toggleTag(cat.id)}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`
                        relative px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 whitespace-nowrap
                        ${isSelected 
                          ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                          : "bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/20 hover:text-zinc-200"}
                      `}
                    >
                      {cat.label}
                      {isSelected && <Icons.Check className="w-3 h-3" />}
                    </motion.button>
                  );
                })}
                
                {(selectedTags.size > 0 || search || statusFilter !== 'live') && (
                   <motion.button
                     initial={{ opacity: 0, width: 0 }}
                     animate={{ opacity: 1, width: "auto" }}
                     exit={{ opacity: 0, width: 0 }}
                     onClick={clearFilters}
                     className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors border-b border-transparent hover:border-red-400/50 ml-2 whitespace-nowrap"
                   >
                     Reset
                   </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* CAMPAIGN GRID */}
        <div className="min-h-[400px]">
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[500px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                ))}
             </div>
          ) : (
            <LayoutGroup>
              <motion.div 
                layout
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredData.length > 0 ? (
                    filteredData.map((campaign) => (
                      <motion.div
                        key={campaign.address}
                        layout
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        variants={cardVariants}
                        className="h-full"
                      >
                        <CampaignCard campaignAddress={campaign.address} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full py-20 text-center"
                    >
                      <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Icons.Search className="w-6 h-6 text-zinc-600" />
                      </div>
                      <h3 className="text-zinc-300 font-medium">No campaigns found.</h3>
                      <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters or search criteria.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          )}
        </div>

      </div>
    </div>
  );
}