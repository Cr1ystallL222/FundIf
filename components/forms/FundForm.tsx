'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { useCapabilities, useWriteContracts } from 'wagmi/experimental';
import { parseUnits, formatUnits, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { 
  Zap, 
  Wallet, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

import { USDC_ADDRESS } from '@/lib/contracts/addresses';
import { ERC20ABI, CampaignABI } from '@/lib/contracts/abis';

const USDC_DECIMALS = 6;
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL;

interface FundFormProps {
  campaignAddress: string;
  onSuccess?: (amount: string) => void; 
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

  // Local state for instant balance updates before RPC catches up
  const [uiBalance, setUiBalance] = useState<bigint | undefined>(undefined);

  // Sync UI balance when actual chain balance updates
  useEffect(() => {
    if (balance !== undefined) {
      setUiBalance(balance);
    }
  }, [balance]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddr,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, campaignAddr] : undefined,
  });

  // --- 2. PAYMASTER SETUP ---
  const { data: capabilities } = useCapabilities({ account: address });
  const chainId = chain?.id || baseSepolia.id;
  const availableCapabilities = capabilities?.[chainId];
  const hasPaymaster = !!availableCapabilities?.paymasterService?.supported;

  // --- 3. WRITE HOOKS ---
  const { 
    writeContracts, 
    isPending: isBatchPending, 
    isSuccess: isBatchSuccess 
  } = useWriteContracts();

  const { 
    writeContract: writeFund, 
    isPending: isFundPending,
    data: fundTxHash 
  } = useWriteContract();

  const { 
    writeContract: writeApprove, 
    isPending: isApprovePending 
  } = useWriteContract();

  // Wait for standard TX receipts to trigger refresh
  const { isSuccess: isFundTxSuccess } = useWaitForTransactionReceipt({ hash: fundTxHash });

  // --- MATH & LOGIC ---
  const parsedAmount = useMemo(() => {
    try { return amount ? parseUnits(amount, USDC_DECIMALS) : 0n; } catch { return 0n; }
  }, [amount]);

  // --- 4. AUTO-REFRESH LOGIC ---
  useEffect(() => {
    if (isBatchSuccess || isFundTxSuccess) {
      // 1. Capture values before clearing
      const fundedAmountStr = amount;
      const fundedAmountBigInt = parsedAmount;

      // 2. INSTANTLY Update User Balance in UI (Optimistic)
      setUiBalance((prev) => (prev !== undefined ? prev - fundedAmountBigInt : prev));

      // 3. Trigger Parent Update (Optimistic)
      if (onSuccess && fundedAmountStr) {
        onSuccess(fundedAmountStr);
      }

      // 4. Clear Input
      setAmount('');

      // 5. Trigger Background Refetch
      refetchBalance();
      refetchAllowance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBatchSuccess, isFundTxSuccess, refetchBalance, refetchAllowance]);

  const needsApproval = parsedAmount > (allowance ?? 0n);
  // Use uiBalance for validation so the button doesn't flicker enabled/disabled oddly
  const currentBalance = uiBalance !== undefined ? uiBalance : (balance ?? 0n);
  const isInsufficientBalance = currentBalance < parsedAmount;
  const isLoading = isBatchPending || isApprovePending || isFundPending;

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

  if (!isConnected) {
    return (
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 text-center">
        <Wallet className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
        <p className="text-sm text-zinc-400 font-medium">Connect Wallet to Fund</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="relative group">
        <div className="flex justify-between mb-2 text-xs text-zinc-500 font-medium">
          <span>AMOUNT</span>
          <span>BALANCE: {currentBalance !== undefined ? formatUnits(currentBalance, USDC_DECIMALS) : '0'}</span>
        </div>
        <div className="relative">
            <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-16 py-4 text-3xl font-bold text-white focus:outline-none focus:border-white/20 transition-colors placeholder:text-zinc-700"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">USDC</div>
        </div>
      </div>

      <div className="space-y-3">
        {/* MAIN BUTTON */}
        <button
            onClick={hasPaymaster ? handleGaslessSubmit : handleStandardSubmit}
            disabled={isInsufficientBalance || isLoading || !amount}
            className={`w-full h-14 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
            ${isInsufficientBalance || !amount
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
            }`}
        >
            {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
            <span>Fund Campaign</span>
            )}
        </button>

        {/* GASLESS BADGE / INFO */}
        {hasPaymaster && (
            <div className="flex items-center justify-center gap-2 text-xs">
                <Zap className="w-3 h-3 text-blue-400 fill-blue-400 animate-pulse" />
                <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    GASLESS TRANSACTION
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">Powered by Paymaster</span>
            </div>
        )}
        
        {/* Standard Backup Text */}
        {!hasPaymaster && (
            <div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
                <ShieldCheck className="w-3 h-3" />
                <span>Escrow Secured</span>
            </div>
        )}
      </div>
    </div>
  );
}