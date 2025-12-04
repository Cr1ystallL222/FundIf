'use client';

import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';

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
] as const;

const USDC_DECIMALS = 6;

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
}

export function useCampaign(campaignAddress: string) {
  const address = campaignAddress as Address;

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
    ],
    query: {
      enabled: Boolean(campaignAddress),
    },
  });

  const campaign = useMemo<FormattedCampaign | null>(() => {
    if (!data) return null;

    const hasFailure = data.some((result) => result.status === 'failure');
    if (hasFailure) return null;

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
    ] = data;

    return {
      title: titleResult.result as string,
      description: descriptionResult.result as string,
      goalAmount: formatUnits(goalAmountResult.result as bigint, USDC_DECIMALS),
      totalFunded: formatUnits(totalFundedResult.result as bigint, USDC_DECIMALS),
      deadline: new Date(Number(deadlineResult.result as bigint) * 1000),
      conditionId: conditionIdResult.result as `0x${string}`,
      creator: creatorResult.result as Address,
      recipient: recipientResult.result as Address,
      resolved: resolvedResult.result as boolean,
      outcomeYes: outcomeYesResult.result as boolean,
    };
  }, [data]);

  return {
    campaign,
    isLoading,
    error,
    refetch,
  };
}