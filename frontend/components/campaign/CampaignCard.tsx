'use client';

import Link from 'next/link';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
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

  return (
    <Link href={`/campaign/${campaignAddress}`} className="block">
      <article className="glass-panel p-6 space-y-4 hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
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

        {/* Progress Bar */}
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
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
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              progressPercent >= 100
                ? 'bg-secondary/20 text-secondary'
                : expired
                ? 'bg-border text-text-muted'
                : 'bg-primary/20 text-primary'
            }`}
          >
            {progressPercent >= 100
              ? '🎉 Fully Funded!'
              : `${progressPercent.toFixed(0)}% funded`}
          </span>
          {expired && progressPercent < 100 && (
            <span className="text-xs text-text-muted">Expired</span>
          )}
        </div>
      </article>
    </Link>
  );
}