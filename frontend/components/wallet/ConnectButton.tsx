'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect, 
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Identity,
  Address,
} from '@coinbase/onchainkit/identity';
import { motion, AnimatePresence, Variants } from 'framer-motion';

/* ============================================
   1. CUSTOM ICON SYSTEM (Zero External Libs)
   ============================================ */

const IconWrapper = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-4 h-4 ${className}`}
  >
    {children}
  </svg>
);

const Icons = {
  Wallet: () => (
    <IconWrapper>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </IconWrapper>
  ),
  User: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  ),
  Chevron: () => (
    <IconWrapper>
      <path d="m6 9 6 6 6-6" />
    </IconWrapper>
  ),
  Alert: () => (
    <IconWrapper className="text-red-500">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </IconWrapper>
  ),
  Refresh: () => (
    <IconWrapper>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </IconWrapper>
  )
};

/* ============================================
   2. MICRO-COMPONENTS (Tooltip, Skeleton, Error)
   ============================================ */

// Cyber-Minimalist Tooltip
const CyberTooltip = ({ text, children }: { text: string, children: ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[700] px-2 py-1 
                       bg-[#0c0c0e] border border-white/10 rounded text-[10px] 
                       text-zinc-400 whitespace-nowrap shadow-xl pointer-events-none"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Pixel-Perfect Skeleton matching the button dimensions exactly
const WalletSkeleton = () => (
  <div className="h-[40px] w-[160px] rounded-lg relative overflow-hidden border border-white/5 bg-[#09090b]">
    <div className="absolute inset-0 flex items-center px-4 gap-3">
      <div className="w-5 h-5 rounded-full bg-zinc-800 shimmer" />
      <div className="h-3 w-20 rounded bg-zinc-800 shimmer" />
    </div>
    {/* Shimmer Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
  </div>
);

// Error State View
const ErrorView = ({ onRetry }: { onRetry: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="h-[40px] px-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
  >
    <Icons.Alert />
    <span className="font-medium">Connection Failed</span>
    <button 
      onClick={onRetry}
      className="ml-2 p-1 hover:bg-red-500/20 rounded transition-colors"
    >
      <Icons.Refresh />
    </button>
  </motion.div>
);

/* ============================================
   3. MAIN COMPONENT
   ============================================ */

export function ConnectButton() {
  // Simulate loading state for robust mounting (prevents hydration mismatch)
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mock retry handler
  const handleRetry = () => {
    setHasError(false);
    // In a real scenario, this might trigger a hook re-fetch
  };

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: [0.19, 1, 0.22, 1], // easeExpoOut
        staggerChildren: 0.1 
      }
    }
  };

  if (!isMounted) return <WalletSkeleton />;
  if (hasError) return <ErrorView onRetry={handleRetry} />;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-50"
    >
      <Wallet>
        <CyberTooltip text="Connect via CoinBase OnchainKit">
          <ConnectWallet 
            // White button with black icon
            className="
              group relative flex items-center gap-3 h-[40px] px-4 
              bg-white hover:bg-zinc-100
              border border-zinc-200 hover:border-zinc-300
              rounded-lg transition-all duration-300 ease-out
              text-zinc-900 font-medium text-sm
              shadow-sm hover:shadow-md
            "
          >
            <div className="flex items-center gap-2">
              <Icons.User className="w-5 h-5 text-zinc-900" />
              <Name className="text-sm font-sans tracking-tight text-zinc-900" />
            </div>
            
            {/* Custom Chevron Indicator */}
            <div className="opacity-50 group-hover:opacity-100 transition-opacity ml-1 text-zinc-900">
               <Icons.Chevron />
            </div>
          </ConnectWallet>
        </CyberTooltip>

        <WalletDropdown className="
          mt-2 w-[300px] p-0
          bg-[#0c0c0e]/95 backdrop-blur-xl
          border border-white/10 
          rounded-xl overflow-hidden
          shadow-2xl shadow-black/80
        ">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Identity Section */}
            <Identity className="p-4 bg-gradient-to-b from-white/5 to-transparent" hasCopyAddressOnClick>
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10 rounded-full ring-2 ring-white/10 shadow-lg" />
                <div className="flex flex-col">
                  <Name className="text-white font-semibold text-base" />
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Connected
                  </div>
                </div>
              </div>
              <Address className="text-xs text-zinc-400 font-mono bg-black/30 px-2 py-1 rounded border border-white/5" />
            </Identity>
            
            <div className="h-px w-full bg-white/5 my-0" />

            {/* Custom Footer / Actions */}
            <div className="p-2 bg-[#09090b]">
              <WalletDropdownDisconnect className="
                w-full flex items-center justify-center gap-2 h-9
                bg-red-500/5 hover:bg-red-500/10 
                text-red-500/80 hover:text-red-400
                text-xs font-medium rounded-md
                transition-colors border border-transparent hover:border-red-500/10
              " />
            </div>
          </motion.div>
        </WalletDropdown>
      </Wallet>
    </motion.div>
  );
}

export default ConnectButton;