// components/campaign/CampaignCard.tsx
'use client';

import Link from 'next/link';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { motion } from 'framer-motion';
import { CampaignABI } from '@/lib/contracts/abis';

interface CampaignCardProps {
  campaignAddress: string;
}

export default function CampaignCard({ campaignAddress }: CampaignCardProps) {
  const campaignContract = {
    address: campaignAddress as `0x${string}`,
    abi: CampaignABI,
  } as const;

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...campaignContract, functionName: 'title' },
      { ...campaignContract, functionName: 'goalAmount' },
      { ...campaignContract, functionName: 'totalFunded' },
      { ...campaignContract, functionName: 'deadline' },
      { ...campaignContract, functionName: 'recipient' },
    ],
  });

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDeadline = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (timestamp: bigint): boolean => {
    return Number(timestamp) * 1000 < Date.now();
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6 space-y-4">
        <div className="h-6 bg-border rounded animate-pulse w-3/4" />
        <div className="h-4 bg-border rounded animate-pulse w-1/2" />
        <div className="h-2 bg-border rounded-full animate-pulse w-full" />
        <div className="flex justify-between">
          <div className="h-4 bg-border rounded animate-pulse w-1/4" />
          <div className="h-4 bg-border rounded animate-pulse w-1/4" />
        </div>
        <div className="h-4 bg-border rounded animate-pulse w-1/3" />
      </div>
    );
  }

  const [titleResult, goalResult, fundedResult, deadlineResult, recipientResult] = data || [];

  const title = titleResult?.result as string | undefined;
  const goalAmount = goalResult?.result as bigint | undefined;
  const totalFunded = fundedResult?.result as bigint | undefined;
  const deadline = deadlineResult?.result as bigint | undefined;
  const recipient = recipientResult?.result as string | undefined;

  const progressPercent =
    goalAmount && totalFunded
      ? Math.min((Number(totalFunded) / Number(goalAmount)) * 100, 100)
      : 0;

  const formattedGoal = goalAmount ? formatUnits(goalAmount, 6) : '0';
  const formattedFunded = totalFunded ? formatUnits(totalFunded, 6) : '0';

  const expired = deadline ? isExpired(deadline) : false;
  const isFullyFunded = progressPercent >= 100;

  // Determine glow color based on state
  const getGlowColor = () => {
    if (isFullyFunded) return 'from-secondary via-green-400 to-secondary';
    if (expired) return 'from-gray-500 via-gray-400 to-gray-500';
    return 'from-primary via-purple-500 to-secondary';
  };

  return (
    <Link href={`/campaign/${campaignAddress}`} className="block">
      <motion.div
        className="relative group"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Animated Glow Border */}
        <motion.div
          className={`absolute -inset-[1px] rounded-[var(--radius-box)] bg-gradient-to-r ${getGlowColor()} opacity-0 blur-sm`}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.6 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />
        <motion.div
          className={`absolute -inset-[1px] rounded-[var(--radius-box)] bg-gradient-to-r ${getGlowColor()} opacity-0`}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />

        {/* Card Content */}
        <article className="relative glass-panel p-6 space-y-4 cursor-pointer bg-surface">
          {/* Title */}
          <h3 className="text-lg font-semibold text-text-main line-clamp-2 leading-tight">
            {title || 'Untitled Campaign'}
          </h3>

          {/* Recipient */}
          <p className="text-sm text-text-muted">
            by{' '}
            <span className="font-mono">
              {recipient ? truncateAddress(recipient) : '...'}
            </span>
          </p>

          {/* Progress Bar with Animation */}
          <div className="w-full h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-secondary to-green-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>

          {/* Funding Stats */}
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-secondary font-bold">
                ${Number(formattedFunded).toLocaleString()}
              </span>
              <span className="text-text-muted"> raised</span>
            </div>
            <div>
              <span className="text-primary font-bold">
                ${Number(formattedGoal).toLocaleString()}
              </span>
              <span className="text-text-muted"> goal</span>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <span className="text-text-muted">
              {expired ? 'Campaign ended' : 'Ends on'}
            </span>
            <span className={`font-medium ${expired ? 'text-text-muted' : 'text-primary'}`}>
              {deadline ? formatDeadline(deadline) : '...'}
            </span>
          </div>

          {/* Progress percentage badge */}
          <div className="flex items-center gap-2">
            <motion.span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                progressPercent >= 100
                  ? 'bg-secondary/20 text-secondary'
                  : expired
                  ? 'bg-border text-text-muted'
                  : 'bg-primary/20 text-primary'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {progressPercent >= 100
                ? '🎉 Fully Funded!'
                : `${progressPercent.toFixed(0)}% funded`}
            </motion.span>
            {expired && progressPercent < 100 && (
              <span className="text-xs text-text-muted">Expired</span>
            )}
          </div>

          {/* Subtle shine effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-[var(--radius-box)] pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </motion.div>
        </article>
      </motion.div>
    </Link>
  );
}