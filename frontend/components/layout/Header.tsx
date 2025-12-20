'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@/components/wallet/ConnectButton';

// ============================================================================
// 1. ICONS
// ============================================================================

const ICON_PROPS = { strokeWidth: 1.5, className: "w-[18px] h-[18px]" };

const HomeIcon = () => (
  <svg {...ICON_PROPS} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExploreIcon = () => (
  <svg {...ICON_PROPS} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CreateIcon = () => (
  <svg {...ICON_PROPS} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DashboardIcon = () => (
  <svg {...ICON_PROPS} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="7" height="9" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="3" width="7" height="5" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="12" width="7" height="9" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="16" width="7" height="5" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocsIcon = () => (
  <svg {...ICON_PROPS} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WhitepaperIcon = () => (
  <svg {...ICON_PROPS} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg {...ICON_PROPS} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="4" x2="20" y1="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="4" x2="20" y1="6" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="4" x2="20" y1="18" y2="18" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg {...ICON_PROPS} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M18 6 6 18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6 18 18" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ============================================================================
// 2. UTILITIES
// ============================================================================

const Tooltip = ({ text, children }: { text: string; children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "circOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="px-3 py-1.5 bg-[#0c0c0e] border border-white/10 rounded-lg shadow-2xl backdrop-blur-xl">
              <span className="text-[11px] font-medium text-zinc-300 whitespace-nowrap">
                {text}
              </span>
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0c0c0e] border-t border-l border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HeaderSkeleton = () => (
  <div className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 bg-[#09090b] border-b border-zinc-800/50 flex items-center justify-center">
    <div className="w-full max-w-7xl px-6 flex items-center justify-between relative">
      {/* Logo Skeleton */}
      <div className="w-32 h-8 rounded bg-zinc-800 animate-pulse shimmer" />
      
      {/* Nav Skeleton (Centered) */}
      <div className="hidden md:flex gap-2 absolute left-1/2 -translate-x-1/2">
        {[1, 2, 3, 4].map(i => <div key={i} className="w-24 h-9 bg-zinc-900/60 animate-pulse rounded-full" />)}
      </div>
      
      {/* Wallet Skeleton */}
      <div className="w-32 h-10 bg-zinc-800 rounded-xl animate-pulse" />
    </div>
  </div>
);

const HeaderError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-red-950/90 backdrop-blur-md border-b border-red-900 flex items-center justify-center">
    <div className="flex items-center gap-4">
      <span className="text-xs font-mono text-red-200">UI_LOAD_FAILURE</span>
      <button 
        onClick={onRetry} 
        className="text-xs bg-red-900 hover:bg-red-800 px-3 py-1 rounded border border-red-700 text-white transition-colors"
      >
        RETRY
      </button>
    </div>
  </div>
);

// ============================================================================
// 3. CONFIG
// ============================================================================

const NAV_LINKS = [
  { href: '/', label: 'Home', Icon: HomeIcon, desc: 'Landing Page' },
  { href: '/explore', label: 'Explore', Icon: ExploreIcon, desc: 'Prediction Markets' },
  { href: '/create', label: 'Create', Icon: CreateIcon, desc: 'New Campaign' },
  { href: '/profile', label: 'Dashboard', Icon: DashboardIcon, authRequired: true, desc: 'Your Positions' },
  { href: '/docs', label: 'Docs', Icon: DocsIcon, desc: 'Documentation' },
  { href: '/whitepaper', label: 'Whitepaper', Icon: WhitepaperIcon, desc: 'Technical Paper' },
];

// ============================================================================
// 4. MAIN COMPONENT
// ============================================================================

export function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const pathname = usePathname();
  
  // Safe Wallet hook usage
  let isConnected = false;
  try {
    const account = useAccount();
    isConnected = !!account.isConnected;
  } catch (e) {
    isConnected = false;
  }

  // Robust Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 20, 1);
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fake Loading Sequence
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (isLoading) return <HeaderSkeleton />;

  const visibleLinks = NAV_LINKS.filter(l => !l.authRequired || isConnected);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Background Layer */}
      <div 
        className="absolute inset-0 backdrop-blur-xl bg-[#09090b] border-b transition-colors duration-100"
        style={{ 
          opacity: scrollProgress * 0.85,
          borderColor: `rgba(255,255,255,${scrollProgress * 0.08})`
        }}
      />
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full">
        <div className="relative flex items-center justify-between h-full">
          
          {/* LEFT: Brand Identity */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="group outline-none flex items-center gap-3"
              aria-label="FundIf Home"
            >
              <img
                src="/images/logo.png"
                alt="FundIf Logo"
                className="h-8 md:h-10 w-auto transition-opacity duration-300 group-hover:opacity-80"
              />
              <span className="text-2xl md:text-3xl font-bold tracking-tight font-display transition-colors duration-300">
                <span className="text-white">Fund</span>
                <span className="text-[#bef264]">If</span>
              </span>
            </Link>
          </div>

          {/* CENTER: Navigation (Absolutely Positioned to ensure true center) */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center p-1 bg-white/[0.02] border border-white/[0.05] rounded-full backdrop-blur-sm">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              
              return (
                <Tooltip key={link.href} text={link.desc}>
                  <Link
                    href={link.href}
                    className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/[0.05] shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <link.Icon />
                      {link.label}
                    </span>
                  </Link>
                </Tooltip>
              );
            })}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="hidden md:block">
              <ConnectButton />
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
               {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            
            <motion.div
              key="panel"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="absolute top-16 left-0 right-0 bg-[#09090b] border-b border-white/10 md:hidden z-50 shadow-2xl"
            >
              <div className="p-4 space-y-2">
                {visibleLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        pathname === link.href 
                          ? 'bg-white/5 border-white/10 text-white shadow-lg' 
                          : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${pathname === link.href ? 'bg-primary/10 text-primary' : 'bg-white/5 text-zinc-500'}`}>
                        <link.Icon />
                      </div>
                      <div>
                        <div className="font-medium">{link.label}</div>
                        <div className="text-xs text-zinc-500 font-mono">{link.desc}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pt-4 mt-4 border-t border-white/5"
                >
                  <ConnectButton />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;