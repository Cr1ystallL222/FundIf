// app/page.tsx
'use client';

import React, {
  useState,
  useCallback,
  useRef,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import Link from 'next/link';
import { 
  motion, 
  AnimatePresence, 
  Variants, 
  useScroll, 
  useTransform,
  useInView 
} from 'framer-motion';

// ============================================================================
// 1. ICONS & ASSETS
// ============================================================================

const Icons = {
  ArrowRight: ({ className = "" }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  ),
  CornerDownRight: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={className}><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
  ),
  GitBranch: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={className}><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
  ),
  Shield: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Scale: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={className}><path d="M12 3v19"/><path d="M5 8h14"/><path d="M2 13a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3"/><path d="M16 13a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3"/></svg>
  ),
  Lock: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  Check: ({ className = "" }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" className={className}><polyline points="20 6 9 17 4 12"/></svg>
  ),
  X: ({ className = "" }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  )
};

// ============================================================================
// 2. UTILITIES & ANIMATIONS
// ============================================================================

// Reusable Reveal Component for "Cool" Scrolling
const Reveal = ({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const variants: Variants = {
  lineDraw: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 1.5, ease: "easeInOut" as const } 
    }
  }
};

// ============================================================================
// 3. TOOLTIP SYSTEM
// ============================================================================

interface TooltipState { content: string; x: number; y: number; visible: boolean; id: string; }
interface TooltipContextValue { showTooltip: (id: string, content: string, x: number, y: number) => void; hideTooltip: (id: string) => void; }

const TooltipContext = createContext<TooltipContextValue | null>(null);

const TooltipProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TooltipState>({ content: '', x: 0, y: 0, visible: false, id: '' });
  const timer = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = useCallback((id: string, content: string, x: number, y: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState({ content, x, y, visible: true, id }), 100);
  }, []);

  const hideTooltip = useCallback((id: string) => {
    if (timer.current) clearTimeout(timer.current);
    setState(prev => prev.id === id ? { ...prev, visible: false } : prev);
  }, []);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      <AnimatePresence>
        {state.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 2 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] pointer-events-none px-3 py-2 rounded-md border border-lime-400/30 bg-[#111113] shadow-[0_0_30px_-10px_rgba(163,230,53,0.2)]"
            style={{ left: state.x, top: state.y - 16, transform: 'translate(-50%, -100%)' }}
          >
            <div className="text-[11px] font-mono text-lime-400 uppercase tracking-wide">
              {state.content}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-lime-900/50" />
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipContext.Provider>
  );
};

const useTooltip = (id: string, content: string) => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error("TooltipContext missing");
  return {
    onMouseEnter: (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      context.showTooltip(id, content, rect.left + rect.width / 2, rect.top);
    },
    onMouseLeave: () => context.hideTooltip(id),
  };
};

// ============================================================================
// 4. COMPONENT: LOGIC VISUALIZER (Expanded & Clarified)
// ============================================================================

const LogicVisualizer = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  return (
    <div ref={containerRef} className="relative w-full max-w-7xl mx-auto hidden md:block">
      
      {/* Diagram Container */}
      <div className="relative bg-[#0a0a0c] border border-white/10 rounded-xl p-16 overflow-hidden shadow-2xl">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Labels */}
        <div className="absolute top-6 left-6 text-xs font-mono text-zinc-500 uppercase tracking-widest">// Execution_Flow_V1</div>
        <div className="absolute top-6 right-6 flex gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" /> LIVE
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-12">
          
          {/* 1. Input Node */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6 relative group w-48"
            {...useTooltip('node-backers', 'USDC Deposits')}
          >
            <div className="w-24 h-24 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center group-hover:border-zinc-400 transition-colors shadow-lg relative">
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">$</div>
              <span className="font-mono text-zinc-300 text-2xl font-bold">USDC</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-mono text-white uppercase tracking-wider mb-1">Funding</div>
              <div className="text-xs text-zinc-500">Backers Deposit Capital</div>
            </div>
          </motion.div>

          {/* Connector 1 */}
          <div className="flex-1 h-[2px] bg-zinc-800 relative overflow-hidden rounded-full">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-500 to-transparent opacity-50"
              initial={{ x: '-100%' }}
              animate={isInView ? { x: '100%' } : {}}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            />
          </div>

          {/* 2. Central Processor (Smart Contract) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-6 relative z-20"
            {...useTooltip('node-contract', 'Immutable Logic')}
          >
            {/* Oracle Input Animation */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center h-24 justify-end pb-2">
              <div className="px-3 py-1.5 bg-[#1a1a1c] border border-zinc-700 rounded text-[10px] font-mono text-zinc-300 whitespace-nowrap mb-2">
                Polymarket API
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={isInView ? { height: '100%' } : {}}
                transition={{ duration: 1, delay: 0.8 }}
                className="w-[1px] bg-zinc-600"
              />
              <div className="w-2 h-2 bg-zinc-600 rounded-full mt-[-1px]" />
            </div>

            <div className="w-32 h-32 bg-[#0e0e10] border border-amber-500/40 rounded-2xl flex items-center justify-center shadow-[0_0_50px_-10px_rgba(245,158,11,0.15)] relative">
              <div className="absolute inset-0 rounded-2xl border border-amber-500/20 animate-pulse" />
              <div className="text-center space-y-2">
                <Icons.Lock className="mx-auto text-amber-500 w-8 h-8" />
                <div className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">Escrow<br/>Locked</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-mono text-amber-500 uppercase tracking-wider mb-1">Smart Contract</div>
              <div className="text-xs text-zinc-500">Awaits Resolution</div>
            </div>
          </motion.div>

          {/* Connector 2 (Split) */}
          <div className="flex-1 relative h-32 w-48">
            {/* Path YES */}
            <svg className="absolute top-0 left-0 w-full h-full overflow-visible">
              <motion.path 
                d="M0 64 C 60 64, 80 20, 140 20"
                fill="none"
                stroke="#84cc16" // Lime-500
                strokeWidth="2"
                strokeDasharray="6 6"
                variants={variants.lineDraw}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              />
               <motion.path 
                d="M0 64 C 60 64, 80 108, 140 108"
                fill="none"
                stroke="#ef4444" // Red-500
                strokeWidth="2"
                strokeDasharray="6 6"
                variants={variants.lineDraw}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              />
            </svg>
            
            {/* Conditions Labels */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.2 }}
              className="absolute top-8 right-1/2 translate-x-4 bg-[#111] border border-lime-500/30 text-lime-400 px-2 py-1 text-[10px] font-mono rounded"
            >
              IF "YES"
            </motion.div>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={isInView ? { opacity: 1 } : {}}
               transition={{ delay: 1.2 }}
               className="absolute bottom-8 right-1/2 translate-x-4 bg-[#111] border border-red-500/30 text-red-400 px-2 py-1 text-[10px] font-mono rounded"
            >
              IF "NO"
            </motion.div>
          </div>

          {/* 3. Outputs */}
          <div className="flex flex-col gap-16">
             {/* Creator */}
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 1.4 }}
                className="flex items-center gap-4 p-3 rounded-lg border border-lime-500/20 bg-lime-500/5 w-56"
              >
                <div className="w-10 h-10 rounded bg-lime-500/20 flex items-center justify-center text-lime-400 shadow-[0_0_15px_-3px_rgba(132,204,22,0.3)]">
                  <Icons.Check />
                </div>
                <div>
                  <div className="text-xs font-mono text-lime-400 uppercase font-bold">Creator Paid</div>
                  <div className="text-[10px] text-zinc-400">Funds Released</div>
                </div>
             </motion.div>

             {/* Refund */}
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 1.6 }}
                className="flex items-center gap-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 w-56"
              >
                <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]">
                  <Icons.X />
                </div>
                <div>
                  <div className="text-xs font-mono text-red-400 uppercase font-bold">Refunded</div>
                  <div className="text-[10px] text-zinc-400">100% Returned</div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. COMPONENT: HERO
// ============================================================================

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative pt-32 pb-24 px-6 border-b border-white/5 overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Headline */}
        <motion.h1 
          className="text-6xl md:text-8xl font-bold text-white leading-[0.9] tracking-tighter mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Fund the Future, <br />
          <span className="text-lime-400">
            On <span className="underline decoration-4 decoration-lime-400 underline-offset-[12px]">Your</span> Terms.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p 
          className="text-xl text-zinc-400 max-w-xl leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          A crowdfunding protocol tied to reality. Funds held in escrow and unlock <span className="text-white font-semibold">only</span> if a specific prediction market event resolves to "YES".
        </motion.p>

        {/* Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <Link href="/create" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold rounded-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 text-base group">
              Create Contract
              <Icons.CornerDownRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
          <Link href="/docs" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-10 py-5 bg-transparent border border-zinc-700 text-zinc-300 font-medium rounded-sm hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-3 text-base">
              Read Protocol Docs
              <Icons.ArrowRight className="opacity-50" />
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Background Texture */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.05)_0%,transparent_70%)] pointer-events-none mix-blend-screen"
      />
    </section>
  );
};

// ============================================================================
// 6. COMPONENT: PROCESS TRACK (Redesigned Steps)
// ============================================================================

const ProcessCard = ({ number, title, desc, icon: Icon }: { number: string, title: string, desc: string, icon: any }) => (
  <Reveal className="flex gap-8 relative group">
    {/* Left Column: Number & Line */}
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-md bg-[#111] border border-zinc-800 flex items-center justify-center text-sm font-mono text-zinc-500 group-hover:border-lime-500 group-hover:text-lime-400 transition-colors duration-300 z-10">
        {number}
      </div>
      <div className="w-[1px] flex-1 bg-zinc-800 group-last:hidden my-2" />
    </div>

    {/* Right Column: Content */}
    <div className="pb-16 pt-1 max-w-xl">
      <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-4">
        {title}
        <Icon className="text-zinc-600 group-hover:text-lime-400 transition-colors" />
      </h3>
      <p className="text-zinc-400 text-base leading-relaxed">
        {desc}
      </p>
    </div>
  </Reveal>
);

// ============================================================================
// 7. COMPONENT: INTERACTIVE VALUE PROPS
// ============================================================================

const ValueCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <Reveal>
    <div className="group p-8 bg-zinc-900/30 border border-zinc-800/60 rounded-lg hover:border-lime-500/50 hover:bg-zinc-900/60 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(132,204,22,0.2)] cursor-default h-full">
      <div className="mb-6 w-12 h-12 rounded bg-zinc-800/50 flex items-center justify-center group-hover:bg-lime-500/20 transition-colors">
        <Icon className="text-zinc-400 group-hover:text-lime-400 transition-colors w-6 h-6" />
      </div>
      <h4 className="text-xl font-bold text-white mb-3">{title}</h4>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  </Reveal>
);

// ============================================================================
// 8. MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <TooltipProvider>
      <main className="min-h-screen bg-[#09090b] selection:bg-lime-500/20 selection:text-lime-200 overflow-hidden">
        
        <Hero />

        {/* SECTION: HOW IT WORKS (LOGIC) */}
        <section className="py-32 px-6 border-b border-white/5 bg-[#050505]">
          <Reveal className="text-center mb-16">
            <h2 className="text-sm font-mono text-lime-400 uppercase tracking-widest mb-4">Architecture</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">The Logic Engine</h3>
          </Reveal>
          
          <LogicVisualizer />

          {/* Mobile Fallback for Logic Diagram */}
          <div className="md:hidden max-w-sm mx-auto space-y-4">
             {/* Just a simple simplified stack for mobile */}
             <div className="p-4 bg-zinc-900 rounded border border-zinc-800 text-center text-white">1. Backers Deposit USDC</div>
             <div className="flex justify-center text-zinc-600">↓</div>
             <div className="p-4 bg-zinc-900 rounded border border-amber-500/50 text-center text-amber-500">2. Contract Waits for Oracle</div>
             <div className="flex justify-center text-zinc-600">↓</div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-lime-900/20 border border-lime-500/30 rounded text-center text-lime-400 text-sm">YES = Pay Creator</div>
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-center text-red-400 text-sm">NO = Refund All</div>
             </div>
          </div>
        </section>

        {/* SECTION: VALUE PROPS */}
        <section className="py-32 px-6 border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-16 max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Don't trust promises. <br />
                Trust <span className="text-lime-400">code</span>.
              </h2>
              <p className="text-xl text-zinc-400 leading-relaxed">
                Traditional crowdfunding relies on the creator's goodwill. FundIf relies on cryptographic truth. 
                We replace "Trust me, bro" with immutable smart contracts.
              </p>
            </Reveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ValueCard 
                icon={Icons.Scale}
                title="Enforced Accountability"
                desc="Creators only get paid if they deliver results verified by the market. No more vaporware, no more rug pulls. The oracle decides, not the creator."
              />
              <ValueCard 
                icon={Icons.GitBranch}
                title="Conditional Hedges"
                desc="Fund specific outcomes. Want to fund a party only if Bitcoin hits $100k? You can. If the outcome fails, your capital is returned 100%."
              />
            </div>
          </div>
        </section>

        {/* SECTION: PROCESS TIMELINE */}
        <section className="py-32 px-6 bg-gradient-to-b from-[#09090b] to-[#000]">
          <div className="max-w-4xl mx-auto">
            <Reveal className="mb-20 text-center">
               <h2 className="text-3xl font-bold text-white">System Operations</h2>
               <div className="h-1 w-20 bg-lime-500 mx-auto mt-4 rounded-full" />
            </Reveal>

            <div className="pl-4 md:pl-0">
              <ProcessCard 
                number="01" 
                title="Define the Condition" 
                desc="The creator launches a campaign and links it to a specific Polymarket event (e.g., 'Will Starship reach orbit in 2024?'). This sets the 'Truth Source' for the contract."
                icon={Icons.GitBranch}
              />
              <ProcessCard 
                number="02" 
                title="Crowdfund in Escrow" 
                desc="Backers contribute USDC. Funds are locked in a smart contract. Neither the creator nor FundIf can touch them until the condition is met."
                icon={Icons.Lock}
              />
              <ProcessCard 
                number="03" 
                title="Oracle Resolution" 
                desc="Once the Polymarket event resolves, the UMA optimistic oracle pushes the result to our contract on-chain. This process is decentralized and tamper-proof."
                icon={Icons.Scale}
              />
               <ProcessCard 
                number="04" 
                title="Automatic Settlement" 
                desc="Logic executes immediately. If the result is YES, funds stream to the creator. If NO, backers can claim a 100% refund with one click."
                icon={Icons.Shield}
              />
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="py-32 px-6 border-t border-white/5 text-center">
          <Reveal>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-5xl font-bold text-white mb-8 tracking-tight">Ready to build?</h2>
              <p className="text-zinc-400 mb-10 text-lg">
                Launch a campaign in minutes. No coding required.
              </p>
              <Link href="/create">
                <button className="px-12 py-5 bg-lime-400 text-black font-bold text-lg rounded-sm hover:bg-lime-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(163,230,53,0.4)]">
                  Start a Campaign
                </button>
              </Link>
            </div>
          </Reveal>
        </section>

      </main>
    </TooltipProvider>
  );
}