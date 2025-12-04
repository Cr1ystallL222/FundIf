// app/create/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, CheckCircle, AlertCircle, Rocket, ExternalLink, RefreshCw } from 'lucide-react';
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

  const handleReset = () => {
    reset();
    setTitle('');
    setDescription('');
    setGoalAmount('');
    setSelectedConditionId('');
    setSelectedQuestion('');
    setDeadlineDate(null);
    setRecipientAddress('');
  };

  // Success state
  if (isSuccess && createdCampaignAddress) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="glass-panel p-8 text-center">
          {/* Success Icon */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center border border-secondary/30">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-text-main mb-2">
            Campaign Created Successfully! 🎉
          </h1>
          <p className="text-secondary mb-8">
            Your prediction-gated crowdfunding campaign is now live.
          </p>
          
          <div className="bg-background rounded-box p-6 mb-8 text-left border border-border space-y-4">
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Campaign Address
              </span>
              <p className="font-mono text-sm text-text-main break-all mt-1 bg-surface p-2 rounded-box border border-border">
                {createdCampaignAddress}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Transaction Hash
              </span>
              <p className="font-mono text-sm text-text-main break-all mt-1 bg-surface p-2 rounded-box border border-border">
                {hash}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface text-text-main rounded-box border border-border hover:bg-white/5 transition-colors font-medium"
            >
              View on Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={`/campaigns/${createdCampaignAddress}`}
              className="btn-primary"
            >
              View Campaign
            </a>
          </div>

          <button
            onClick={handleReset}
            className="mt-6 inline-flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Create Another Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-hero text-text-main mb-2">
          Create New Campaign
        </h1>
        <p className="text-text-muted text-lg">
          Create a prediction-gated crowdfunding campaign powered by Polymarket
        </p>
      </div>

      {/* Network Warning */}
      {isConnected && !isCorrectChain && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-box flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-text-main">
              Wrong Network
            </p>
            <p className="text-sm text-text-muted">
              Please switch to Base Sepolia to create a campaign.
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-box flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-text-main">
              Error Creating Campaign
            </p>
            <p className="text-sm text-text-muted">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-main">
            Campaign Title <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter campaign title..."
            required
            className="input-field"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-main">
            Description <span className="text-primary">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your campaign and how the prediction affects fund release..."
            required
            rows={4}
            className="input-field resize-none"
          />
        </div>

        {/* Market Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-main">
            Prediction Market <span className="text-primary">*</span>
          </label>
          <MarketSelector onSelect={handleMarketSelect} />
        </div>

        {/* Selected Market Display */}
        {selectedConditionId && (
          <div className="p-4 bg-secondary/10 rounded-box border border-secondary/30">
            <p className="text-sm text-text-main font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-secondary" />
              Selected: {selectedQuestion}
            </p>
            <p className="text-xs text-text-muted mt-1 font-mono">
              ID: {selectedConditionId.slice(0, 20)}...
            </p>
          </div>
        )}

        {/* Goal Amount */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-main">
            Funding Goal <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">$</span>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="1000"
              min="1"
              step="0.01"
              required
              className="input-field pl-8 pr-20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-box">
              USDC
            </span>
          </div>
        </div>

        {/* Recipient Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-main">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder={address || '0x... (defaults to your address)'}
            className="input-field font-mono text-sm"
          />
          <p className="text-xs text-text-muted">
            Leave empty to use your connected wallet address
          </p>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-main">
            Funding Deadline <span className="text-primary">*</span>
          </label>
          <input
            type="datetime-local"
            onChange={(e) => setDeadlineDate(e.target.value ? new Date(e.target.value) : null)}
            min={new Date().toISOString().slice(0, 16)}
            required
            className="input-field"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending || !isConnected || !isCorrectChain || !selectedConditionId}
            className={`
              w-full py-4 px-6 rounded-box font-bold
              flex items-center justify-center gap-3
              transition-all duration-200
              ${isPending || !isConnected || !isCorrectChain || !selectedConditionId
                ? 'bg-border text-text-muted cursor-not-allowed'
                : 'btn-primary'
              }
            `}
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
        </div>

        {/* Transaction Status */}
        {hash && !isSuccess && (
          <div className="text-center p-4 bg-secondary/10 rounded-box border border-secondary/30">
            <p className="text-sm text-secondary">
              Transaction submitted:{' '}
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-main hover:underline font-mono inline-flex items-center gap-1"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}