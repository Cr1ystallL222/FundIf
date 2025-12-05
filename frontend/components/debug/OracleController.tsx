'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { ORACLE_ADDRESS } from '@/lib/contracts/addresses';
import { CampaignABI } from '@/lib/contracts/abis';

/* ==========================================
   LOCAL ICONS & CONFIG
   ========================================== */
const Icons = {
  Tool: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Lightning: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  External: ({ className }: { className?: string }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Spinner: ({ className }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
};

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

interface OracleControllerProps {
  conditionId: string;
  campaignAddress: string;
}

export function OracleController({ conditionId, campaignAddress }: OracleControllerProps) {
  // --- Writes ---
  const { writeContract: writeOutcome, data: outcomeHash, isPending: isOutcomePending, error: outcomeError, reset: resetOutcome } = useWriteContract();
  const { writeContract: writeResolve, data: resolveHash, isPending: isResolvePending, error: resolveError, reset: resetResolve } = useWriteContract();

  // --- Receipts ---
  const { isLoading: isOutcomeConfirming, isSuccess: isOutcomeSuccess } = useWaitForTransactionReceipt({ hash: outcomeHash });
  const { isLoading: isResolveConfirming, isSuccess: isResolveSuccess } = useWaitForTransactionReceipt({ hash: resolveHash });

  // --- Handlers ---
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

  const isOutcomeLoading = isOutcomePending || isOutcomeConfirming;
  const isResolveLoading = isResolvePending || isResolveConfirming;

  return (
    <div className="relative group rounded-xl border border-dashed border-red-500/20 bg-red-950/5 p-6 transition-colors hover:border-red-500/40 hover:bg-red-950/10">
      <div className="absolute -top-3 left-4 bg-[#09090b] px-2 text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
        <Icons.Tool className="w-3 h-3" />
        Debug Controller
      </div>

      <div className="space-y-4">
        {/* Condition ID Display */}
        <div className="flex flex-col gap-1">
           <label className="text-[10px] uppercase tracking-wide text-zinc-500 font-bold">Target Condition ID</label>
           <div className="p-2 bg-black/40 rounded border border-red-900/20 font-mono text-[10px] text-zinc-400 break-all">
             {conditionId}
           </div>
        </div>

        {/* Control Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSetOutcome(true)}
            disabled={isOutcomeLoading}
            className="flex flex-col items-center justify-center p-3 gap-2 rounded-lg bg-green-900/10 border border-green-500/20 text-green-400 hover:bg-green-900/20 hover:border-green-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOutcomeLoading ? <Icons.Spinner className="w-5 h-5" /> : <Icons.Check className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase">Force Yes</span>
          </motion.button>

          <motion.button
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => handleSetOutcome(false)}
             disabled={isOutcomeLoading}
             className="flex flex-col items-center justify-center p-3 gap-2 rounded-lg bg-red-900/10 border border-red-500/20 text-red-400 hover:bg-red-900/20 hover:border-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOutcomeLoading ? <Icons.Spinner className="w-5 h-5" /> : <Icons.X className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase">Force No</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleTriggerResolution}
          disabled={isResolveLoading}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-50"
        >
          {isResolveLoading ? <Icons.Spinner className="w-4 h-4" /> : <Icons.Lightning className="w-4 h-4 text-yellow-400" />}
          <span className="text-xs font-bold uppercase tracking-wide">Trigger Resolution</span>
        </motion.button>

        {/* Mini Console / Logs */}
        <AnimatePresence>
          {(isOutcomeSuccess || isResolveSuccess || outcomeError || resolveError) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 bg-black/50 rounded border border-white/5 font-mono text-[10px] space-y-2">
                 {isOutcomeSuccess && (
                   <div className="text-green-400 flex items-center gap-2">
                     <span>✓ Outcome Set</span>
                     {outcomeHash && <a href={`https://sepolia.basescan.org/tx/${outcomeHash}`} target="_blank" className="underline opacity-50 hover:opacity-100"><Icons.External /></a>}
                   </div>
                 )}
                 {isResolveSuccess && (
                   <div className="text-blue-400 flex items-center gap-2">
                     <span>✓ Resolution Triggered</span>
                     {resolveHash && <a href={`https://sepolia.basescan.org/tx/${resolveHash}`} target="_blank" className="underline opacity-50 hover:opacity-100"><Icons.External /></a>}
                   </div>
                 )}
                 {outcomeError && <div className="text-red-400">Error: {outcomeError.message.slice(0, 50)}...</div>}
                 {resolveError && <div className="text-red-400">Error: {resolveError.message.slice(0, 50)}...</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-center text-red-500/40 uppercase font-mono">Testnet Only Environment</p>
      </div>
    </div>
  );
}