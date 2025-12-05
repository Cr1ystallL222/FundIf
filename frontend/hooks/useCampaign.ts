// hooks/useCampaign.ts

'use client';

import { useMemo } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';

const USDC_DECIMALS = 6;

// Expanded ABI to include 'contributions' mapping and 'marketSlug'
const campaignAbi = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_usdc", "type": "address", "internalType": "address" },
      { "name": "_oracle", "type": "address", "internalType": "address" },
      { "name": "_creator", "type": "address", "internalType": "address" },
      { "name": "_recipient", "type": "address", "internalType": "address" },
      { "name": "_title", "type": "string", "internalType": "string" },
      { "name": "_description", "type": "string", "internalType": "string" },
      { "name": "_goalAmount", "type": "uint256", "internalType": "uint256" },
      { "name": "_conditionId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "_marketSlug", "type": "string", "internalType": "string" },
      { "name": "_deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "adminBatchRefund",
    "inputs": [
      { "name": "_contributors", "type": "address[]", "internalType": "address[]" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "conditionId",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "bytes32", "internalType": "bytes32" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "contributions",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "contributors",
    "inputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "creator",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "deadline",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "description",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "string", "internalType": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "fund",
    "inputs": [
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCampaignInfo",
    "inputs": [],
    "outputs": [
      {
        "name": "info",
        "type": "tuple",
        "internalType": "struct Campaign.CampaignInfo",
        "components": [
          { "name": "title", "type": "string", "internalType": "string" },
          { "name": "description", "type": "string", "internalType": "string" },
          { "name": "creator", "type": "address", "internalType": "address" },
          { "name": "recipient", "type": "address", "internalType": "address" },
          { "name": "goalAmount", "type": "uint256", "internalType": "uint256" },
          { "name": "totalFunded", "type": "uint256", "internalType": "uint256" },
          { "name": "deadline", "type": "uint256", "internalType": "uint256" },
          { "name": "conditionId", "type": "bytes32", "internalType": "bytes32" },
          { "name": "marketSlug", "type": "string", "internalType": "string" },
          { "name": "resolved", "type": "bool", "internalType": "bool" },
          { "name": "outcomeYes", "type": "bool", "internalType": "bool" },
          { "name": "withdrawn", "type": "bool", "internalType": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getContribution",
    "inputs": [
      { "name": "funder", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getContributors",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address[]", "internalType": "address[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "goalAmount",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "marketSlug",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "string", "internalType": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "oracle",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract IOracle" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "outcomeYes",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "recipient",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "refund",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "refunded",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolve",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resolved",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "simulateYield",
    "inputs": [
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "title",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "string", "internalType": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalFunded",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "usdc",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract IERC20" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawn",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "yieldGenerated",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "Funded",
    "inputs": [
      { "name": "funder", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "totalFunded", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Refunded",
    "inputs": [
      { "name": "funder", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Resolved",
    "inputs": [
      { "name": "outcome", "type": "bool", "indexed": false, "internalType": "bool" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Withdrawn",
    "inputs": [
      { "name": "recipient", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "yield", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "YieldAccrued",
    "inputs": [
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  }
] as const;

export interface FormattedCampaign {
  title: string;
  description: string;
  goalAmount: string;
  totalFunded: string;
  deadline: Date;
  conditionId: `0x${string}`;
  marketSlug: string; // NEW FIELD
  creator: Address;
  recipient: Address;
  resolved: boolean;
  outcomeYes: boolean;
  userContribution: string;
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
      { address, abi: campaignAbi, functionName: 'marketSlug' }, // ADDED THIS
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
      marketSlugResult, // Destructure New Field
      creatorResult,
      recipientResult,
      resolvedResult,
      outcomeYesResult,
      contributionResult
    ] = data;

    return {
      title: (titleResult.result as string) || '',
      description: (descriptionResult.result as string) || '',
      goalAmount: goalAmountResult.result ? formatUnits(goalAmountResult.result as bigint, USDC_DECIMALS) : '0',
      totalFunded: totalFundedResult.result ? formatUnits(totalFundedResult.result as bigint, USDC_DECIMALS) : '0',
      deadline: new Date(Number(deadlineResult.result || 0n) * 1000),
      conditionId: (conditionIdResult.result as `0x${string}`) || '0x',
      marketSlug: (marketSlugResult.result as string) || '', // Map New Field
      creator: (creatorResult.result as Address) || '0x',
      recipient: (recipientResult.result as Address) || '0x',
      resolved: (resolvedResult.result as boolean) || false,
      outcomeYes: (outcomeYesResult.result as boolean) || false,
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