// app/campaigns/new/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, CheckCircle, AlertCircle, Rocket } from 'lucide-react';
import MarketSelector from '@/components/forms/MarketSelector';
import { 
  useCreateCampaign, 
  useDeadlineFromDate,
  useConditionIdAsBytes32,
  BASE_SEPOLIA_CHAIN_ID 
} from '@/hooks/useCreateCampaign';

export default function CreateCampaignPage() {
  const { address, isConnected } = useAccount();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedConditionId, setSelectedConditionId] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);

  // Hook
  const {
    createCampaign,
    isPending,
    isWritePending,
    isConfirming,
    isSuccess,
    hash,
    error,
    createdCampaignAddress,
    reset,
    isCorrectChain,
  } = useCreateCampaign();

  // Convert deadline and conditionId
  const deadline = useDeadlineFromDate(deadlineDate);
  const conditionIdBytes32 = useConditionIdAsBytes32(selectedConditionId);

  // Use connected address as default recipient
  const recipient = (recipientAddress || address) as `0x${string}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedConditionId) {
      alert('Please select a prediction market');
      return;
    }

    createCampaign({
      title,
      description,
      goalAmount: parseFloat(goalAmount),
      recipient,
      conditionId: conditionIdBytes32,
      deadline,
    });
  };

  const handleMarketSelect = (conditionId: string, question: string) => {
    setSelectedConditionId(conditionId);
    setSelectedQuestion(question);
  };

  // Success state
  if (isSuccess && createdCampaignAddress) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            Campaign Created Successfully! 🎉
          </h1>
          <p className="text-green-600 dark:text-green-400 mb-6">
            Your prediction-gated crowdfunding campaign is now live.
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 text-left space-y-2">
            <div>
              <span className="text-sm text-gray-500">Campaign Address:</span>
              <p className="font-mono text-sm break-all">{createdCampaignAddress}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Transaction Hash:</span>
              <p className="font-mono text-sm break-all">{hash}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              View on Explorer
            </a>
            <a
              href={`/campaigns/${createdCampaignAddress}`}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              View Campaign
            </a>
          </div>

          <button
            onClick={() => {
              reset();
              setTitle('');
              setDescription('');
              setGoalAmount('');
              setSelectedConditionId('');
              setSelectedQuestion('');
            }}
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            Create Another Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Campaign
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a prediction-gated crowdfunding campaign powered by Polymarket
        </p>
      </div>

      {/* Network Warning */}
      {isConnected && !isCorrectChain && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Wrong Network
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Please switch to Base Sepolia to create a campaign.
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              Error Creating Campaign
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {error.message}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Campaign Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter campaign title..."
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-2 
                     focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your campaign and how the prediction affects fund release..."
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-2 
                     focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>

        {/* Market Selector */}
        <MarketSelector onSelect={handleMarketSelect} />

        {/* Selected Market Display */}
        {selectedConditionId && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
              ✓ Selected: {selectedQuestion}
            </p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-mono">
              ID: {selectedConditionId.slice(0, 20)}...
            </p>
          </div>
        )}

        {/* Goal Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Funding Goal (USDC) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="1000"
              min="1"
              step="0.01"
              required
              className="w-full pl-8 pr-16 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-2 
                       focus:ring-indigo-500/20 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              USDC
            </span>
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder={address || '0x... (defaults to your address)'}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-2 
                     focus:ring-indigo-500/20 transition-all font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to use your connected wallet address
          </p>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Funding Deadline *
          </label>
          <input
            type="datetime-local"
            onChange={(e) => setDeadlineDate(e.target.value ? new Date(e.target.value) : null)}
            min={new Date().toISOString().slice(0, 16)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-2 
                     focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !isConnected || !isCorrectChain || !selectedConditionId}
          className="w-full py-4 px-6 bg-linear-to-r from-indigo-600 to-purple-600 
                   hover:from-indigo-700 hover:to-purple-700
                   disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                   text-white font-semibold rounded-xl transition-all duration-200
                   flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          {isWritePending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Confirm in Wallet...
            </>
          ) : isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Campaign...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Create Campaign
            </>
          )}
        </button>

        {/* Transaction Status */}
        {hash && !isSuccess && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Transaction submitted:{' '}
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline font-mono"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </a>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}