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
import { FallingPattern } from '@/components/ui/falling-pattern';
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
            className="fixed z-[9999] pointer-events-none px-3 py-2 rounded-md border border-lime-400/30 bg-[#111113] shadow-[0_0_30px_-10px_rgba(34,197,94,0.2)]"
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
// 6. COMPONENT: PROCESS TRACK
// ============================================================================

const ProcessCard = ({ number, title, desc, icon: Icon }: { number: string, title: string, desc: string, icon: any }) => (
  <Reveal className="flex gap-8 relative group">
    {/* Left Column: Number & Line */}
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-md bg-[#111] border border-zinc-800 flex items-center justify-center text-sm font-mono text-zinc-500 group-hover:border-lime-400 group-hover:text-lime-400 transition-colors duration-300 z-10">
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
// 7. COMPONENT: INTERACTIVE VALUE PROPS (Skew Cards)
// ============================================================================

const ValueCard = ({ icon: Icon, title, desc, gradientFrom, gradientTo }: { icon: any, title: string, desc: string, gradientFrom: string, gradientTo: string }) => (
  <Reveal>
    <div className="group relative w-full md:w-[320px] h-[400px] transition-all duration-500">
      {/* Skewed gradient panels */}
      <span
        className="absolute top-0 left-[50px] w-1/2 h-full rounded-lg transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      <span
        className="absolute top-0 left-[50px] w-1/2 h-full rounded-lg transform skew-x-[15deg] blur-[30px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      {/* Animated blurs */}
      <span className="pointer-events-none absolute inset-0 z-10">
        <span className="absolute top-0 left-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-100 animate-blob group-hover:top-[-50px] group-hover:left-[50px] group-hover:w-[100px] group-hover:h-[100px] group-hover:opacity-100" />
        <span className="absolute bottom-0 right-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-500 animate-blob animation-delay-1000 group-hover:bottom-[-50px] group-hover:right-[50px] group-hover:w-[100px] group-hover:h-[100px] group-hover:opacity-100" />
      </span>

      {/* Content */}
      <div className="relative z-20 left-0 p-[20px_40px] bg-[rgba(9,9,11,0.85)] backdrop-blur-[10px] shadow-lg rounded-lg text-white border border-white/5 transition-all duration-500 group-hover:left-[-25px] group-hover:p-[60px_40px] h-full flex flex-col">
        <div className="mb-6 w-12 h-12 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors border border-white/10">
          <Icon className="text-white transition-colors w-6 h-6" />
        </div>
        <h4 className="text-2xl font-bold mb-3 text-white">{title}</h4>
        <p className="text-base leading-relaxed mb-4 flex-1 text-zinc-200">{desc}</p>
      </div>
    </div>
  </Reveal>
);

// ============================================================================
// 8. MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <TooltipProvider>
      <main className="min-h-screen bg-[#09090b] selection:bg-lime-400/20 selection:text-lime-200 overflow-hidden">
        
        {/* Hero Section */}
        <div className="relative w-full h-screen bg-black overflow-hidden">
          <FallingPattern
            color="#a3e635"
            backgroundColor="#000000"
            duration={150}
            blurIntensity="1em"
            density={1}
            className="absolute inset-0"
          />

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center w-full px-4">
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
                className="text-xl text-zinc-400 max-w-xl leading-relaxed mb-12 mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                A crowdfunding protocol tied to reality. Funds held in escrow and unlock <span className="text-white font-semibold">only</span> if a specific prediction market event resolves to <span className="text-lime-400 font-semibold">YES</span>.
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                <Link href="/create" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-sm font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-3 text-base">
                    Create Campaign
                    <CornerDownRight className="opacity-70" />
                  </button>
                </Link>

                <a
                  href="https://github.com/loganstaples/FundIf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <button className="w-full sm:w-auto px-10 py-5 bg-transparent border border-zinc-700 text-zinc-300 font-medium rounded-sm hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-3 text-base">
                    Read Protocol Docs
                    <ArrowRight className="opacity-50" />
                  </button>
                </a>
              </motion.div>
            </div>
          </div>

          {/* Gradient Mask */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-30" />
        </div>

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
            
            <div className="flex justify-center items-start flex-wrap py-10">
              <div className="m-4 md:m-[40px_30px]">
                <ValueCard 
                  icon={GitBranch}
                  title="Conditional Triggers"
                  desc="Fund a cause ONLY if a specific event happens. Like donating to a legal defense fund only if charges are filed. This isn't about verifying milestones; it's about programmatic contingency."
                  gradientFrom="#1e293b"
                  gradientTo="#1a2e05"
                />
              </div>
              <div className="m-4 md:m-[40px_30px]">
                <ValueCard 
                  icon={IdCard}
                  title="Identity & Transparency"
                  desc="Powered by Basenames. You see exactly who you are funding. The contract is verified and open-source, ensuring that once the campaign starts, the creator has zero control over the funds."
                  gradientFrom="#312e81"
                  gradientTo="#1a2e05"
                />
              </div>
              <div className="m-4 md:m-[40px_30px]">
                <ValueCard 
                  icon={Shield}
                  title="Guaranteed Refunds"
                  desc="There is no middleman to beg for a refund. If the Polymarket oracle resolves the event to NO, the smart contract automatically unlocks 100% of funds for backers to claim."
                  gradientFrom="#064e3b"
                  gradientTo="#1a2e05"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: PROCESS TIMELINE */}
        <section className="py-32 px-6 bg-gradient-to-b from-[#09090b] to-[#000]">
          <div className="max-w-4xl mx-auto">
            <Reveal className="mb-20 text-center">
               <h2 className="text-3xl font-bold text-white">System Operations</h2>
               <div className="h-1 w-20 bg-lime-400 mx-auto mt-4 rounded-full" />
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

        {/* SECTION: ABOUT FUNDIF */}
        <section className="py-32 px-6 bg-gradient-to-b from-[#000] to-[#09090b]">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-20 text-center" delay={0}>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                What is <span className="text-lime-400 animate-pulse-slow">FundIf</span>?
              </h2>
              <div className="h-1 w-20 bg-lime-400 mx-auto mt-4 rounded-full animate-expand" />
            </Reveal>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <Reveal className="order-2 md:order-1" delay={0.2}>
                <div className="glass-panel p-8 md:p-10 group hover:scale-[1.02] transition-all duration-500 ease-out">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <CircleDollarSign className="text-lime-400 group-hover:rotate-12 transition-transform duration-300" />
                    Revolutionary Crowdfunding
                  </h3>
                  <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                    FundIf transforms crowdfunding by eliminating trust issues. Instead of hoping creators deliver on their promises, your funds are <span className="text-lime-400 font-semibold relative group-hover:text-lime-300 transition-colors duration-300">programmatically locked</span> and only released when real-world conditions are met.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-all duration-300">
                      <CheckCircle className="text-lime-400 mt-1 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <div>
                        <h4 className="text-white font-semibold mb-1 group-hover/item:text-lime-400 transition-colors duration-300">No More Broken Promises</h4>
                        <p className="text-zinc-400 text-sm">Funds are released automatically when conditions are met, not when creators say they're ready.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                      <CheckCircle className="text-lime-400 mt-1 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <div>
                        <h4 className="text-white font-semibold mb-1 group-hover/item:text-lime-400 transition-colors duration-300">Oracle-Powered Truth</h4>
                        <p className="text-zinc-400 text-sm">Powered by Polymarket and UMA oracles to verify real-world events with cryptographic certainty.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                      <CheckCircle className="text-lime-400 mt-1 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <div>
                        <h4 className="text-white font-semibold mb-1 group-hover/item:text-lime-400 transition-colors duration-300">Complete Transparency</h4>
                        <p className="text-zinc-400 text-sm">Every transaction, condition, and outcome is recorded on-chain for anyone to verify.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal className="order-1 md:order-2" delay={0.4}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 to-transparent blur-3xl group-hover:from-lime-400/30 transition-all duration-700" />
                  <div className="relative glass-panel p-8 md:p-10 border-lime-400/20 hover:border-lime-400/40 transition-all duration-500">
                    <h3 className="text-xl font-bold text-lime-400 mb-6 font-mono uppercase tracking-wider group-hover:tracking-widest transition-all duration-500">Key Features</h3>
                    <div className="space-y-6">
                      <div className="group feature-item">
                        <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-lime-400 transition-colors duration-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-lime-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-subtle" />
                          Conditional Funding Logic
                        </h4>
                        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                          Create campaigns that unlock funding only when specific events occur - elections, product launches, legal outcomes, or any verifiable real-world scenario.
                        </p>
                      </div>
                      <div className="group feature-item" style={{ animationDelay: '0.1s' }}>
                        <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-lime-400 transition-colors duration-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-lime-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-subtle" />
                          Automatic Refunds
                        </h4>
                        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                          If conditions aren't met, every contributor gets their funds back automatically. No begging, no disputes, no lost investments.
                        </p>
                      </div>
                      <div className="group feature-item" style={{ animationDelay: '0.2s' }}>
                        <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-lime-400 transition-colors duration-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-lime-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-subtle" />
                          Decentralized Governance
                        </h4>
                        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                          Built on blockchain technology with smart contracts that execute exactly as written, eliminating middlemen and reducing costs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal className="text-center" delay={0.6}>
              <div className="glass-panel-subtle p-8 md:p-10 max-w-4xl mx-auto group hover:scale-[1.01] transition-all duration-700">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-lime-400 transition-colors duration-500">
                  Ready to Fund the Future?
                </h3>
                <p className="text-zinc-300 text-lg mb-8 leading-relaxed group-hover:text-zinc-200 transition-colors duration-500">
                  Join thousands of users who are already using FundIf to create transparent, 
                  conditional crowdfunding campaigns that actually deliver results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/explore" className="group">
                    <button className="w-full sm:w-auto px-8 py-4 bg-lime-400 text-black font-semibold rounded-lg hover:bg-lime-300 hover:shadow-lg hover:shadow-lime-400/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2">
                      <span className="relative">
                        Explore Campaigns
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                    </button>
                  </Link>
                  <Link href="/create" className="group">
                    <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-lime-400/50 text-lime-400 font-semibold rounded-lg hover:bg-lime-400/10 hover:border-lime-400 hover:shadow-lg hover:shadow-lime-400/15 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2">
                      <span className="relative">
                        Start Your Campaign
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-400 group-hover:w-full transition-all duration-300"></span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                    </button>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Enhanced Tailwind custom utilities for animation */}
        <style>{`
          @keyframes blob {
            0%, 100% { transform: translateY(10px); }
            50% { transform: translate(-10px); }
          }
          
          @keyframes expand {
            from {
              width: 0;
              opacity: 0;
            }
            to {
              width: 5rem;
              opacity: 1;
            }
          }
          
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 1;
              filter: brightness(1);
            }
            50% {
              opacity: 0.8;
              filter: brightness(1.2);
            }
          }
          
          @keyframes pulse-subtle {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
          
          @keyframes slide-in-stagger {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .animate-blob { animation: blob 2s ease-in-out infinite; }
          .animation-delay-1000 { animation-delay: -1s; }
          .animate-expand { animation: expand 0.8s ease-out forwards; }
          .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
          .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
          
          .feature-item {
            animation: slide-in-stagger 0.6s ease-out forwards;
            opacity: 0;
          }
          
          .feature-item:nth-child(1) { animation-delay: 0.1s; }
          .feature-item:nth-child(2) { animation-delay: 0.2s; }
          .feature-item:nth-child(3) { animation-delay: 0.3s; }
          
          /* Performance optimizations */
          .glass-panel,
          .glass-panel-subtle {
            will-change: transform;
            backface-visibility: hidden;
            perspective: 1000px;
          }
          
          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            .animate-expand,
            .animate-pulse-slow,
            .animate-pulse-subtle,
            .feature-item {
              animation: none !important;
            }
          }
        `}</style>
      </main>
    </TooltipProvider>
  );
}
