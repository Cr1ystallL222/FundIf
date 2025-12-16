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
import dynamic from 'next/dynamic';
import {
  motion,
  AnimatePresence,
  useInView,
  Variants
} from 'framer-motion';

// Dynamic imports to prevent SSR issues
const RainingLetters = dynamic(() => import('@/components/ui/modern-animated-hero-section'), {
  ssr: false,
  loading: () => null
});
const MatrixText = dynamic(() => import('@/components/ui/matrix-text').then(mod => ({ default: mod.MatrixText })), {
  ssr: false,
  loading: () => null
});
import { 
    CircleDollarSign, 
    Lock, 
    CheckCircle, 
    XCircle, 
    GitBranch,
    Shield,
    Scale,
    Check,
    X,
    IdCard,
    ArrowRight,
    CornerDownRight
} from 'lucide-react';


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
// 4. COMPONENT: LOGIC VISUALIZER (Final Animated Version)
// ============================================================================

const LogicVisualizer = () => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    return (
        <div ref={containerRef} className="relative w-full max-w-7xl mx-auto hidden md:block">
            <div className="relative bg-neutral-950 border border-white/10 rounded-xl p-16 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                
                <div className="absolute top-6 left-6 text-xs font-mono text-zinc-500 uppercase tracking-widest">// EXECUTION_FLOW_V1</div>
                <motion.div 
                    className="absolute top-6 right-6 flex items-center gap-2 text-xs font-mono text-zinc-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-2 h-2 bg-lime-400 rounded-full" /> LIVE
                </motion.div>

                <div className="relative z-10 flex items-center justify-between gap-12 font-mono">
                    
                    {/* 1. Input Node */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex flex-col items-center gap-4 p-6 relative group w-48 text-center bg-black/50 border border-white/10 rounded-xl"
                        {...useTooltip('node-backers', 'USDC Deposits')}
                    >
                        <div className="w-24 h-24 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center">
                             <span className="font-mono text-blue-400 text-4xl font-bold">$</span>
                        </div>
                        <div className="text-center">
                            <MatrixText text="FUNDING" className="text-sm font-bold text-white uppercase tracking-wider mb-1" />
                            <div className="text-xs text-zinc-500">Backers Deposit Capital</div>
                        </div>
                    </motion.div>

                    {/* Connector 1 */}
                    <svg className="flex-1 h-px overflow-visible">
                        <motion.line x1="0" y1="0" x2="100%" y2="0" stroke="#333" strokeWidth="1.5" />
                        <motion.line
                            x1="0" y1="0" x2="100%" y2="0"
                            stroke="#a3e635"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                            animate={{ strokeDashoffset: [0, -8] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>

                    {/* 2. Central Processor (Smart Contract) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex flex-col items-center gap-4 p-6 relative group w-48 text-center bg-black/50 border border-amber-500/40 rounded-2xl"
                        {...useTooltip('node-contract', 'Immutable Logic')}
                    >
                        <div className="w-32 h-32 bg-zinc-900 border border-amber-500/20 rounded-2xl flex items-center justify-center relative">
                            <Lock className="w-12 h-12 text-amber-500" />
                        </div>
                        <div className="text-center">
                             <MatrixText text="SMART CONTRACT" className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-1" />
                            <div className="text-xs text-zinc-500">Awaits Resolution</div>
                        </div>
                    </motion.div>

                    {/* Connector 2 (Split) */}
                    <div className="relative h-32 w-48 flex items-center justify-center">
                         <svg className="absolute w-full h-full overflow-visible">
                            <motion.path d="M0 64 C 60 64, 80 20, 140 20" fill="none" stroke="#a3e635" strokeWidth="1.5" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, -8] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}/>
                            <motion.path d="M0 64 C 60 64, 80 108, 140 108" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, 8] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}/>
                        </svg>
                    </div>

                    {/* 3. Outputs */}
                    <div className="flex flex-col gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 1, duration: 0.5 }}
                            className="flex flex-row items-center gap-4 w-80 p-4 border border-lime-500/20 bg-lime-500/10 rounded-xl"
                        >
                            <div className="w-12 h-12 rounded bg-black/50 flex-shrink-0 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-lime-400"/>
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">CREATOR PAID</div>
                                <div className="text-xs text-zinc-400">Funds Released</div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="flex flex-row items-center gap-4 w-80 p-4 border border-red-500/20 bg-red-500/10 rounded-xl"
                        >
                            <div className="w-12 h-12 rounded bg-black/50 flex-shrink-0 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500"/>
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">REFUNDED</div>
                                <div className="text-xs text-zinc-400">100% Returned</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// ============================================================================
// 6. COMPONENT: PROCESS TRACK
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
    <div className="group p-8 bg-zinc-900/30 border border-zinc-800/60 rounded-lg hover:border-lime-500/50 hover:bg-zinc-900/60 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(132,204,22,0.2)] cursor-default h-full flex flex-col">
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
      <main className="min-h-screen bg-[#09090b] selection:bg-lime-500/20 selection:text-lime-200 overflow-hidden" suppressHydrationWarning={true}>
        
        <RainingLetters />

        {/* SECTION: HOW IT WORKS (LOGIC) */}
        <section className="py-32 px-6 border-b border-white/5 bg-[#050505]">
          <Reveal className="text-center mb-10">
            <h2 className="text-sm font-mono text-lime-400 uppercase tracking-widest mb-4">Architecture</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">
				<MatrixText text="The Logic Engine" className="text-3xl md:text-4xl font-bold text-white" />
			</h3>
          </Reveal>
          
          <LogicVisualizer />

          {/* Mobile Fallback for Logic Diagram */}
          <div className="md:hidden max-w-sm mx-auto space-y-4 mt-12">
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
                Traditional crowdfunding asks you to believe the creator will follow through. 
                FundIf binds funds to reality. It allows for <span className="text-white font-medium">conditional funding</span>—pledging capital that only moves if a specific real-world event happens first.
              </p>
            </Reveal>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ValueCard 
                icon={GitBranch}
                title="Conditional Triggers"
                desc="Fund a cause ONLY if a specific event happens. Like donating to a legal defense fund only if charges are filed. This isn't about verifying milestones; it's about programmatic contingency."
              />
              <ValueCard 
                icon={IdCard}
                title="Identity & Transparency"
                desc="Powered by Basenames. You see exactly who you are funding. The contract is verified and open-source, ensuring that once the campaign starts, the creator has zero control over the funds."
              />
              <ValueCard 
                icon={Shield}
                title="Guaranteed Refunds"
                desc="There is no middleman to beg for a refund. If the Polymarket oracle resolves the event to NO, the smart contract automatically unlocks 100% of funds for backers to claim."
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
                desc="The creator launches a campaign and links it to a specific Polymarket event (e.g., 'Will Candidate X win the primary?'). This sets the 'Truth Source' for the escrow contract."
                icon={GitBranch}
              />
              <ProcessCard 
                number="02" 
                title="Crowdfund in Escrow" 
                desc="Backers contribute USDC. Funds are locked in a a smart contract. Neither the creator nor FundIf can touch them. The outcome is entirely dependent on the external event."
                icon={Lock}
              />
              <ProcessCard 
                number="03" 
                title="Oracle Resolution" 
                desc="Once the event concludes, the UMA optimistic oracle pushes the definitive result (YES or NO) to our contract on-chain."
                icon={Scale}
              />
               <ProcessCard 
                number="04" 
                title="Automatic Settlement" 
                desc="Logic executes immediately. If YES, funds stream to the creator to execute their vision. If NO, the campaign is voided and backers are automatically refunded."
                icon={Shield}
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
                Launch a conditional campaign in minutes.
              </p>
              <Link href="/create">
                <button className="px-12 py-5 bg-lime-400 text-black font-bold text-lg rounded-sm hover:bg-lime-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(163,230,53,0.4)]">
                  Create Campaign
                </button>
              </Link>
            </div>
          </Reveal>
        </section>

      </main>
    </TooltipProvider>
  );
}
