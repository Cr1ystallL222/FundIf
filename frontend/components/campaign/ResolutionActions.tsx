'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { CampaignABI } from '@/lib/contracts/abis';

interface ResolutionActionsProps {
  campaignAddress: string;
}

export default function ResolutionActions({ campaignAddress }: ResolutionActionsProps) {
  const { address: userAddress, isConnected } = useAccount();
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const campaignContract = {
    address: campaignAddress as `0x${string}`,
    abi: CampaignABI,
  } as const;

  // Read campaign state
  const { data: campaignData, isLoading: isReadLoading, refetch } = useReadContracts({
    contracts: [
      { ...campaignContract, functionName: 'resolved' },
      { ...campaignContract, functionName: 'outcomeYes' },
      { ...campaignContract, functionName: 'recipient' },
      {
        ...campaignContract,
        functionName: 'contributions',
        args: userAddress ? [userAddress] : undefined,
      },
    ],
    query: {
      enabled: true,
    },
  });

  const resolved = campaignData?.[0]?.result as boolean | undefined;
  const outcomeYes = campaignData?.[1]?.result as boolean | undefined;
  const recipient = campaignData?.[2]?.result as string | undefined;
  const userContribution = userAddress ? (campaignData?.[3]?.result as bigint | undefined) : 0n;

  // Withdraw contract write
  const {
    data: withdrawHash,
    writeContract: writeWithdraw,
    isPending: isWithdrawPending,
    error: withdrawError,
    reset: resetWithdraw,
  } = useWriteContract();

  // Refund contract write
  const {
    data: refundHash,
    writeContract: writeRefund,
    isPending: isRefundPending,
    error: refundError,
    reset: resetRefund,
  } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({ hash: withdrawHash });

  const { isLoading: isRefundConfirming, isSuccess: isRefundSuccess } =
    useWaitForTransactionReceipt({ hash: refundHash });

  // Handle withdraw
  const handleWithdraw = () => {
    resetWithdraw();
    writeWithdraw({
      address: campaignAddress as `0x${string}`,
      abi: CampaignABI,
      functionName: 'withdraw',
    });
  };

  // Handle refund
  const handleRefund = () => {
    resetRefund();
    writeRefund({
      address: campaignAddress as `0x${string}`,
      abi: CampaignABI,
      functionName: 'refund',
    });
  };

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  // Handle successful withdraw
  useEffect(() => {
    if (isWithdrawSuccess) {
      showToast('Funds withdrawn successfully! 🎉', 'success');
      refetch();
    }
  }, [isWithdrawSuccess, refetch]);

  // Handle successful refund
  useEffect(() => {
    if (isRefundSuccess) {
      showToast('Refund claimed successfully! 💰', 'success');
      refetch();
    }
  }, [isRefundSuccess, refetch]);

  // Handle errors
  useEffect(() => {
    if (withdrawError) {
      showToast(withdrawError.message.split('\n')[0].slice(0, 100), 'error');
    }
  }, [withdrawError]);

  useEffect(() => {
    if (refundError) {
      showToast(refundError.message.split('\n')[0].slice(0, 100), 'error');
    }
  }, [refundError]);

  // Loading state
  if (isReadLoading) {
    return (
      <div className="glass-panel p-6">
        <div className="space-y-3">
          <div className="h-6 bg-border rounded animate-pulse w-2/3" />
          <div className="h-4 bg-border rounded animate-pulse w-1/2" />
          <div className="h-12 bg-border rounded animate-pulse w-full mt-4" />
        </div>
      </div>
    );
  }

  // Don't render if campaign is not resolved
  if (!resolved) {
    return null;
  }

  const isRecipient =
    userAddress && recipient && userAddress.toLowerCase() === recipient.toLowerCase();
  const hasContributed = userContribution && userContribution > 0n;
  const formattedContribution = userContribution ? formatUnits(userContribution, 6) : '0';

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div
            className={`glass-panel p-4 flex items-center gap-3 min-w-[300px] ${
              toast.type === 'success' ? 'border-secondary' : 'border-primary'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.type === 'success' ? 'bg-secondary/20' : 'bg-primary/20'
              }`}
            >
              {toast.type === 'success' ? (
                <svg
                  className="w-5 h-5 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <p className="text-text-main font-medium text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-text-muted hover:text-text-main transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="glass-panel p-6">
        {/* Scenario A: Campaign Successful (outcomeYes = true) */}
        {outcomeYes && (
          <div className="space-y-4">
            {/* Success Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-7 h-7 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary">Campaign Successful!</h3>
                <p className="text-sm text-text-muted">
                  The oracle verified the goal was achieved.
                </p>
              </div>
            </div>

            {/* Recipient Actions */}
            {isRecipient ? (
              <div className="pt-4 border-t border-border space-y-4">
                <div className="bg-secondary/10 rounded-[var(--radius-box)] p-4">
                  <p className="text-sm text-text-main">
                    <span className="font-semibold text-secondary">You are the recipient.</span>{' '}
                    Withdraw the campaign funds to your wallet.
                  </p>
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawPending || isWithdrawConfirming || !isConnected}
                  className="w-full py-4 px-6 rounded-[var(--radius-box)] font-bold text-background 
                    bg-secondary hover:brightness-110 transition-all duration-200
                    hover:shadow-[0_8px_25px_-5px_rgba(78,205,196,0.4)]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                    flex items-center justify-center gap-3 text-lg"
                >
                  {isWithdrawPending || isWithdrawConfirming ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>{isWithdrawPending ? 'Confirm in Wallet...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6"
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
                      <span>Withdraw Funds</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-text-muted">
                  <span className="text-2xl">🎉</span>
                  <p>Campaign Successful! Funds released to the recipient.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scenario B: Campaign Failed (outcomeYes = false) */}
        {!outcomeYes && (
          <div className="space-y-4">
            {/* Failure Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Campaign Failed</h3>
                <p className="text-sm text-text-muted">
                  The goal was not met. Refunds are available.
                </p>
              </div>
            </div>

            {/* Contributor Actions */}
            {hasContributed ? (
              <div className="pt-4 border-t border-border space-y-4">
                <div className="bg-primary/10 rounded-[var(--radius-box)] p-4">
                  <p className="text-sm text-text-main">
                    <span className="font-semibold text-primary">You contributed</span>{' '}
                    <span className="font-mono font-bold">
                      ${Number(formattedContribution).toLocaleString()} USDC
                    </span>{' '}
                    to this campaign. Claim your refund below.
                  </p>
                </div>
                <button
                  onClick={handleRefund}
                  disabled={isRefundPending || isRefundConfirming || !isConnected}
                  className="w-full py-4 px-6 rounded-[var(--radius-box)] font-bold text-background 
                    bg-primary hover:bg-primary-hover transition-all duration-200
                    hover:shadow-[0_8px_25px_-5px_rgba(255,107,107,0.4)]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                    flex items-center justify-center gap-3 text-lg"
                >
                  {isRefundPending || isRefundConfirming ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>{isRefundPending ? 'Confirm in Wallet...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                      <span>Claim Refund</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-text-muted">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>Campaign failed. Refunds are enabled for contributors.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Not Connected Warning */}
        {!isConnected && (isRecipient || hasContributed) && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-muted text-center">
              Connect your wallet to perform actions.
            </p>
          </div>
        )}
      </div>
    </>
  );
}