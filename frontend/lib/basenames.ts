import {
  Address,
  createPublicClient,
  encodePacked,
  http,
  keccak256,
  namehash,
} from 'viem';
import { base } from 'viem/chains';
import { L2ResolverAbi } from '@/abis/L2ResolverAbi';

// ============================================================================
// CONSTANTS
// ============================================================================

const BASENAME_L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD' as const;

const baseClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

// ============================================================================
// TYPES
// ============================================================================

export type BaseName = `${string}.base.eth`;

export enum BasenameTextRecordKeys {
  Description = 'description',
  Keywords = 'keywords',
  Url = 'url',
  Email = 'email',
  Phone = 'phone',
  Github = 'com.github',
  Twitter = 'com.twitter',
  Farcaster = 'xyz.farcaster',
  Lens = 'xyz.lens',
  Telegram = 'org.telegram',
  Discord = 'com.discord',
  Avatar = 'avatar',
}

// ============================================================================
// HELPER FUNCTIONS (from OnchainKit)
// ============================================================================

/**
 * Convert a chainId to a coinType hex for reverse resolution
 */
function convertChainIdToCoinType(chainId: number): number {
  // Mainnet
  if (chainId === 1) {
    return 60;
  }
  // For L2s, use the formula from ENSIP-11
  return (0x80000000 | chainId) >>> 0;
}

/**
 * Convert an address to the reverse node bytes for looking up its name
 */
function convertReverseNodeToBytes(address: Address, chainId: number): `0x${string}` {
  const addressFormatted = address.toLowerCase() as Address;
  const addressNode = keccak256(addressFormatted.substring(2) as `0x${string}`);
  
  const chainCoinType = convertChainIdToCoinType(chainId);
  const baseReverseNode = namehash(`${chainCoinType.toString(16)}.reverse`);
  
  const addressReverseNode = keccak256(
    encodePacked(['bytes32', 'bytes32'], [baseReverseNode, addressNode])
  );
  
  return addressReverseNode;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get the Basename for an address (reverse resolution)
 * Address -> name.base.eth
 */
export async function getBasename(address: Address): Promise<BaseName | undefined> {
  try {
    const addressReverseNode = convertReverseNodeToBytes(address, base.id);
    
    const basename = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'name',
      args: [addressReverseNode],
    });

    if (basename) {
      return basename as BaseName;
    }
    return undefined;
  } catch (error) {
    console.error('Error resolving address to Basename:', error);
    return undefined;
  }
}

/**
 * Get the address for a Basename (forward resolution)
 * name.base.eth -> Address
 */
export async function getBasenameAddress(basename: BaseName): Promise<Address | undefined> {
  try {
    const basenameNode = namehash(basename);
    
    const address = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'addr',
      args: [basenameNode],
    });

    if (address && address !== '0x0000000000000000000000000000000000000000') {
      return address;
    }
    return undefined;
  } catch (error) {
    console.error('Error resolving Basename to address:', error);
    return undefined;
  }
}

/**
 * Get a text record for a Basename (avatar, description, twitter, etc.)
 */
export async function getBasenameTextRecord(
  basename: BaseName,
  key: BasenameTextRecordKeys
): Promise<string | undefined> {
  try {
    const basenameNode = namehash(basename);
    
    const textRecord = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'text',
      args: [basenameNode, key],
    });

    return textRecord || undefined;
  } catch (error) {
    console.error(`Error fetching text record ${key}:`, error);
    return undefined;
  }
}

/**
 * Get the avatar URL for a Basename
 */
export async function getBasenameAvatar(basename: BaseName): Promise<string | undefined> {
  return getBasenameTextRecord(basename, BasenameTextRecordKeys.Avatar);
}

/**
 * Format input to proper Basename format
 */
export function formatToBasename(input: string): BaseName {
  const trimmed = input.trim().toLowerCase();
  
  if (trimmed.endsWith('.base.eth')) {
    return trimmed as BaseName;
  }
  
  if (trimmed.endsWith('.base')) {
    return `${trimmed}.eth` as BaseName;
  }
  
  // Remove any other extensions and add .base.eth
  const name = trimmed.split('.')[0];
  return `${name}.base.eth` as BaseName;
}