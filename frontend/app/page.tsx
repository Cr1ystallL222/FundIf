// app/page.tsx
'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  MouseEvent as ReactMouseEvent,
  useMemo,
} from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { CampaignFactoryABI } from '@/lib/contracts/abis';
import { CAMPAIGN_FACTORY_ADDRESS } from '@/lib/contracts/addresses';
import CampaignCard from '@/components/campaign/CampaignCard';
import { motion, AnimatePresence, Variants, useInView } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TooltipState {
  content: string;
  x: number;
  y: number;
  visible: boolean;
  id: string;
}

interface TooltipContextValue {
  showTooltip: (id: string, content: string, x: number, y: number) => void;
  hideTooltip: (id: string) => void;
  tooltipState: TooltipState;
}

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

// ============================================================================
// ANIMATION VARIANTS - Orchestrated Motion Design
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

const heroTitleVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const statsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.4,
    },
  },
};

const statItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};

const iconSpinVariants: Variants = {
  rest: { rotate: 0 },
  hover: {
    rotate: 360,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 4,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.96,
    transition: {
      duration: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const errorIconVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
};

const floatVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// TOOLTIP CONTEXT & PROVIDER
// ============================================================================

const TooltipContext = createContext<TooltipContextValue | null>(null);

function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    content: '',
    x: 0,
    y: 0,
    visible: false,
    id: '',
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = useCallback((id: string, content: string, x: number, y: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setTooltipState({
        content,
        x,
        y,
        visible: true,
        id,
      });
    }, 400);
  }, []);

  const hideTooltip = useCallback((id: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTooltipState((prev) => {
      if (prev.id === id) {
        return { ...prev, visible: false };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip, tooltipState }}>
      {children}
      <TooltipRenderer />
    </TooltipContext.Provider>
  );
}

function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}

function TooltipRenderer() {
  const { tooltipState } = useTooltip();

  return (
    <AnimatePresence>
      {tooltipState.visible && (
        <motion.div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltipState.x,
            top: tooltipState.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className="relative px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 
                       shadow-xl shadow-black/40 backdrop-blur-sm max-w-xs"
          >
            <p className="text-xs font-medium text-white whitespace-nowrap">
              {tooltipState.content}
            </p>
            {/* Tooltip Arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 
                         border-l-[6px] border-l-transparent
                         border-r-[6px] border-r-transparent
                         border-t-[6px] border-t-zinc-900"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// CUSTOM HOOK - Tooltip Trigger
// ============================================================================

function useTooltipTrigger(id: string, content: string) {
  const { showTooltip, hideTooltip } = useTooltip();

  const handleMouseEnter = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      showTooltip(id, content, x, y);
    },
    [id, content, showTooltip]
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip(id);
  }, [id, hideTooltip]);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
}

// ============================================================================
// SVG ICON COMPONENTS - High-Fidelity Custom Icons
// ============================================================================

function PlusIcon({ className = '', size = 20, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronDownIcon({ className = '', size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ShieldCheckIcon({ className = '', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function EyeIcon({ className = '', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CurrencyIcon({ className = '', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12" />
      <path d="M15 9.5c-.5-1-1.5-1.5-3-1.5s-2.5.5-3 1.5.5 2 3 2.5 3.5 1 3 2.5-.5 1.5-3 1.5-2.5-.5-3-1.5" />
    </svg>
  );
}

function AlertTriangleIcon({ className = '', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function BoxIcon({ className = '', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function RefreshIcon({ className = '', size = 20, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function SparklesIcon({ className = '', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.09 3.27L16.36 7.5l-3.27 1.09L12 12l-1.09-3.41L7.64 7.5l3.27-1.23L12 3z" />
      <path d="M19 9l.5 1.5L21 11l-1.5.5L19 13l-.5-1.5L17 11l1.5-.5L19 9z" />
      <path d="M5 15l.5 1.5L7 17l-1.5.5L5 19l-.5-1.5L3 17l1.5-.5L5 15z" />
    </svg>
  );
}

function RocketIcon({ className = '', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function UsersIcon({ className = '', size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function InfoIcon({ className = '', size = 14, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CheckCircleIcon({ className = '', size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ArrowRightIcon({ className = '', size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ZapIcon({ className = '', size = 20, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function GlobeIcon({ className = '', size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

// ============================================================================
// SKELETON COMPONENTS - Pixel-Perfect Loading States
// ============================================================================

function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] rounded ${className}`}
      variants={shimmerVariants}
      animate="animate"
    />
  );
}

function CampaignCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      className="glass-panel p-6 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Card Header - Title & Badge */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-6 w-3/4" />
          <SkeletonPulse className="h-4 w-1/2" />
        </div>
        <SkeletonPulse className="h-6 w-16 rounded-full" />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-4 w-16" />
        </div>
        <SkeletonPulse className="h-2 w-full rounded-full" />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 mb-4">
        <SkeletonPulse className="h-4 w-20" />
        <SkeletonPulse className="h-4 w-24" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <SkeletonPulse className="h-4 w-28" />
        <SkeletonPulse className="h-6 w-20 rounded-full" />
      </div>
    </motion.div>
  );
}

function StatsSkeleton() {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-8 pt-8 border-t border-white/5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {[...Array(3)].map((_, i) => (
        <motion.div key={i} className="text-center" variants={itemVariants}>
          <SkeletonPulse className="h-8 w-16 mx-auto mb-2" />
          <SkeletonPulse className="h-4 w-24 mx-auto" />
        </motion.div>
      ))}
    </motion.div>
  );
}

function HeroSkeleton() {
  return (
    <div className="glass-panel p-8 sm:p-12 lg:p-16 space-y-8">
      <div className="space-y-4">
        <SkeletonPulse className="h-16 w-48 mx-auto" />
        <SkeletonPulse className="h-6 w-full max-w-xl mx-auto" />
        <SkeletonPulse className="h-6 w-3/4 max-w-md mx-auto" />
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <SkeletonPulse className="h-14 w-48 rounded-lg" />
        <SkeletonPulse className="h-14 w-40 rounded-lg" />
      </div>
      <StatsSkeleton />
    </div>
  );
}

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

function ErrorState({
  title = 'Failed to Load Campaigns',
  message = 'There was an error fetching campaign data. Please check your connection and try again.',
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  const retryButtonTooltip = useTooltipTrigger('retry-btn', 'Click to retry loading campaigns');

  return (
    <motion.div
      className="glass-panel p-8 sm:p-12 text-center max-w-lg mx-auto overflow-hidden relative"
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none"
        variants={pulseVariants}
        animate="animate"
      />

      {/* Error Icon Container */}
      <motion.div
        className="relative w-20 h-20 mx-auto mb-6"
        variants={errorIconVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-red-500/10 border border-red-500/20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Inner Circle */}
        <div className="absolute inset-2 rounded-full bg-red-500/15 flex items-center justify-center">
          <AlertTriangleIcon className="text-red-400" size={32} strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Error Title */}
      <motion.h3
        className="text-xl font-semibold text-white mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {title}
      </motion.h3>

      {/* Error Message */}
      <motion.p
        className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {message}
      </motion.p>

      {/* Retry Button */}
      <motion.button
        onClick={onRetry}
        disabled={isRetrying}
        className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-medium 
                   disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        variants={buttonVariants}
        initial="rest"
        whileHover={isRetrying ? 'rest' : 'hover'}
        whileTap={isRetrying ? 'rest' : 'tap'}
        onMouseEnter={retryButtonTooltip.onMouseEnter}
        onMouseLeave={retryButtonTooltip.onMouseLeave}
      >
        <motion.span
          animate={isRetrying ? { rotate: 360 } : { rotate: 0 }}
          transition={isRetrying ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <RefreshIcon size={18} strokeWidth={2} />
        </motion.span>
        <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
      </motion.button>

      {/* Technical Details */}
      <motion.div
        className="mt-8 pt-6 border-t border-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-zinc-600 font-mono">
          Error Code: NETWORK_ERROR • Contract:{' '}
          <span className="text-zinc-500">
            {CAMPAIGN_FACTORY_ADDRESS?.slice(0, 6)}...{CAMPAIGN_FACTORY_ADDRESS?.slice(-4)}
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyState() {
  const createButtonTooltip = useTooltipTrigger(
    'empty-create-btn',
    'Start your first crowdfunding campaign'
  );

  return (
    <motion.div
      className="glass-panel p-12 sm:p-16 text-center max-w-xl mx-auto relative overflow-hidden"
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient Glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
        variants={pulseVariants}
        animate="animate"
      />

      {/* Icon Container */}
      <motion.div
        className="relative w-24 h-24 mx-auto mb-8"
        variants={floatVariants}
        animate="animate"
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-blue-500/10 border border-blue-500/20"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="absolute inset-2 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <BoxIcon className="text-blue-400" size={40} strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-2xl font-semibold text-white mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        No Campaigns Yet
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-zinc-400 text-base leading-relaxed mb-8 max-w-md mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        Be the first to create a campaign and start raising funds for your cause on the blockchain.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
          <Link
            href="/create"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base font-medium"
            onMouseEnter={createButtonTooltip.onMouseEnter}
            onMouseLeave={createButtonTooltip.onMouseLeave}
          >
            <RocketIcon size={20} strokeWidth={2} />
            <span>Create First Campaign</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Helper Text */}
      <motion.div
        className="mt-10 flex items-center justify-center gap-2 text-xs text-zinc-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <CheckCircleIcon size={14} className="text-emerald-500" />
        <span>No wallet connection required to browse</span>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: 'blue' | 'emerald' | 'purple';
  index: number;
  tooltipContent: string;
}

function FeatureCard({
  icon,
  title,
  description,
  accentColor,
  index,
  tooltipContent,
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });

  const tooltip = useTooltipTrigger(
    `feature-${title.toLowerCase().replace(/\s/g, '-')}`,
    tooltipContent
  );

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      glow: 'bg-blue-500/20',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'bg-emerald-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'bg-purple-500/20',
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <motion.div
      ref={cardRef}
      className="glass-panel p-6 text-center relative overflow-hidden group cursor-pointer
                 border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-300"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      onMouseEnter={tooltip.onMouseEnter}
      onMouseLeave={tooltip.onMouseLeave}
    >
      {/* Background Glow */}
      <motion.div
        className={`absolute inset-0 ${colors.glow} opacity-0 group-hover:opacity-30 
                    blur-2xl transition-opacity duration-500 pointer-events-none`}
      />

      {/* Icon Container */}
      <motion.div
        className={`relative w-14 h-14 mx-auto mb-5 rounded-xl ${colors.bg} ${colors.border} 
                    border flex items-center justify-center`}
        variants={iconSpinVariants}
        initial="rest"
        whileHover="hover"
      >
        <span className={colors.text}>{icon}</span>
      </motion.div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2 relative">{title}</h3>

      {/* Description */}
      <p className="text-sm text-zinc-400 leading-relaxed relative">{description}</p>

      {/* Learn More Link */}
      <motion.div
        className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ y: 8 }}
        whileHover={{ y: 0 }}
      >
        <span className={`inline-flex items-center gap-1 text-sm ${colors.text}`}>
          Learn more
          <ArrowRightIcon size={14} />
        </span>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// STAT DISPLAY COMPONENT
// ============================================================================

interface StatDisplayProps {
  value: string | number;
  label: string;
  color?: 'blue' | 'white' | 'emerald';
  index: number;
}

function StatDisplay({ value, label, color = 'white', index }: StatDisplayProps) {
  const tooltip = useTooltipTrigger(
    `stat-${label.toLowerCase().replace(/\s/g, '-')}`,
    `${label}: ${value}`
  );

  const textColorClass = {
    blue: 'text-blue-400',
    white: 'text-white',
    emerald: 'text-emerald-400',
  }[color];

  return (
    <motion.div
      className="text-center group cursor-default"
      variants={statItemVariants}
      onMouseEnter={tooltip.onMouseEnter}
      onMouseLeave={tooltip.onMouseLeave}
    >
      <motion.p
        className={`text-3xl sm:text-4xl font-bold ${textColorClass} mb-1`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.6 + index * 0.15,
        }}
      >
        {value}
      </motion.p>
      <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">{label}</p>
    </motion.div>
  );
}

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================

interface HeroSectionProps {
  campaignCount: number;
  isLoading: boolean;
}

function HeroSection({ campaignCount, isLoading }: HeroSectionProps) {
  const createButtonTooltip = useTooltipTrigger(
    'hero-create-btn',
    'Launch your own crowdfunding campaign on the blockchain'
  );

  const exploreTooltip = useTooltipTrigger(
    'hero-explore-btn',
    'Browse active campaigns and find causes to support'
  );

  if (isLoading) {
    return <HeroSkeleton />;
  }

  return (
    <motion.div
      className="glass-panel p-8 sm:p-12 lg:p-16 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left Sparkle */}
        <motion.div
          className="absolute top-8 left-8 text-blue-400/30"
          variants={floatVariants}
          animate="animate"
        >
          <SparklesIcon size={24} />
        </motion.div>

        {/* Bottom-right Sparkle */}
        <motion.div
          className="absolute bottom-8 right-8 text-purple-400/30"
          variants={floatVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
        >
          <ZapIcon size={20} />
        </motion.div>
      </div>

      <div className="space-y-8 relative">
        {/* Brand Badge */}
        <motion.div className="flex justify-center" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                       bg-blue-500/10 border border-blue-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlobeIcon size={14} className="text-blue-400" />
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
              Decentralized Crowdfunding
            </span>
          </motion.div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white text-center tracking-tight"
          variants={heroTitleVariants}
        >
          FundIf
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto text-center leading-relaxed"
          variants={itemVariants}
        >
          Decentralized crowdfunding powered by smart contracts. Launch your campaign with
          transparent, trustless funding on the blockchain.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          variants={itemVariants}
        >
          {/* Primary CTA */}
          <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
            <Link
              href="/create"
              className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold"
              onMouseEnter={createButtonTooltip.onMouseEnter}
              onMouseLeave={createButtonTooltip.onMouseLeave}
            >
              <PlusIcon size={20} strokeWidth={2.5} />
              <span>Start a Campaign</span>
            </Link>
          </motion.div>

          {/* Secondary CTA */}
          <motion.a
            href="#campaigns"
            className="inline-flex items-center gap-2 px-6 py-4 text-zinc-400 
                       hover:text-white transition-colors duration-200 group"
            whileHover={{ y: 2 }}
            onMouseEnter={exploreTooltip.onMouseEnter}
            onMouseLeave={exploreTooltip.onMouseLeave}
          >
            <span className="text-base font-medium">Explore Campaigns</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDownIcon size={18} className="text-zinc-500 group-hover:text-white" />
            </motion.span>
          </motion.a>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 sm:gap-12 pt-8 border-t border-white/5"
          variants={statsContainerVariants}
        >
          <StatDisplay value={campaignCount} label="Active Campaigns" color="blue" index={0} />
          <StatDisplay value="100%" label="On-Chain" color="emerald" index={1} />
          <StatDisplay value="0%" label="Platform Fee" color="white" index={2} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// CAMPAIGNS SECTION COMPONENT
// ============================================================================

interface CampaignsSectionProps {
  campaigns: readonly string[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function CampaignsSection({ campaigns, isLoading, isError, onRetry }: CampaignsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      onRetry();
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="campaigns"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                       bg-white/5 border border-white/10 mb-4"
            whileHover={{ scale: 1.02 }}
          >
            <UsersIcon size={14} className="text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Community Funded
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Active Campaigns
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Support causes you believe in with transparent, blockchain-powered crowdfunding.
          </p>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(6)].map((_, index) => (
                <CampaignCardSkeleton key={index} index={index} />
              ))}
            </motion.div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ErrorState
                title="Failed to Load Campaigns"
                message="We couldn't fetch the campaigns from the blockchain. This might be due to a network issue or the smart contract being unavailable."
                onRetry={handleRetry}
                isRetrying={isRetrying}
              />
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && campaigns.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <EmptyState />
            </motion.div>
          )}

          {/* Campaign Grid */}
          {!isLoading && !isError && campaigns.length > 0 && (
            <motion.div
              key="campaigns"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {campaigns.map((campaignAddress, index) => (
                <motion.div
                  key={campaignAddress}
                  variants={itemVariants}
                  custom={index}
                >
                  <CampaignCard campaignAddress={campaignAddress} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View All Link (when campaigns exist) */}
        {!isLoading && !isError && campaigns.length > 6 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
              <Link
                href="/campaigns"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg 
                           bg-white/5 border border-white/10 text-white font-medium
                           hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              >
                <span>View All Campaigns</span>
                <ArrowRightIcon size={16} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION COMPONENT
// ============================================================================

function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const features = [
    {
      icon: <ShieldCheckIcon size={28} strokeWidth={1.5} />,
      title: 'Trustless & Secure',
      description:
        'Smart contracts ensure funds are handled securely without intermediaries. Your contributions are protected by code.',
      accentColor: 'emerald' as const,
      tooltipContent: 'Protected by Ethereum smart contracts and cryptographic security',
    },
    {
      icon: <EyeIcon size={28} strokeWidth={1.5} />,
      title: 'Fully Transparent',
      description:
        'All transactions are visible on-chain. Track every contribution in real-time with complete auditability.',
      accentColor: 'blue' as const,
      tooltipContent: 'Every transaction is recorded on the public blockchain',
    },
    {
      icon: <CurrencyIcon size={28} strokeWidth={1.5} />,
      title: 'Zero Platform Fees',
      description:
        '100% of your contribution goes directly to the campaign. No hidden fees, no middlemen taking a cut.',
      accentColor: 'purple' as const,
      tooltipContent: 'You only pay network gas fees, no platform commission',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                       bg-white/5 border border-white/10 mb-4"
            whileHover={{ scale: 1.02 }}
          >
            <ZapIcon size={14} className="text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Why Choose FundIf
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Built for Trust
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Experience the future of fundraising with blockchain-native features.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accentColor={feature.accentColor}
              index={index}
              tooltipContent={feature.tooltipContent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// BACKGROUND EFFECTS COMPONENT
// ============================================================================

function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary Gradient Orb */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary Gradient Orb */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/6 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
          x: [0, -40, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Tertiary Accent Orb */}
      <motion.div
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function Home() {
  // Fetch campaigns from smart contract
  const {
    data: campaigns,
    isLoading,
    isError,
    refetch,
  } = useReadContract({
    address: CAMPAIGN_FACTORY_ADDRESS as `0x${string}`,
    abi: CampaignFactoryABI,
    functionName: 'getCampaigns',
  });

  // Reverse to show newest campaigns first
  const sortedCampaigns = useMemo(() => {
    if (!campaigns || !Array.isArray(campaigns)) return [];
    return [...campaigns].reverse();
  }, [campaigns]);

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-[#09090b] relative overflow-hidden">
        {/* Animated Background Effects */}
        <BackgroundEffects />

        {/* Main Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <HeroSection campaignCount={sortedCampaigns.length} isLoading={isLoading} />
              </motion.div>
            </div>
          </section>

          {/* Campaigns Section */}
          <CampaignsSection
            campaigns={sortedCampaigns}
            isLoading={isLoading}
            isError={isError}
            onRetry={handleRetry}
          />

          {/* Features Section */}
          <FeaturesSection />

          {/* Bottom CTA Section */}
          <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
                  Ready to Start Fundraising?
                </h2>
                <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                  Launch your campaign in minutes. No middlemen, no hidden fees, just you and your
                  supporters.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Link
                      href="/create"
                      className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold"
                    >
                      <RocketIcon size={20} strokeWidth={2} />
                      <span>Create Your Campaign</span>
                    </Link>
                  </motion.div>

                  <motion.div
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Link
                      href="/docs"
                      className="btn-secondary inline-flex items-center gap-2 px-6 py-4 text-base font-medium"
                    >
                      <InfoIcon size={18} />
                      <span>Learn More</span>
                    </Link>
                  </motion.div>
                </div>

                {/* Trust Indicators */}
                <motion.div
                  className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-white/5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <CheckCircleIcon size={16} className="text-emerald-500" />
                    <span>No wallet required to browse</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <CheckCircleIcon size={16} className="text-emerald-500" />
                    <span>Open source & audited</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <CheckCircleIcon size={16} className="text-emerald-500" />
                    <span>Powered by Ethereum</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>
    </TooltipProvider>
  );
}