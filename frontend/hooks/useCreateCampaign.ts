// hooks/useCreateCampaign.ts

'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from 'wagmi';
import { parseUnits, decodeEventLog, type Hash, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * CampaignFactory contract address on Base Sepolia
 */
export const CAMPAIGN_FACTORY_ADDRESS = '0xc02d6a2c24cd9851f2AF6bd7dFe3Da766466cE8B' as const;

/**
 * Base Sepolia Chain ID
 */
export const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id; // 84532

/**
 * USDC decimals (6 for USDC)
 */
const USDC_DECIMALS = 6;

// =============================================================================
// ABI - CampaignFactory
// =============================================================================

/**
 * CampaignFactory ABI
 */
export const CAMPAIGN_FACTORY_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_usdc",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_oracle",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "campaigns",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "campaignsByCreator",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createCampaign",
    "inputs": [
      {
        "name": "title",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "description",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "goalAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "recipient",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "conditionId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "marketSlug",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "deadline",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "campaignAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCampaignCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCampaigns",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCampaignsByCreator",
    "inputs": [
      {
        "name": "creator",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCampaignsRange",
    "inputs": [
      {
        "name": "start",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "end",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "result",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isCampaign",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "oracle",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "usdc",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CampaignCreated",
    "inputs": [
      {
        "name": "campaign",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "title",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "goalAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "conditionId",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      },
      {
        "name": "marketSlug",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "deadline",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
] as const;

// =============================================================================
// TYPES
// =============================================================================

/**
 * Parameters for creating a new campaign
 */
export interface CreateCampaignParams {
  /** Campaign title displayed to users */
  title: string;
  /** Campaign description explaining the project */
  description: string;
  /** Funding goal in standard USDC units (e.g., 100 for $100 USDC) */
  goalAmount: number | string;
  /** Address that receives funds upon successful resolution */
  recipient: Address;
  /** Prediction market condition ID (bytes32) from Polymarket */
  conditionId: `0x${string}`;
  /** The slug for the market (e.g. "will-bitcoin-hit-100k") */
  marketSlug: string; 
  /** Unix timestamp when funding period ends */
  deadline: bigint | number;
}

/**
 * Return type for the useCreateCampaign hook
 */
export interface UseCreateCampaignReturn {
  /** Function to initiate campaign creation */
  createCampaign: (params: CreateCampaignParams) => void;
  /** True while transaction is being sent or confirmed */
  isPending: boolean;
  /** True while waiting for wallet signature */
  isWritePending: boolean;
  /** True while waiting for transaction confirmation */
  isConfirming: boolean;
  /** True when transaction is successfully confirmed */
  isSuccess: boolean;
  /** Transaction hash once submitted */
  hash: Hash | undefined;
  /** Any error that occurred */
  error: Error | null;
  /** Address of the created campaign (extracted from logs) */
  createdCampaignAddress: Address | undefined;
  /** Reset the hook state */
  reset: () => void;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether on correct chain (Base Sepolia) */
  isCorrectChain: boolean;
}

// =============================================================================
// TOAST HELPERS
// =============================================================================

/**
 * Toast notification helper
 * Replace these with your actual toast implementation (e.g., react-hot-toast, sonner, etc.)
 */
const toast = {
  success: (message: string, options?: { description?: string }) => {
    console.log('✅ SUCCESS:', message, options?.description || '');
    // Example with react-hot-toast:
    // import { toast as hotToast } from 'react-hot-toast';
    // hotToast.success(message);
    
    // Example with sonner:
    // import { toast as sonnerToast } from 'sonner';
    // sonnerToast.success(message, { description: options?.description });
  },
  error: (message: string, options?: { description?: string }) => {
    console.error('❌ ERROR:', message, options?.description || '');
    // hotToast.error(message);
    // sonnerToast.error(message, { description: options?.description });
  },
  loading: (message: string) => {
    console.log('⏳ LOADING:', message);
    // return hotToast.loading(message);
  },
  dismiss: (toastId?: string) => {
    // hotToast.dismiss(toastId);
  },
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Custom hook for creating campaigns on the CampaignFactory contract
 * 
 * @example
 * ```tsx
 * const { createCampaign, isPending, isSuccess, error, createdCampaignAddress } = useCreateCampaign();
 * 
 * const handleSubmit = () => {
 *   createCampaign({
 *     title: 'My Campaign',
 *     description: 'Campaign description...',
 *     goalAmount: 1000, // $1000 USDC
 *     recipient: '0x...',
 *     conditionId: '0x...',
 *     marketSlug: 'event-slug-name',
 *     deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), // 30 days
 *   });
 * };
 * ```
 */
export function useCreateCampaign(): UseCreateCampaignReturn {
  // Get account and chain info
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const isCorrectChain = chainId === BASE_SEPOLIA_CHAIN_ID;

  // Write contract hook
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  // Combined pending state
  const isPending = isWritePending || isConfirming;

  // Combined error
  const error = useMemo(() => {
    if (writeError) return writeError;
    if (confirmError) return confirmError;
    return null;
  }, [writeError, confirmError]);

  // Extract created campaign address from event logs
  const createdCampaignAddress = useMemo((): Address | undefined => {
    if (!receipt?.logs || receipt.logs.length === 0) {
      return undefined;
    }

    try {
      // Find the CampaignCreated event log
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: CAMPAIGN_FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === 'CampaignCreated') {
            // The campaign address is the first indexed parameter
            return decoded.args.campaign as Address;
          }
        } catch {
          // Not the event we're looking for, continue
          continue;
        }
      }
    } catch (err) {
      console.warn('Failed to decode campaign address from logs:', err);
    }

    return undefined;
  }, [receipt]);

  // Toast notifications on state changes
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success('Campaign created successfully! 🎉', {
        description: createdCampaignAddress 
          ? `Campaign address: ${createdCampaignAddress.slice(0, 10)}...`
          : `TX: ${hash.slice(0, 10)}...`,
      });
    }
  }, [isSuccess, hash, createdCampaignAddress]);

  useEffect(() => {
    if (error) {
      // Parse common error messages for better UX
      let errorMessage = 'Failed to create campaign';
      let errorDescription = error.message;

      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction rejected';
        errorDescription = 'You rejected the transaction in your wallet';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds';
        errorDescription = 'You do not have enough ETH for gas fees';
      } else if (error.message.includes('Deadline must be future')) {
        errorMessage = 'Invalid deadline';
        errorDescription = 'The deadline must be in the future';
      } else if (error.message.includes('Goal must be > 0')) {
        errorMessage = 'Invalid goal amount';
        errorDescription = 'The funding goal must be greater than 0';
      }

      toast.error(errorMessage, { description: errorDescription });
    }
  }, [error]);

  // Create campaign function
  const createCampaign = useCallback(
    (params: CreateCampaignParams) => {
      const { title, description, goalAmount, recipient, conditionId, marketSlug, deadline } = params;

      // Validation
      if (!isConnected) {
        toast.error('Wallet not connected', {
          description: 'Please connect your wallet to create a campaign',
        });
        return;
      }

      if (!isCorrectChain) {
        toast.error('Wrong network', {
          description: 'Please switch to Base Sepolia to create a campaign',
        });
        return;
      }

      if (!title.trim()) {
        toast.error('Title required', { description: 'Please enter a campaign title' });
        return;
      }

      if (!description.trim()) {
        toast.error('Description required', { description: 'Please enter a campaign description' });
        return;
      }

      if (!marketSlug?.trim()) {
        toast.error('Market Slug required', { description: 'Please provide the Polymarket slug' });
        return;
      }

      // Convert goalAmount from standard units to 6 decimals for USDC
      // e.g., 100 USDC → 100000000 (100 * 10^6)
      const goalAmountString = typeof goalAmount === 'number' 
        ? goalAmount.toString() 
        : goalAmount;
      
      const goalAmountWithDecimals = parseUnits(goalAmountString, USDC_DECIMALS);

      // Convert deadline to bigint if needed
      const deadlineBigInt = typeof deadline === 'number' 
        ? BigInt(deadline) 
        : deadline;

      // Validate deadline is in the future
      const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
      if (deadlineBigInt <= nowSeconds) {
        toast.error('Invalid deadline', {
          description: 'The deadline must be in the future',
        });
        return;
      }

      console.log('📝 Creating campaign with params:', {
        title,
        description: description.slice(0, 50) + '...',
        goalAmount: goalAmountString,
        goalAmountWithDecimals: goalAmountWithDecimals.toString(),
        recipient,
        conditionId,
        marketSlug,
        deadline: deadlineBigInt.toString(),
      });

      // Execute the contract write
      writeContract({
        address: CAMPAIGN_FACTORY_ADDRESS,
        abi: CAMPAIGN_FACTORY_ABI,
        functionName: 'createCampaign',
        args: [
          title,
          description,
          goalAmountWithDecimals,
          recipient,
          conditionId,
          marketSlug,
          deadlineBigInt,
        ],
        chainId: BASE_SEPOLIA_CHAIN_ID,
      });
    },
    [isConnected, isCorrectChain, writeContract]
  );

  // Reset function
  const reset = useCallback(() => {
    resetWrite();
  }, [resetWrite]);

  return {
    createCampaign,
    isPending,
    isWritePending,
    isConfirming,
    isSuccess,
    hash,
    error,
    createdCampaignAddress,
    reset,
    isConnected,
    isCorrectChain,
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to convert a Date or timestamp to the required bigint format
 */
export function useDeadlineFromDate(date: Date | null): bigint {
  return useMemo(() => {
    if (!date) {
      // Default to 30 days from now
      return BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);
    }
    return BigInt(Math.floor(date.getTime() / 1000));
  }, [date]);
}

/**
 * Hook to format condition ID from Polymarket to bytes32
 * Polymarket condition IDs are already bytes32 hex strings
 */
export function useConditionIdAsBytes32(conditionId: string): `0x${string}` {
  return useMemo(() => {
    // Ensure it starts with 0x and is 66 characters (0x + 64 hex chars)
    if (conditionId.startsWith('0x') && conditionId.length === 66) {
      return conditionId as `0x${string}`;
    }
    
    // If it's just hex without 0x prefix
    if (conditionId.length === 64 && /^[0-9a-fA-F]+$/.test(conditionId)) {
      return `0x${conditionId}` as `0x${string}`;
    }
    
    // If shorter, pad with zeros
    const cleanId = conditionId.replace('0x', '');
    const paddedId = cleanId.padStart(64, '0');
    return `0x${paddedId}` as `0x${string}`;
  }, [conditionId]);
}