'use client';

import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { CampaignFactoryABI } from '@/lib/contracts/abis';
import { CAMPAIGN_FACTORY_ADDRESS } from '@/lib/contracts/addresses';
import CampaignCard from '@/components/campaign/CampaignCard';

export default function Home() {
  const { data: campaigns, isLoading, isError } = useReadContract({
    address: CAMPAIGN_FACTORY_ADDRESS as `0x${string}`,
    abi: CampaignFactoryABI,
    functionName: 'getCampaigns',
  });

  // Reverse to show newest campaigns first
  const sortedCampaigns = campaigns ? [...campaigns].reverse() : [];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        {/* Background gradient effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="glass-panel p-8 sm:p-12 lg:p-16 space-y-8">
            {/* Headline */}
            <h1 className="heading-hero">
              <span className="text-gradient-solarpunk">FundIf</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-text-muted max-w-2xl mx-auto leading-relaxed">
              Decentralized crowdfunding powered by smart contracts. 
              Launch your campaign with transparent, trustless funding.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/create" className="btn-primary text-lg px-8 py-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Start a Campaign
              </Link>
              <a
                href="#campaigns"
                className="inline-flex items-center gap-2 text-text-muted hover:text-secondary transition-colors px-6 py-3"
              >
                <span>Explore Campaigns</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </a>
            </div>

            {/* Stats preview */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">
                  {isLoading ? '...' : sortedCampaigns.length}
                </p>
                <p className="text-sm text-text-muted">Active Campaigns</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-text-muted">On-Chain</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">0%</p>
                <p className="text-sm text-text-muted">Platform Fee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
              Active Campaigns
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Support causes you believe in with transparent, blockchain-powered crowdfunding.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="glass-panel p-6 space-y-4">
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
          )}

          {/* Error State */}
          {isError && (
            <div className="glass-panel p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-main mb-2">
                Failed to Load Campaigns
              </h3>
              <p className="text-text-muted text-sm">
                There was an error fetching campaigns. Please check your connection and try again.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && sortedCampaigns.length === 0 && (
            <div className="glass-panel p-12 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-main mb-3">
                No Campaigns Yet
              </h3>
              <p className="text-text-muted mb-6">
                Be the first to create a campaign and start raising funds for your cause!
              </p>
              <Link href="/create" className="btn-primary">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create First Campaign
              </Link>
            </div>
          )}

          {/* Campaign Grid */}
          {!isLoading && !isError && sortedCampaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCampaigns.map((campaignAddress) => (
                <CampaignCard
                  key={campaignAddress}
                  campaignAddress={campaignAddress}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-main mb-2">
                Trustless & Secure
              </h3>
              <p className="text-text-muted text-sm">
                Smart contracts ensure funds are handled securely without intermediaries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-main mb-2">
                Fully Transparent
              </h3>
              <p className="text-text-muted text-sm">
                All transactions are visible on-chain. Track every contribution in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-main mb-2">
                Zero Platform Fees
              </h3>
              <p className="text-text-muted text-sm">
                100% of your contribution goes directly to the campaign. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}