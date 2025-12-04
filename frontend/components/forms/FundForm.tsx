'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import type { Address } from 'viem';

// 1. & 2. Import Central Configs
import { USDC_ADDRESS } from '@/lib/contracts/addresses';
import { ERC20ABI, CampaignABI } from '@/lib/contracts/abis';

const USDC_DECIMALS = 6;

interface FundFormProps {
  campaignAddress: string;
}

export function FundForm({ campaignAddress }: FundFormProps) {
  const [amount, setAmount] = useState('');
  const { address, isConnected } = useAccount();

  // Ensure addresses are strictly typed for Viem/Wagmi
  const campaignAddr = campaignAddress as Address;
  const usdcAddr = USDC_ADDRESS as Address;

  // Read USDC balance
  // 3. Swapped inline ABI for ERC20ABI
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdcAddr,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read allowance
  // 3. Swapped inline ABI for ERC20ABI
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddr,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, campaignAddr] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Approve transaction
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApprovePending,
    reset: resetApprove,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveSuccess,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // Fund transaction
  const {
    writeContract: writeFund,
    data: fundTxHash,
    isPending: isFundPending,
    reset: resetFund,
  } = useWriteContract();

  const {
    isLoading: isFundConfirming,
    isSuccess: isFundSuccess,
  } = useWaitForTransactionReceipt({
    hash: fundTxHash,
  });

  // Parse amount safely
  const parsedAmount = useMemo(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return 0n;
    }
    try {
      return parseUnits(amount, USDC_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  // Determine if approval is needed
  const needsApproval = useMemo(() => {
    if (parsedAmount === 0n) return false;
    // allowance is bigint | undefined
    return parsedAmount > (allowance ?? 0n);
  }, [parsedAmount, allowance]);

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
      resetApprove();
    }
  }, [isApproveSuccess, refetchAllowance, resetApprove]);

  // Reset form after successful fund
  useEffect(() => {
    if (isFundSuccess) {
      setAmount('');
      refetchBalance();
      refetchAllowance();
      resetFund();
    }
  }, [isFundSuccess, refetchBalance, refetchAllowance, resetFund]);

  const handleApprove = () => {
    writeApprove({
      address: usdcAddr,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [campaignAddr, parsedAmount],
    });
  };

  const handleFund = () => {
    writeFund({
      address: campaignAddr,
      abi: CampaignABI,
      functionName: 'fund',
      args: [parsedAmount],
    });
  };

  // 4. Logic preserved
  const handleSubmit = () => {
    if (needsApproval) {
      handleApprove();
    } else {
      handleFund();
    }
  };

  const isApproving = isApprovePending || isApproveConfirming;
  const isFunding = isFundPending || isFundConfirming;
  const isLoading = isApproving || isFunding;

  const formattedBalance = balance
    ? formatUnits(balance, USDC_DECIMALS)
    : '0';

  const getButtonText = () => {
    if (isApprovePending) return 'Confirm Approval...';
    if (isApproveConfirming) return 'Approving...';
    if (isFundPending) return 'Confirm Transaction...';
    if (isFundConfirming) return 'Funding...';
    if (needsApproval) return 'Approve USDC';
    return 'Fund';
  };

  const isButtonDisabled =
    !isConnected || isLoading || parsedAmount === 0n;

  return (
    <div className="glass-panel">
      <div className="mb-4">
        <p className="text-sm text-gray-400">
          Your USDC Balance:{' '}
          <span className="font-semibold text-white">
            {formattedBalance} USDC
          </span>
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="input-field"
          placeholder="Enter amount to fund"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <button
        className="btn-primary w-full"
        onClick={handleSubmit}
        disabled={isButtonDisabled}
      >
        {getButtonText()}
      </button>

      {!isConnected && (
        <p className="mt-2 text-sm text-yellow-500">
          Please connect your wallet to fund this campaign.
        </p>
      )}
    </div>
  );
}