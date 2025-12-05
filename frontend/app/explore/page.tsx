"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup, Variants } from "framer-motion";

/* ==================================================================================
   1. DESIGN SYSTEM & ANIMATION CONFIG
   ================================================================================== */

// Slower, smoother spring physics for the layout shift
const LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 70,  // Lower stiffness = looser, slower movement
  damping: 20,    // Higher damping = less oscillation
  mass: 1.2
};

const ANIMATION_CONFIG = {
  ease: [0.16, 1, 0.3, 1] as const,
  duration: 0.8,
  stagger: 0.1,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: "blur(4px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    filter: "blur(4px)",
    transition: { duration: 0.3 }
  },
  hover: {
    y: -6,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

/* ==================================================================================
   2. TYPES & MOCK DATA
   ================================================================================== */

type CampaignStatus = "live" | "funded" | "ended";

interface Campaign {
  id: string;
  title: string;
  description: string;
  outcome: string;
  probability: number; // 0 to 100
  raised: number;
  goal: number;
  backers: number;
  status: CampaignStatus;
  tags: string[];
  imageUrl: string;
  chartData: number[];
  polymarketUrl: string;
}

const CATEGORIES = [
  { id: "tech", label: "Deep Tech" },
  { id: "politics", label: "Politics" },
  { id: "climate", label: "Climate" },
  { id: "social", label: "Social Cause" },
  { id: "ai", label: "AI Safety" },
  { id: "urban", label: "Urbanism" },
  { id: "crypto", label: "Protocol" },
  { id: "science", label: "Science" },
  { id: "charity", label: "Charity" },
];

const generateChartData = (trend: 'up' | 'down' | 'volatile') => {
  let points = [50];
  for (let i = 0; i < 20; i++) {
    const change = Math.random() * 20 - 10 + (trend === 'up' ? 2 : trend === 'down' ? -2 : 0);
    let next = points[points.length - 1] + change;
    next = Math.max(0, Math.min(100, next));
    points.push(next);
  }
  return points;
};

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    title: "Stratospheric Aerosol Shield",
    description: "Deploying reflective sulfur particles. Funds released if global temp rises >1.5°C.",
    outcome: "Temp > 1.5°C",
    probability: 82,
    raised: 425000,
    goal: 500000,
    backers: 1240,
    status: "live",
    tags: ["climate", "tech"],
    imageUrl: "https://images.unsplash.com/photo-1534274988754-0d05dd580df8?auto=format&fit=crop&q=80&w=800",
    chartData: generateChartData('up'),
    polymarketUrl: "#"
  },
  {
    id: "2",
    title: "City Center Car-Free Zone",
    description: "Lobbying and infrastructure plan for downtown pedestrianization. Conditional on city council vote.",
    outcome: "Measure B Passes",
    probability: 64,
    raised: 85200,
    goal: 120000,
    backers: 3400,
    status: "live",
    tags: ["urban", "politics"],
    imageUrl: "https://images.unsplash.com/photo-1517231925375-bf2cb42917a5?auto=format&fit=crop&q=80&w=800",
    chartData: generateChartData('up'),
    polymarketUrl: "#"
  },
  {
    id: "3",
    title: "Legal Defense Fund: Crypto Privacy",
    description: "Support for developers facing regulatory action. Funds unlocked if charges are formally filed.",
    outcome: "Indictment Filed",
    probability: 25,
    raised: 890000,
    goal: 1000000,
    backers: 3200,
    status: "funded",
    tags: ["crypto", "politics", "social"],
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    chartData: generateChartData('down'),
    polymarketUrl: "#"
  },
  {
    id: "4",
    title: "Mars Habitat Alpha",
    description: "Prototype inflatable habitat. Contingent on Starship reaching stable orbit before Q3.",
    outcome: "Orbital Success",
    probability: 91,
    raised: 650000,
    goal: 800000,
    backers: 3200,
    status: "live",
    tags: ["tech", "science"],
    imageUrl: "https://images.unsplash.com/photo-1614728853911-1e605289cc29?auto=format&fit=crop&q=80&w=800",
    chartData: generateChartData('up'),
    polymarketUrl: "#"
  },
  {
    id: "5",
    title: "Universal Flu Vaccine Trial",
    description: "Funding Phase 2 trials for a mosaic antigen vaccine. Escrow released upon FDA trial approval.",
    outcome: "FDA Approval",
    probability: 12,
    raised: 150000,
    goal: 900000,
    backers: 405,
    status: "live",
    tags: ["science", "charity"],
    imageUrl: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800",
    chartData: generateChartData('down'),
    polymarketUrl: "#"
  },
  {
    id: "6",
    title: "Swing State Voter Reg",
    description: "Non-partisan registration drive in PA/MI. Conditional on polling spread <2% in October.",
    outcome: "Poll Spread <2%",
    probability: 78,
    raised: 210000,
    goal: 250000,
    backers: 5100,
    status: "live",
    tags: ["politics", "charity"],
    imageUrl: "https://images.unsplash.com/photo-1540910419868-474947cebacb?auto=format&fit=crop&q=80&w=800",
    chartData: generateChartData('volatile'),
    polymarketUrl: "#"
  },
];

/* ==================================================================================
   3. COMPONENTS
   ================================================================================== */

// --- Icons ---
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
  Target: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
  ),
};

// --- Typewriter Effect (Slower) ---
const Typewriter = () => {
  const words = ["Probability.", "Future.", "World.", "Impossible."];
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentWord = words[wordIndex];
    const typeSpeed = isDeleting ? 75 : 150; // Slower typing
    const delay = isDeleting ? 0 : 2500; // Longer pause on full word

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

// --- Sparkline Graph ---
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

// --- Status Badge ---
const StatusBadge = ({ status }: { status: CampaignStatus }) => {
  const styles = {
    live: "bg-emerald-500 text-black border-emerald-400",
    funded: "bg-blue-500 text-white border-blue-400",
    ended: "bg-zinc-600 text-white border-zinc-500",
  };

  return (
    <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[status]} shadow-lg`}>
      {status}
    </div>
  );
};

// --- Card Component ---
const CampaignCard = ({ data }: { data: Campaign }) => {
  const percentage = Math.min((data.raised / data.goal) * 100, 100);
  
  const getProbColor = (p: number) => {
    if (p >= 80) return "text-emerald-400";
    if (p >= 50) return "text-lime-400";
    if (p >= 30) return "text-yellow-400";
    return "text-red-500";
  };

  const probColor = getProbColor(data.probability);
  // Format specifically (e.g. $452,120)
  const formatMoney = (n: number) => `$${n.toLocaleString()}`;

  return (
    <motion.div
      layout
      variants={cardVariants}
      whileHover="hover"
      transition={LAYOUT_TRANSITION}
      className="group relative w-full bg-[#09090b] rounded-2xl border border-white/5 hover:border-white/20 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl transition-colors"
    >
      {/* 1. Header Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent z-10" />
        <img 
          src={data.imageUrl} 
          alt={data.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
        />
        <div className="absolute top-3 left-3 z-20">
          <StatusBadge status={data.status} />
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="flex-1 p-5 flex flex-col bg-[#0c0c0e] -mt-2 relative z-20">
        
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors mb-2">
            {data.title}
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-4">
            {data.description}
          </p>
          
          {/* Distinct Condition Block with Link */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm group/pill hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 overflow-hidden">
              <Icons.Target className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="text-xs font-medium text-zinc-200 truncate">
                <span className="text-zinc-500 mr-1">If:</span>
                {data.outcome}
              </span>
            </div>
            <a 
              href={data.polymarketUrl} 
              className="text-zinc-500 hover:text-blue-400 transition-colors flex-shrink-0"
              title="View market source"
            >
              <Icons.ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3. Funding Progress (Big & Clear) */}
        <div className="mt-auto mb-6">
          <div className="flex justify-between items-end mb-2">
             <div className="flex flex-col">
               <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Raised</span>
               <span className="text-white text-xl font-bold tracking-tight">
                 {formatMoney(data.raised)}
               </span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Goal</span>
                <span className="text-zinc-400 text-sm font-mono">
                  {formatMoney(data.goal)}
                </span>
             </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
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
                  {data.probability}%
                </span>
              </div>
            </div>

            {/* Right: Sparkline Graph */}
            <div className="h-10 w-24 pb-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <Sparkline data={data.chartData} color={probColor} />
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ==================================================================================
   4. PAGE COMPONENT
   ================================================================================== */

export default function Explore() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
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
  };

  const filteredData = useMemo(() => {
    return MOCK_CAMPAIGNS.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                            c.outcome.toLowerCase().includes(search.toLowerCase());
      const matchesTags = selectedTags.size === 0 || 
                          c.tags.some(t => selectedTags.has(t));
      return matchesSearch && matchesTags;
    });
  }, [search, selectedTags]);

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
            {/* Search Input */}
            <div className="relative z-10">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icons.Search className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-500 focus:placeholder-zinc-100 focus:border-white focus:ring-4 focus:ring-white/10 focus:shadow-[0_0_40px_rgba(255,255,255,0.15)] focus:outline-none transition-all duration-300 shadow-2xl"
                placeholder="What do you believe in?"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white"
                >
                  <Icons.Close className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggles */}
            <motion.div 
              layout
              transition={LAYOUT_TRANSITION}
              className="mt-4 flex flex-wrap gap-2"
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
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`
                        relative px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2
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
                
                {(selectedTags.size > 0 || search) && (
                   <motion.button
                     initial={{ opacity: 0, width: 0 }}
                     animate={{ opacity: 1, width: "auto" }}
                     exit={{ opacity: 0, width: 0 }}
                     onClick={clearFilters}
                     className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors border-b border-transparent hover:border-red-400/50 ml-2"
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
          <LayoutGroup>
            <motion.div 
              layout
              transition={LAYOUT_TRANSITION}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredData.length > 0 ? (
                  filteredData.map((campaign) => (
                    <CampaignCard key={campaign.id} data={campaign} />
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full py-20 text-center"
                  >
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Icons.Search className="w-6 h-6 text-zinc-600" />
                    </div>
                    <h3 className="text-zinc-300 font-medium">No timelines found.</h3>
                    <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters or search criteria.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </div>

      </div>
    </div>
  );
}