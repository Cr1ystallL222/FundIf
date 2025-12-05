'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { USDC_ADDRESS } from '@/lib/contracts/addresses';
import { ERC20ABI, CampaignABI } from '@/lib/contracts/abis';

/* ==========================================
   LOCAL ICONS
   ========================================== */
const Icons = {
  Wallet: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  Lock: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Spinner: ({ className }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
};

const USDC_DECIMALS = 6;

interface FundFormProps {
  campaignAddress: string;
  onSuccess?: () => void; // <--- ADDED THIS
}

export function FundForm({ campaignAddress, onSuccess }: FundFormProps) {
  const [amount, setAmount] = useState('');
  const { address, isConnected } = useAccount();

  const campaignAddr = campaignAddress as Address;
  const usdcAddr = USDC_ADDRESS as Address;

  // --- Wagmi Reads ---
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdcAddr,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddr,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, campaignAddr] : undefined,
    query: { enabled: !!address, refetchInterval: 2000 },
  });

  // --- Wagmi Writes ---
  const { 
    writeContract: writeApprove, 
    data: approveTxHash, 
    isPending: isApprovePending,
  } = useWriteContract();

  const { 
    isLoading: isApproveConfirming, 
    isSuccess: isApproveSuccess 
  } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { 
    writeContract: writeFund, 
    data: fundTxHash, 
    isPending: isFundPending,
    reset: resetFund 
  } = useWriteContract();

  const { 
    isLoading: isFundConfirming, 
    isSuccess: isFundSuccess 
  } = useWaitForTransactionReceipt({ hash: fundTxHash });

  // --- Logic ---
  const parsedAmount = useMemo(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return 0n;
    try { return parseUnits(amount, USDC_DECIMALS); } catch { return 0n; }
  }, [amount]);

  const needsApproval = useMemo(() => {
    if (parsedAmount === 0n) return false;
    if (isApproveSuccess) return false; 
    return parsedAmount > (allowance ?? 0n);
  }, [parsedAmount, allowance, isApproveSuccess]);

  // Effects
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

    useEffect(() => {
    if (isFundSuccess) {
      console.log("Fund Confirmed! Starting refresh sequence...");
      
      // 1. Reset Form State
      setAmount('');
      refetchBalance();
      refetchAllowance();
      resetFund();
      
      // 2. Trigger Parent Refresh (The "Hammer Strategy")
      if (onSuccess) {
        // Call immediately (might be too fast)
        onSuccess();
        
        // Call after 1 second
        setTimeout(() => {
          console.log("Refetching (1s)...");
          onSuccess();
        }, 1000);

        // Call after 3 seconds (usually catches it)
        setTimeout(() => {
          console.log("Refetching (3s)...");
          onSuccess();
        }, 3000);
        
        // Call after 5 seconds (just in case)
        setTimeout(() => {
          console.log("Refetching (5s)...");
          onSuccess();
        }, 5000);
      }
      
      alert("Successfully funded campaign!");
    }
  }, [isFundSuccess, refetchBalance, refetchAllowance, resetFund, onSuccess]);

  // Handlers
  const handleSubmit = () => {
    if (needsApproval) {
      writeApprove({
        address: usdcAddr,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [campaignAddr, parsedAmount],
      });
    } else {
      writeFund({
        address: campaignAddr,
        abi: CampaignABI,
        functionName: 'fund',
        args: [parsedAmount],
      });
    }
  };

  // State Derivation
  const isApproving = isApprovePending || isApproveConfirming;
  const isFunding = isFundPending || isFundConfirming;
  const isLoading = isApproving || isFunding;
  const formattedBalance = balance ? formatUnits(balance, USDC_DECIMALS) : '0';
  const isButtonDisabled = !isConnected || isLoading || parsedAmount === 0n;

  // --- UI Helpers ---
  const getButtonText = () => {
    if (isApprovePending) return 'Sign Approval...';
    if (isApproveConfirming) return 'Approving USDC...';
    if (isFundPending) return 'Sign Transaction...';
    if (isFundConfirming) return 'Sending Funds...';
    if (needsApproval) return 'Approve USDC';
    return 'Fund Campaign';
  };

  if (!isConnected) {
    return (
      <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-900/10 text-center">
        <Icons.Wallet className="mx-auto mb-2 text-yellow-500" />
        <p className="text-sm text-yellow-200 font-medium">Connect Wallet</p>
        <p className="text-xs text-yellow-500/80 mt-1">Please connect your wallet to participate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Input Group */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="text-zinc-400 font-medium ml-1">Funding Amount</label>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Icons.Wallet className="w-3 h-3" />
            <span>Balance: <span className="text-white font-mono">{formattedBalance}</span></span>
            <button 
              onClick={() => setAmount(formattedBalance)}
              className="text-blue-500 hover:text-blue-400 text-[10px] font-bold uppercase tracking-wide ml-1 transition-colors"
            >
              Max
            </button>
          </div>
        </div>
        
        <div className="relative group">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) {
                setAmount(e.target.value);
              }
            }}
            disabled={isLoading}
            className="w-full bg-zinc-900/80 border border-white/10 rounded-lg pl-4 pr-16 py-3 text-lg font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none">
            <span className="text-zinc-500 font-bold text-sm">USDC</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={!isButtonDisabled ? { scale: 1.02 } : {}}
        whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={isButtonDisabled}
        className={`w-full relative overflow-hidden h-12 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          isButtonDisabled 
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' 
            : needsApproval 
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/20 border border-white/10' 
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 border border-white/10'
        }`}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Icons.Spinner className="w-4 h-4" />
              <span>{getButtonText()}</span>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              {needsApproval ? <Icons.Lock /> : <Icons.Wallet />}
              <span>{getButtonText()}</span>
              {!isButtonDisabled && <Icons.ArrowRight className="opacity-60" />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Helper Text */}
      <p className="text-[10px] text-zinc-500 text-center leading-relaxed px-4">
        Funds are held in a smart contract escrow and only released if the outcome is YES. 
        Otherwise, you can claim a 100% refund.
      </p>
    </div>
  );
}