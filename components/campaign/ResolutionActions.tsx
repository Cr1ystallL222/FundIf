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
      // Check if funds are already withdrawn
      { ...campaignContract, functionName: 'withdrawn' },
    ],
    query: {
      enabled: true,
    },
  });

  const resolved = campaignData?.[0]?.result as boolean | undefined;
  const outcomeYes = campaignData?.[1]?.result as boolean | undefined;
  const recipient = campaignData?.[2]?.result as string | undefined;
  const userContribution = userAddress ? (campaignData?.[3]?.result as bigint | undefined) : 0n;
  const withdrawn = campaignData?.[4]?.result as boolean | undefined;

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
    if (withdrawn) return;
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
      showToast('Funds withdrawn successfully.', 'success');
      refetch();
    }
  }, [isWithdrawSuccess, refetch]);

  // Handle successful refund
  useEffect(() => {
    if (isRefundSuccess) {
      showToast('Refund processed successfully.', 'success');
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
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 fade-in duration-300">
          <div
            className={`glass-panel p-4 flex items-center gap-3 min-w-[300px] ${
              toast.type === 'success' ? 'border-secondary' : 'border-primary'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.type === 'success' ? 'bg-secondary/10' : 'bg-primary/10'
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
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 border border-secondary/20">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary">Campaign Successful</h3>
                <p className="text-sm text-text-muted">
                  The oracle has verified that the goal was achieved.
                </p>
              </div>
            </div>

            {/* Recipient Actions */}
            {isRecipient ? (
              <div className="pt-4 border-t border-border space-y-4">
                <div className={`rounded-[var(--radius-box)] p-4 border transition-colors duration-300 ${
                  withdrawn 
                    ? 'bg-secondary/5 border-secondary/20' 
                    : 'bg-secondary/10 border-transparent'
                }`}>
                  <p className="text-sm text-text-main">
                    <span className="font-semibold text-secondary">Recipient Status:</span>{' '}
                    {withdrawn 
                      ? "Funds have been successfully withdrawn to your wallet."
                      : "Action required. Please withdraw the campaign funds."}
                  </p>
                </div>
                
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawn || isWithdrawPending || isWithdrawConfirming || !isConnected}
                  className={`w-full py-4 px-6 rounded-[var(--radius-box)] font-bold text-lg
                    transition-all duration-300 flex items-center justify-center gap-3
                    ${withdrawn
                      ? 'border-2 border-secondary bg-transparent text-secondary cursor-default disabled:opacity-100 disabled:text-secondary disabled:border-secondary shadow-none' 
                      : 'bg-white text-black hover:bg-gray-100 hover:shadow-lg border-2 border-transparent' 
                    }
                    ${!withdrawn && (isWithdrawPending || isWithdrawConfirming) ? 'opacity-80 cursor-wait' : ''}
                  `}
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
                      <span>Processing Transaction...</span>
                    </>
                  ) : (
                    <>
                      {withdrawn ? (
                         // Checkmark Icon for Withdrawn state
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        // Download/Money Icon for Action state
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span>{withdrawn ? "Funds Withdrawn" : "Withdraw Funds"}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Non-recipient view
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 rounded bg-background/50">
                  <div className={`w-2 h-2 rounded-full ${withdrawn ? 'bg-secondary' : 'bg-secondary/50'}`} />
                  <p className="text-sm text-text-muted">
                    {withdrawn
                      ? 'Funds have been successfully withdrawn by the recipient.'
                      : 'Funds are available for withdrawal by the recipient.'}
                  </p>
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
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
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
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Campaign Failed</h3>
                <p className="text-sm text-text-muted">
                  The goal was not met. Refunds are now available.
                </p>
              </div>
            </div>

            {/* Contributor Actions */}
            {hasContributed ? (
              <div className="pt-4 border-t border-border space-y-4">
                <div className="bg-primary/5 rounded-[var(--radius-box)] p-4 border border-primary/10">
                  <p className="text-sm text-text-main">
                    <span className="font-semibold text-primary">Contribution Found:</span>{' '}
                    You contributed <span className="font-mono font-bold">${Number(formattedContribution).toLocaleString()} USDC</span>.
                  </p>
                </div>
                <button
                  onClick={handleRefund}
                  disabled={isRefundPending || isRefundConfirming || !isConnected}
                  className="w-full py-4 px-6 rounded-[var(--radius-box)] font-bold text-background 
                    bg-primary hover:bg-primary-hover transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
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
                      <span>Processing Transaction...</span>
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
                  <p>Refunding is enabled for all contributors.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Not Connected Warning */}
        {!isConnected && (isRecipient || hasContributed) && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-muted text-center">
              Please connect your wallet to proceed.
            </p>
          </div>
        )}
      </div>
    </>
  );
}