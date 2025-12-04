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

const USDC_ADDRESS = 'PASTE_YOUR_MOCK_USDC_ADDRESS_HERE' as Address;
const USDC_DECIMALS = 6;

const usdcAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'spender', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address', internalType: 'address' },
      { name: 'value', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const;

const campaignAbi = [
  {
    type: 'function',
    name: 'fund',
    inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

interface FundFormProps {
  campaignAddress: string;
}

export function FundForm({ campaignAddress }: FundFormProps) {
  const [amount, setAmount] = useState('');
  const { address, isConnected } = useAccount();

  const campaignAddr = campaignAddress as Address;

  // Read USDC balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
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
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: 'approve',
      args: [campaignAddr, parsedAmount],
    });
  };

  const handleFund = () => {
    writeFund({
      address: campaignAddr,
      abi: campaignAbi,
      functionName: 'fund',
      args: [parsedAmount],
    });
  };

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