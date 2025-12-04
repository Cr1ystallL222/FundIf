// app/profile/page.tsx
'use client';

import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ConnectButton from '@/components/wallet/ConnectButton';
import CampaignCard from '@/components/campaign/CampaignCard';
import { CampaignFactoryABI, ERC20ABI } from '@/lib/contracts/abis';
import { CAMPAIGN_FACTORY_ADDRESS, USDC_ADDRESS } from '@/lib/contracts/addresses';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  // Get ETH balance
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address: address,
  });

  // Get USDC balance
  const { data: usdcBalance, isLoading: usdcLoading } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get user's campaigns using getCampaignsByCreator (Scenario A)
  const { data: userCampaigns, isLoading: campaignsLoading } = useReadContract({
    address: CAMPAIGN_FACTORY_ADDRESS as `0x${string}`,
    abi: CampaignFactoryABI,
    functionName: 'getCampaignsByCreator',
    args: address ? [address] : undefined,
  });

  // Auth Check - Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          className="glass-panel p-10 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold text-text-main mb-4">
            Access Your Dashboard
          </h2>
          <p className="text-text-muted mb-8">
            Please connect your wallet to view your dashboard.
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  const campaigns = userCampaigns as `0x${string}`[] | undefined;
  const hasCampaigns = campaigns && campaigns.length > 0;
  const balancesLoading = ethLoading || usdcLoading;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Section */}
        <motion.section
          className="glass-panel p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-text-main mb-6">
            Welcome back 👋
          </h1>

          {/* Address Display */}
          <div className="mb-6">
            <span className="text-sm text-text-muted block mb-1">Your Address</span>
            <span className="font-mono text-primary text-sm sm:text-base break-all">
              {address}
            </span>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ETH Balance */}
            <div className="glass-panel p-4 bg-background/50">
              <span className="text-sm text-text-muted block mb-1">ETH Balance</span>
              {balancesLoading ? (
                <div className="h-7 bg-border rounded animate-pulse w-24" />
              ) : (
                <span className="text-xl font-bold text-secondary">
                  {ethBalance
                    ? `${Number(formatUnits(ethBalance.value, 18)).toFixed(4)} ETH`
                    : '0.0000 ETH'}
                </span>
              )}
            </div>

            {/* USDC Balance */}
            <div className="glass-panel p-4 bg-background/50">
              <span className="text-sm text-text-muted block mb-1">USDC Balance</span>
              {balancesLoading ? (
                <div className="h-7 bg-border rounded animate-pulse w-24" />
              ) : (
                <span className="text-xl font-bold text-secondary">
                  ${usdcBalance
                    ? Number(formatUnits(usdcBalance as bigint, 6)).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '0.00'}
                </span>
              )}
            </div>

            {/* Campaigns Count */}
            <div className="glass-panel p-4 bg-background/50">
              <span className="text-sm text-text-muted block mb-1">Campaigns Created</span>
              {campaignsLoading ? (
                <div className="h-7 bg-border rounded animate-pulse w-12" />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {campaigns?.length ?? 0}
                </span>
              )}
            </div>
          </div>
        </motion.section>

        {/* My Campaigns Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-main">My Campaigns</h2>
            {hasCampaigns && (
              <Link
                href="/create"
                className="flex items-center gap-2 text-sm px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
              >
                <span>+</span>
                <span className="hidden sm:inline">New Campaign</span>
              </Link>
            )}
          </div>

          {campaignsLoading ? (
            // Loading State
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-panel p-6 space-y-4">
                  <div className="h-6 bg-border rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-border rounded animate-pulse w-1/2" />
                  <div className="h-2 bg-border rounded-full animate-pulse w-full" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-border rounded animate-pulse w-1/4" />
                    <div className="h-4 bg-border rounded animate-pulse w-1/4" />
                  </div>
                  <div className="h-4 bg-border rounded animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : hasCampaigns ? (
            // Campaigns Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaignAddress, index) => (
                <motion.div
                  key={campaignAddress}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * Math.min(index, 5) }}
                >
                  <CampaignCard campaignAddress={campaignAddress} />
                </motion.div>
              ))}
            </div>
          ) : (
            // Empty State
            <motion.div
              className="glass-panel p-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-6xl mb-6">🌱</div>
              <h3 className="text-xl font-semibold text-text-main mb-3">
                No campaigns yet
              </h3>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                You haven&apos;t created any campaigns yet. Launch your first conditional
                funding campaign and start making an impact!
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-all hover:scale-105"
              >
                <span>🚀</span>
                Create your first Campaign
              </Link>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}