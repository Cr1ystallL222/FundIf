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
  useInView,
  Variants
} from 'framer-motion';
import RainingLetters from '@/components/ui/modern-animated-hero-section';
import { MatrixText } from '@/components/ui/matrix-text';
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

const Icons = {
    Lock,
    Check,
    X
}

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
// 4. COMPONENT: LOGIC VISUALIZER (V2 - Refined Animations)
// ============================================================================

const LogicVisualizer = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const lineVariants: Variants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: { duration: 1.5, ease: "circOut", delay: 0.5 }
    }
  }

  return (
    <motion.div 
      ref={containerRef} 
      className="relative w-full max-w-6xl mx-auto hidden md:block my-20"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ staggerChildren: 0.1 }}
    >
      
      {/* Container Box */}
      <motion.div className="relative bg-[#0a0a0c] border border-white/10 rounded-3xl p-12 overflow-hidden shadow-2xl">
        
        {/* Background Grid & Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.08)_0%,transparent_70%)] opacity-70" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
             backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
             backgroundSize: '24px 24px'
          }}
        />

        {/* Labels */}
        <motion.div 
            className="absolute top-8 left-8 text-xs font-mono text-zinc-500 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
        >
          // Execution_Flow_V1
        </motion.div>
        <motion.div 
            className="absolute top-8 right-8 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
        >
          <div className="w-2 h-2 bg-lime-500 rounded-full shadow-[0_0_10px_#22c55e]" />
          <span className="text-xs font-mono text-zinc-500 font-bold tracking-widest">LIVE</span>
        </motion.div>

        {/* Main Diagram */}
        <div className="relative z-10 flex items-center justify-between px-4 mt-8">
          
          {/* 1. FUNDING NODE (Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 }}}
            className="flex flex-col items-center gap-5 group"
          >
            <motion.div className="w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center relative shadow-xl transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-5px_#3b82f6]">
              <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">$</div>
              <span className="font-mono text-zinc-300 text-3xl font-bold">USDC</span>
            </motion.div>
            <div className="text-center">
              <div className="text-sm font-bold text-white tracking-wider mb-1">FUNDING</div>
              <div className="text-xs text-zinc-500 font-mono">Backers Deposit</div>
            </div>
          </motion.div>

          {/* Connector 1 */}
          <svg className="h-px w-24 bg-transparent mx-4 overflow-visible">
            <motion.line x1="0" y1="0" x2="100%" y2="0" stroke="#444" strokeWidth="2" variants={lineVariants}/>
          </svg>

          {/* 2. SMART CONTRACT (Center) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 }}}
            className="flex flex-col items-center gap-5 group"
          >
             <motion.div className="w-36 h-36 bg-[#0e0e10] border border-amber-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)] transition-all duration-300 group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_-5px_#f59e0b]">
                <Icons.Lock className="text-amber-500 w-14 h-14" />
             </motion.div>
             <div className="text-center">
               <div className="text-sm font-bold text-amber-500 tracking-wider mb-1">SMART CONTRACT</div>
               <div className="text-xs text-zinc-500 font-mono">Awaits Resolution</div>
             </div>
          </motion.div>

          {/* Connector 2 (Split) */}
          <div className="h-32 w-24 relative mx-4 overflow-visible">
              <svg width="100%" height="100%" viewBox="0 0 96 128">
                <motion.path d="M0 64 C 40 64, 56 24, 96 16" stroke="#444" strokeWidth="2" fill="transparent" variants={lineVariants} />
                <motion.path d="M0 64 C 40 64, 56 104, 96 112" stroke="#444" strokeWidth="2" fill="transparent" variants={lineVariants} />
              </svg>
               <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 2}} className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 border border-lime-500/50 bg-lime-950 rounded-full text-[10px] text-lime-400 font-bold">IF "YES"</motion.div>
               <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 2}} className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 border border-red-500/50 bg-red-950 rounded-full text-[10px] text-red-400 font-bold">IF "NO"</motion.div>
          </div>


          {/* 3. OUTPUT NODES (Right - Wide Layout) */}
          <div className="flex flex-col gap-6">
            
            {/* Creator Paid Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 }}}
              className="flex flex-row items-center gap-5 w-80 p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl group transition-all duration-300 hover:border-lime-500/50 hover:shadow-[0_0_30px_-5px_#84cc16]"
            >
              <motion.div className="w-12 h-12 rounded-full bg-lime-950/30 border border-lime-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_-3px_rgba(132,204,22,0.3)] transition-all duration-300 ">
                 <Icons.Check className="text-lime-500 w-6 h-6" />
              </motion.div>
              <div className="text-left">
                 <div className="text-sm font-bold text-lime-400 tracking-wide">CREATOR PAID</div>
                 <div className="text-xs text-zinc-500 font-mono mt-1">Funds Released</div>
              </div>
            </motion.div>

            {/* Refunded Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1.1 }}
               whileHover={{ scale: 1.02, transition: { duration: 0.2 }}}
              className="flex flex-row items-center gap-5 w-80 p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl group transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_0_30px_-5px_#ef4444]"
            >
               <motion.div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] transition-all duration-300">
                  <Icons.X className="text-red-500 w-6 h-6" />
               </motion.div>
               <div className="text-left">
                  <div className="text-sm font-bold text-red-400 tracking-wide">REFUNDED</div>
                  <div className="text-xs text-zinc-500 font-mono mt-1">100% Returned</div>
               </div>
            </motion.div>

          </div>

        </div>
      </motion.div>
    </motion.div>
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
      <main className="min-h-screen bg-[#09090b] selection:bg-lime-500/20 selection:text-lime-200 overflow-hidden">
        
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
