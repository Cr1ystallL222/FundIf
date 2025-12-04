'use client';

import { use } from 'react';
import { useCampaign } from '@/hooks/useCampaign';
import { FundForm } from '@/components/forms/FundForm';
import ResolutionActions from '@/components/campaign/ResolutionActions';
import { OracleController } from '@/components/debug/OracleController';

interface CampaignPageProps {
  params: Promise<{
    address: string;
  }>;
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { address } = use(params);
  const { campaign, isLoading, error } = useCampaign(address);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel text-center max-w-md">
          <p className="text-red-500 text-lg font-semibold mb-2">
            Error Loading Campaign
          </p>
          <p className="text-gray-400 text-sm">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel text-center max-w-md">
          <p className="text-yellow-500 text-lg font-semibold">
            Campaign Not Found
          </p>
          <p className="text-gray-400 text-sm mt-2">
            The campaign at this address could not be found.
          </p>
        </div>
      </div>
    );
  }

  const goalAmount = parseFloat(campaign.goalAmount);
  const totalFunded = parseFloat(campaign.totalFunded);
  const progressPercentage = goalAmount > 0
    ? Math.min((totalFunded / goalAmount) * 100, 100)
    : 0;

  const isExpired = campaign.deadline < new Date();
  const formattedDeadline = campaign.deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine if funding is allowed
  const canFund = !campaign.resolved && !isExpired;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Creator */}
            <div className="glass-panel">
              <div className="flex items-center gap-2 mb-4">
                {campaign.resolved && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.outcomeYes
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {campaign.outcomeYes ? 'Successful' : 'Failed'}
                  </span>
                )}
                {isExpired && !campaign.resolved && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    Expired - Pending Resolution
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">
                {campaign.title}
              </h1>

              <p className="text-sm text-gray-400">
                Created by:{' '}
                <span className="font-mono text-gray-300">
                  {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                </span>
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Recipient:{' '}
                <span className="font-mono text-gray-300">
                  {campaign.recipient.slice(0, 6)}...{campaign.recipient.slice(-4)}
                </span>
              </p>
            </div>

            {/* Description */}
            <div className="glass-panel">
              <h2 className="text-xl font-semibold text-white mb-4">
                About this Campaign
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Progress Section */}
            <div className="glass-panel">
              <h2 className="text-xl font-semibold text-white mb-4">
                Funding Progress
              </h2>

              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-secondary text-2xl font-bold">
                    {totalFunded.toLocaleString()}
                  </span>
                  <span className="text-gray-400 ml-1">USDC</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400">Goal: </span>
                  <span className="text-secondary font-semibold">
                    {goalAmount.toLocaleString()}
                  </span>
                  <span className="text-gray-400 ml-1">USDC</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">
                  {progressPercentage.toFixed(1)}% funded
                </span>
                <span
                  className={`text-sm ${
                    isExpired ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {isExpired ? 'Ended: ' : 'Ends: '}
                  {formattedDeadline}
                </span>
              </div>
            </div>

            {/* Condition ID */}
            <div className="glass-panel">
              <h2 className="text-xl font-semibold text-white mb-4">
                Oracle Condition
              </h2>
              <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400 font-mono break-all">
                  {campaign.conditionId}
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This condition ID is used by the oracle to determine the campaign outcome.
              </p>
            </div>
          </div>

          {/* Right Column - Actions & Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Resolution Actions - Handles its own visibility internally */}
              <ResolutionActions campaignAddress={address} />

              {/* Fund Form - Only show if campaign is active */}
              <div className="glass-panel">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Fund this Campaign
                </h2>

                {canFund ? (
                  <FundForm campaignAddress={address} />
                ) : campaign.resolved ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">
                      This campaign has been resolved and is no longer accepting funds.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">
                      This campaign has ended and is awaiting resolution.
                    </p>
                  </div>
                )}
              </div>

              {/* Campaign Stats */}
              <div className="glass-panel">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Campaign Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span
                      className={`font-medium ${
                        campaign.resolved
                          ? campaign.outcomeYes
                            ? 'text-green-400'
                            : 'text-red-400'
                          : isExpired
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {campaign.resolved
                        ? campaign.outcomeYes
                          ? 'Successful'
                          : 'Failed'
                        : isExpired
                        ? 'Pending Resolution'
                        : 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resolved</span>
                    <span className="text-white">
                      {campaign.resolved ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Outcome</span>
                    <span className="text-white">
                      {campaign.resolved
                        ? campaign.outcomeYes
                          ? 'Yes'
                          : 'No'
                        : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Section - Oracle Controller */}
        <div className="mt-12">
          <OracleController
            conditionId={campaign.conditionId}
            campaignAddress={address}
          />
        </div>
      </div>
    </div>
  );
}