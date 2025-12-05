'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { useCapabilities, useWriteContracts } from 'wagmi/experimental';
import { parseUnits, formatUnits, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

// NEW: Direct Icon Imports (Fixes the Crash)
import { 
  Zap, 
  Wallet, 
  Check, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

import { USDC_ADDRESS } from '@/lib/contracts/addresses';
import { ERC20ABI, CampaignABI } from '@/lib/contracts/abis';

const USDC_DECIMALS = 6;
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL;

interface FundFormProps {
  campaignAddress: string;
  onSuccess?: () => void;
}

export function FundForm({ campaignAddress, onSuccess }: FundFormProps) {
  const [amount, setAmount] = useState('');
  const { address, isConnected, chain } = useAccount();

  const campaignAddr = campaignAddress as Address;
  const usdcAddr = USDC_ADDRESS as Address;

  // --- 1. READS ---
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdcAddr,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddr,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, campaignAddr] : undefined,
  });

  // --- 2. PAYMASTER / BATCHING SETUP ---
  const { data: capabilities } = useCapabilities({
    account: address,
  });

  const chainId = chain?.id || baseSepolia.id;
  const availableCapabilities = capabilities?.[chainId];
  const hasPaymaster = !!availableCapabilities?.paymasterService?.supported;

  const { 
    writeContracts, 
    data: batchId, 
    isPending: isBatchPending,
    isSuccess: isBatchSuccess 
  } = useWriteContracts();

  // --- 3. FALLBACK WRITES ---
  const { writeContract: writeApprove, isPending: isApprovePending } = useWriteContract();
  const { writeContract: writeFund, isPending: isFundPending } = useWriteContract();

  // --- MATH ---
  const parsedAmount = useMemo(() => {
    try { return amount ? parseUnits(amount, USDC_DECIMALS) : 0n; } catch { return 0n; }
  }, [amount]);

  const currentAllowance = allowance ?? 0n;
  const isInsufficientBalance = (balance ?? 0n) < parsedAmount;
  const needsApproval = parsedAmount > currentAllowance;

  // --- HANDLERS ---
  const handleGaslessSubmit = () => {
    const contracts = [];
    if (needsApproval) {
      contracts.push({
        address: usdcAddr,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [campaignAddr, parsedAmount],
      });
    }
    contracts.push({
      address: campaignAddr,
      abi: CampaignABI,
      functionName: 'fund',
      args: [parsedAmount],
    });

    writeContracts({
      contracts,
      capabilities: {
        paymasterService: {
          url: PAYMASTER_URL || ''
        }
      }
    });
  };

  const handleStandardSubmit = () => {
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

  const getButtonText = () => {
    if (isInsufficientBalance) return 'Insufficient Balance';
    if (isBatchPending) return 'Processing Gasless Tx...';
    if (hasPaymaster) return 'Fund (Gasless & One-Click)';
    if (isApprovePending) return 'Approving...';
    if (isFundPending) return 'Funding...';
    if (needsApproval) return 'Approve USDC';
    return 'Fund Campaign';
  };

  const formattedBalance = balance ? formatUnits(balance, USDC_DECIMALS) : '0';
  const isLoading = isBatchPending || isApprovePending || isFundPending;

  if (!isConnected) {
    return (
      <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-center">
        <Wallet className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
        <p className="text-sm text-yellow-200 font-medium">Connect Wallet to Fund</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Input Area */}
      <div className="relative group">
        <div className="flex justify-between mb-2 text-xs text-zinc-400">
          <span>Amount</span>
          <span>Balance: {formattedBalance}</span>
        </div>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-16 py-4 text-xl font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <div className="absolute right-4 top-10 -translate-y-1/2 text-zinc-400 font-bold text-sm">USDC</div>
      </div>

      {/* FUND BUTTON */}
      <button
        onClick={hasPaymaster ? handleGaslessSubmit : handleStandardSubmit}
        disabled={!isConnected || isInsufficientBalance || isLoading}
        className={`w-full h-14 rounded-xl font-bold text-lg shadow-lg transition-all flex flex-col items-center justify-center ${
          hasPaymaster 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Fixed Icons */}
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
             hasPaymaster ? <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : <Wallet className="w-5 h-5" />
          )}
          {getButtonText()}
        </div>
        
        {/* SUBTEXT FLEX */}
        {hasPaymaster && !isLoading && (
          <span className="text-[10px] opacity-90 font-medium tracking-wider uppercase mt-0.5">
            Network Cost: <span className="text-green-300">Sponsored</span>
          </span>
        )}
      </button>

      {/* Explainer */}
      {hasPaymaster && (
        <div className="text-center text-xs text-zinc-500">
          Using <b>Coinbase Smart Wallet</b> • Batch Transactions Enabled
        </div>
      )}
    </div>
  );
}