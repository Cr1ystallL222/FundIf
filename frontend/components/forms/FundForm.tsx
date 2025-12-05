'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
// IMPORT EXPERIMENTAL HOOKS FOR PAYMASTER/BATCHING
import { useCapabilities, useWriteContracts } from 'wagmi/experimental';
import { parseUnits, formatUnits, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

import { USDC_ADDRESS } from '@/lib/contracts/addresses';
import { ERC20ABI, CampaignABI } from '@/lib/contracts/abis';
import { Icons } from '@/components/ui/Icons'; 

const USDC_DECIMALS = 6;

// ------------------------------------------------------------------
// 1. SETUP PAYMASTER URL
// Get this from: https://portal.cdp.coinbase.com/
// ------------------------------------------------------------------
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || ''; 

interface FundFormProps {
  campaignAddress: string;
  onSuccess?: () => void;
}

export function FundForm({ campaignAddress, onSuccess }: FundFormProps) {
  const [amount, setAmount] = useState('');
  const { address, isConnected, chain } = useAccount();

  const campaignAddr = campaignAddress as Address;
  const usdcAddr = USDC_ADDRESS as Address;

  // --- 1. Standard Wagmi Reads ---
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
    query: { enabled: !!address }, 
  });

  // --- 2. GASLESS / BATCHING SETUP (EIP-5792) ---
  
  // Check if connected wallet supports Paymaster (e.g. Coinbase Smart Wallet)
  const { data: capabilities } = useCapabilities({
    account: address,
  });

  const availableCapabilities = capabilities?.[chain?.id || baseSepolia.id];
  const hasPaymasterCapability = !!availableCapabilities?.paymasterService?.supported;

  // The Hook for Gasless/Batch Calls
  const { 
    writeContracts, 
    data: batchId, 
    isPending: isBatchPending,
    isSuccess: isBatchSent // Note: for writeContracts, logic is slightly different than writeContract
  } = useWriteContracts();

  // --- 3. STANDARD FALLBACK WRITES (MetaMask/EOA) ---
  
  const { 
    writeContract: writeApprove, 
    data: approveTxHash, 
    isPending: isApprovePending 
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


  // --- Logic & Math ---
  const parsedAmount = useMemo(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return 0n;
    try { return parseUnits(amount, USDC_DECIMALS); } catch { return 0n; }
  }, [amount]);

  const currentBalance = balance ?? 0n;
  const currentAllowance = allowance ?? 0n;
  const isInsufficientBalance = parsedAmount > currentBalance;

  // Do we need an approval transaction?
  // (Note: With Paymaster batching, we bundle approval + fund, so we don't check this for the button state)
  const needsApproval = useMemo(() => {
    if (parsedAmount === 0n) return false;
    if (isApproveSuccess) return false; 
    return parsedAmount > currentAllowance;
  }, [parsedAmount, currentAllowance, isApproveSuccess]);


  // --- Handlers ---

  // A. The "Magic" Handler (Gasless + Batch)
  const handleGaslessSubmit = () => {
    if (!PAYMASTER_URL) {
      console.error("Paymaster URL missing");
      return;
    }

    // Construct the batch
    const contracts = [];

    // 1. Add Approve if needed (Always safe to add in batch, but optimized to check first)
    if (parsedAmount > currentAllowance) {
      contracts.push({
        address: usdcAddr,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [campaignAddr, parsedAmount],
      });
    }

    // 2. Add Fund
    contracts.push({
      address: campaignAddr,
      abi: CampaignABI,
      functionName: 'fund',
      args: [parsedAmount],
    });

    // 3. Send Batch with Paymaster Capability
    writeContracts({
      contracts,
      capabilities: {
        paymasterService: {
          url: PAYMASTER_URL
        }
      }
    });
  };

  // B. The "Old School" Handler (MetaMask / No Paymaster)
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

  // Unified Submit
  const handleSubmit = () => {
    if (isInsufficientBalance) return;

    if (hasPaymasterCapability) {
      handleGaslessSubmit();
    } else {
      handleStandardSubmit();
    }
  };

  // --- Success Listeners ---

  // Handle Batch Success (Gasless)
  // Note: isBatchSent is true when the Userop is sent to bundler. 
  // Ideally you use `useWaitForTransactionReceipt` on the tx hash from the bundle, 
  // but for simple UI feedback:
  useEffect(() => {
    if (isBatchSent) {
      setAmount('');
      refetchBalance();
      refetchAllowance();
      if (onSuccess) onSuccess();
      // In a real app, you'd poll for the bundle receipt here
      console.log("Gasless batch sent!", batchId);
    }
  }, [isBatchSent, batchId]);

  // Handle Standard Success (EOA)
  useEffect(() => {
    if (isApproveSuccess) refetchAllowance();
    
    if (isFundSuccess) {
      setAmount('');
      refetchBalance();
      refetchAllowance();
      resetFund();
      if (onSuccess) onSuccess();
    }
  }, [isApproveSuccess, isFundSuccess]);


  // --- UI State Helpers ---
  const isApproving = isApprovePending || isApproveConfirming;
  const isFunding = isFundPending || isFundConfirming;
  // Batching is pending when wallet is signing or bundler is processing
  const isBatching = isBatchPending; 
  
  const isLoading = isApproving || isFunding || isBatching;
  const formattedBalance = balance ? formatUnits(balance, USDC_DECIMALS) : '0';
  const isButtonDisabled = !isConnected || isLoading || parsedAmount === 0n || isInsufficientBalance;

  const getButtonText = () => {
    if (isInsufficientBalance) return 'Insufficient Balance';
    
    // Gasless State
    if (isBatching) return 'Processing Gasless Tx...';
    if (hasPaymasterCapability) return 'Fund (Gasless)';

    // Standard State
    if (isApprovePending) return 'Sign Approval...';
    if (isApproveConfirming) return 'Approving USDC...';
    if (isFundPending) return 'Sign Transaction...';
    if (isFundConfirming) return 'Sending Funds...';
    if (needsApproval) return 'Approve USDC';
    return 'Fund Campaign';
  };

  if (!isConnected) {
    return (
      <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-center">
        <Icons.Wallet className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
        <p className="text-sm text-yellow-200 font-medium">Connect Wallet</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Input Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="text-zinc-400 font-medium ml-1">Amount</label>
          <div className={`flex items-center gap-1.5 transition-colors ${isInsufficientBalance ? 'text-red-400' : 'text-zinc-500'}`}>
            <Icons.Wallet className="w-3 h-3" />
            <span>Balance: <span className="font-mono">{formattedBalance}</span></span>
            <button 
              onClick={() => setAmount(formattedBalance)}
              className="text-blue-500 hover:text-blue-400 text-[10px] font-bold uppercase tracking-wide ml-1 transition-colors hover:bg-blue-500/10 px-1.5 rounded"
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
              const val = e.target.value;
              if (val === '' || /^\d*\.?\d{0,6}$/.test(val)) setAmount(val);
            }}
            disabled={isLoading}
            className={`w-full bg-[#09090b] border rounded-xl pl-4 pr-16 py-4 text-xl font-mono text-white placeholder-zinc-700 focus:outline-none transition-all disabled:opacity-50
              ${isInsufficientBalance 
                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                : 'border-zinc-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
              }
            `}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none gap-2">
            <div className="w-px h-4 bg-zinc-800" />
            <span className="text-zinc-400 font-bold text-sm">USDC</span>
          </div>
        </div>
      </div>

      {/* Progress Stepper: ONLY show if NOT using Paymaster/Gasless */}
      <AnimatePresence>
        {!hasPaymasterCapability && (needsApproval || isApproving) && !isInsufficientBalance && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 text-xs px-1">
              <div className={`flex items-center gap-2 ${isApproving || needsApproval ? 'text-blue-400' : 'text-zinc-600'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isApproveSuccess ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-current'}`}>
                  {isApproveSuccess ? <Icons.Check className="w-3 h-3" /> : '1'}
                </div>
                <span className="font-medium">Approve</span>
              </div>
              <div className="h-px w-8 bg-zinc-800" />
              <div className={`flex items-center gap-2 ${!needsApproval && !isApproving ? 'text-blue-400' : 'text-zinc-600'}`}>
                 <div className="w-5 h-5 rounded-full flex items-center justify-center border border-current">
                  2
                </div>
                <span className="font-medium">Fund</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
        whileTap={!isButtonDisabled ? { scale: 0.99 } : {}}
        onClick={handleSubmit}
        disabled={isButtonDisabled}
        className={`w-full relative overflow-hidden h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          isButtonDisabled 
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' 
            : hasPaymasterCapability 
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
              : needsApproval 
                ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
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
              {isInsufficientBalance ? <Icons.Alert className="w-4 h-4" /> : (
                hasPaymasterCapability ? <Icons.Wallet className="w-4 h-4" /> : // Use a 'bolt' or 'star' if you want to signify gasless
                (needsApproval ? <Icons.Lock className="w-4 h-4" /> : <Icons.Wallet className="w-4 h-4" />)
              )}
              <span>{getButtonText()}</span>
              {!isButtonDisabled && <Icons.ArrowRight className="opacity-60 w-4 h-4" />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Footer */}
      {hasPaymasterCapability && (
        <div className="flex justify-center">
           <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent font-bold uppercase tracking-wider">
             Gas Sponsored
           </span>
        </div>
      )}
      
      <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
        <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
          Funds are held in escrow. If the outcome is NO, you get a <span className="text-zinc-300">100% refund</span>.
        </p>
      </div>
    </div>
  );
}