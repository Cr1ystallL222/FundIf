'use client';

import { useMemo } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';

const USDC_DECIMALS = 6;

// Expanded ABI to include 'contributions' mapping
const campaignAbi = [
  {
    type: 'function',
    name: 'title',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'description',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'goalAmount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalFunded',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deadline',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'conditionId',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'creator',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'recipient',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'resolved',
    inputs: [],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'outcomeYes',
    inputs: [],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  // NEW: Personal Contribution Mapping
  {
    type: 'function',
    name: 'contributions',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export interface FormattedCampaign {
  title: string;
  description: string;
  goalAmount: string;
  totalFunded: string;
  deadline: Date;
  conditionId: `0x${string}`;
  creator: Address;
  recipient: Address;
  resolved: boolean;
  outcomeYes: boolean;
  userContribution: string; // NEW FIELD
}

export function useCampaign(campaignAddress: string) {
  const address = campaignAddress as Address;
  const { address: userAddress } = useAccount();

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      { address, abi: campaignAbi, functionName: 'title' },
      { address, abi: campaignAbi, functionName: 'description' },
      { address, abi: campaignAbi, functionName: 'goalAmount' },
      { address, abi: campaignAbi, functionName: 'totalFunded' },
      { address, abi: campaignAbi, functionName: 'deadline' },
      { address, abi: campaignAbi, functionName: 'conditionId' },
      { address, abi: campaignAbi, functionName: 'creator' },
      { address, abi: campaignAbi, functionName: 'recipient' },
      { address, abi: campaignAbi, functionName: 'resolved' },
      { address, abi: campaignAbi, functionName: 'outcomeYes' },
      // NEW: Fetch User Contribution
      { 
        address, 
        abi: campaignAbi, 
        functionName: 'contributions',
        args: [userAddress || '0x0000000000000000000000000000000000000000']
      },
    ],
    query: {
      enabled: Boolean(campaignAddress),
    },
  });

  const campaign = useMemo<FormattedCampaign | null>(() => {
    if (!data) return null;

    // Basic check to ensure critical fields loaded
    if (data[0].status === 'failure') return null;

    const [
      titleResult,
      descriptionResult,
      goalAmountResult,
      totalFundedResult,
      deadlineResult,
      conditionIdResult,
      creatorResult,
      recipientResult,
      resolvedResult,
      outcomeYesResult,
      contributionResult // NEW
    ] = data;

    return {
      title: (titleResult.result as string) || '',
      description: (descriptionResult.result as string) || '',
      goalAmount: goalAmountResult.result ? formatUnits(goalAmountResult.result as bigint, USDC_DECIMALS) : '0',
      totalFunded: totalFundedResult.result ? formatUnits(totalFundedResult.result as bigint, USDC_DECIMALS) : '0',
      deadline: new Date(Number(deadlineResult.result || 0n) * 1000),
      conditionId: (conditionIdResult.result as `0x${string}`) || '0x',
      creator: (creatorResult.result as Address) || '0x',
      recipient: (recipientResult.result as Address) || '0x',
      resolved: (resolvedResult.result as boolean) || false,
      outcomeYes: (outcomeYesResult.result as boolean) || false,
      // NEW: Format User Contribution
      userContribution: contributionResult.result ? formatUnits(contributionResult.result as bigint, USDC_DECIMALS) : '0',
    };
  }, [data]);

  return {
    campaign,
    isLoading,
    error,
    refetch,
  };
}