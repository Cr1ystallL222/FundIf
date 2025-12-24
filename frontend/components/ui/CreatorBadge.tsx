'use client';

import { useEnsName } from 'wagmi';
import { type Address } from 'viem';

const Icons = {
  Shield: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Alert: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

export function CreatorBadge({ address, label = "Recipient" }: { address: Address; label?: string }) {
  // Resolves Basename on Base
  const { data: basename } = useEnsName({
    address,
    chainId: 84532, 
  });

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '...';

  if (basename) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
        <Icons.Shield className="w-3.5 h-3.5 text-blue-400 fill-blue-500/10" />
        <span className="font-bold text-xs text-blue-400">{basename}</span>
        <span className="text-[10px] text-blue-400/60 border-l border-blue-500/20 pl-2 uppercase tracking-wider">
          Verified {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/5 border border-yellow-500/20 rounded-full w-fit">
      <Icons.Alert className="w-3.5 h-3.5 text-yellow-600" />
      <span className="font-mono text-xs text-yellow-600/80">{shortAddress}</span>
      <span className="text-[10px] text-yellow-600/60 border-l border-yellow-500/20 pl-2 uppercase tracking-wider">
        Unverified
      </span>
    </div>
  );
}