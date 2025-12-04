// components/debug/OracleController.tsx
"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ORACLE_ADDRESS } from "@/lib/contracts/addresses";
import { CampaignABI } from "@/lib/contracts/abis";

// ============================================================================
// Local ABI for MockOracle
// ============================================================================
const MockOracleABI = [
  {
    inputs: [
      { name: "conditionId", type: "bytes32" },
      { name: "outcome", type: "bool" },
    ],
    name: "setOutcome",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ============================================================================
// Types
// ============================================================================
interface OracleControllerProps {
  conditionId: string;
  campaignAddress: string;
}

// ============================================================================
// Component
// ============================================================================
export function OracleController({
  conditionId,
  campaignAddress,
}: OracleControllerProps) {
  // --------------------------------------------------------------------------
  // Contract Writes
  // --------------------------------------------------------------------------
  const {
    writeContract: writeOutcome,
    data: outcomeHash,
    isPending: isOutcomePending,
    error: outcomeError,
    reset: resetOutcome,
  } = useWriteContract();

  const {
    writeContract: writeResolve,
    data: resolveHash,
    isPending: isResolvePending,
    error: resolveError,
    reset: resetResolve,
  } = useWriteContract();

  // --------------------------------------------------------------------------
  // Transaction Receipts
  // --------------------------------------------------------------------------
  const { isLoading: isOutcomeConfirming, isSuccess: isOutcomeSuccess } =
    useWaitForTransactionReceipt({
      hash: outcomeHash,
    });

  const { isLoading: isResolveConfirming, isSuccess: isResolveSuccess } =
    useWaitForTransactionReceipt({
      hash: resolveHash,
    });

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleSetOutcome = (outcome: boolean) => {
    resetOutcome();
    writeOutcome({
      address: ORACLE_ADDRESS as `0x${string}`,
      abi: MockOracleABI,
      functionName: "setOutcome",
      args: [conditionId as `0x${string}`, outcome],
    });
  };

  const handleTriggerResolution = () => {
    resetResolve();
    writeResolve({
      address: campaignAddress as `0x${string}`,
      abi: CampaignABI,
      functionName: "resolve",
    });
  };

  // --------------------------------------------------------------------------
  // Derived State
  // --------------------------------------------------------------------------
  const isOutcomeLoading = isOutcomePending || isOutcomeConfirming;
  const isResolveLoading = isResolvePending || isResolveConfirming;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="rounded-lg border-2 border-dashed border-red-500/50 bg-red-950/20 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">🛠️</span>
        <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-red-400">
          DEMO ONLY: Oracle Controller
        </h3>
      </div>

      {/* Condition ID Display */}
      <div className="mb-4 rounded bg-black/30 p-2">
        <p className="font-mono text-xs text-gray-400">
          <span className="text-gray-500">Condition ID:</span>{" "}
          <span className="break-all text-gray-300">
            {conditionId.slice(0, 10)}...{conditionId.slice(-8)}
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Outcome Buttons Row */}
        <div className="flex gap-2">
          {/* Force YES Button */}
          <button
            onClick={() => handleSetOutcome(true)}
            disabled={isOutcomeLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOutcomeLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <span>✓</span>
                <span>Force Outcome: YES</span>
              </>
            )}
          </button>

          {/* Force NO Button */}
          <button
            onClick={() => handleSetOutcome(false)}
            disabled={isOutcomeLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOutcomeLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <span>✗</span>
                <span>Force Outcome: NO</span>
              </>
            )}
          </button>
        </div>

        {/* Trigger Resolution Button */}
        <button
          onClick={handleTriggerResolution}
          disabled={isResolveLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResolveLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <span>⚡</span>
              <span>Trigger Resolution</span>
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      <div className="mt-4 space-y-2">
        {/* Success States */}
        {isOutcomeSuccess && (
          <StatusMessage type="success" message="Outcome set successfully!" />
        )}
        {isResolveSuccess && (
          <StatusMessage type="success" message="Resolution triggered!" />
        )}

        {/* Error States */}
        {outcomeError && (
          <StatusMessage
            type="error"
            message={`Outcome Error: ${outcomeError.message.slice(0, 100)}...`}
          />
        )}
        {resolveError && (
          <StatusMessage
            type="error"
            message={`Resolve Error: ${resolveError.message.slice(0, 100)}...`}
          />
        )}

        {/* Transaction Hashes */}
        {outcomeHash && (
          <TransactionLink hash={outcomeHash} label="Outcome Tx" />
        )}
        {resolveHash && (
          <TransactionLink hash={resolveHash} label="Resolve Tx" />
        )}
      </div>

      {/* Warning Footer */}
      <p className="mt-4 text-center font-mono text-xs text-red-400/60">
        ⚠️ These controls are for demo/testing purposes only
      </p>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
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
  );
}

function StatusMessage({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const styles = {
    success: "bg-green-900/30 border-green-500/30 text-green-400",
    error: "bg-red-900/30 border-red-500/30 text-red-400",
  };

  const icons = {
    success: "✓",
    error: "✗",
  };

  return (
    <div
      className={`flex items-center gap-2 rounded border p-2 text-xs ${styles[type]}`}
    >
      <span>{icons[type]}</span>
      <span className="break-all">{message}</span>
    </div>
  );
}

function TransactionLink({ hash, label }: { hash: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded bg-black/20 p-2 text-xs text-gray-400">
      <span className="text-gray-500">{label}:</span>
      <a
        href={`https://sepolia.basescan.org/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-blue-400 hover:text-blue-300 hover:underline"
      >
        {hash.slice(0, 10)}...{hash.slice(-8)}
      </a>
    </div>
  );
}

export default OracleController;