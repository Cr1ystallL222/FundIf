// components/forms/CreateCampaignForm.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { isAddress } from 'viem';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Rocket,
  DollarSign,
  Calendar,
  User,
  FileText,
  Type,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Info,
  Wallet,
} from 'lucide-react';

import MarketSelector from '@/components/forms/MarketSelector';
import {
  useCreateCampaign,
  useConditionIdAsBytes32,
  BASE_SEPOLIA_CHAIN_ID,
} from '@/hooks/useCreateCampaign';

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const createCampaignSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z
    .string()
    .min(1, 'Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  
  goalAmount: z
    .number({ message: 'Goal amount is required' }) // Changed from required_error
    .positive('Goal must be greater than 0')
    .min(1, 'Minimum goal is 1 USDC')
    .max(10000000, 'Maximum goal is 10,000,000 USDC'),
  
  recipient: z
    .string()
    .min(1, 'Recipient address is required')
    .refine((val) => isAddress(val), 'Please enter a valid Ethereum address'),
  
  deadline: z
    .date({ message: 'Deadline is required' }) // Changed from required_error
    .refine(
      (date) => date > new Date(),
      'Deadline must be in the future'
    )
    .refine(
      (date) => date > new Date(Date.now() + 60 * 60 * 1000),
      'Deadline must be at least 1 hour from now'
    ),
  
  conditionId: z
    .string()
    .min(1, 'Please select a prediction market'),
  
  marketQuestion: z
    .string()
    .optional(),
});

type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ label, error, required, icon, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface SuccessCardProps {
  campaignAddress: string;
  transactionHash: string;
  onCreateAnother: () => void;
}

function SuccessCard({ campaignAddress, transactionHash, onCreateAnother }: SuccessCardProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-8 text-center animate-in fade-in-0 zoom-in-95 duration-300">
      {/* Success Icon */}
      <div className="relative mx-auto w-20 h-20 mb-6">
        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
        <div className="relative w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
        Campaign Created Successfully! 🎉
      </h2>
      <p className="text-green-600 dark:text-green-400 mb-8">
        Your prediction-gated crowdfunding campaign is now live on Base Sepolia.
      </p>

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 text-left shadow-sm">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Campaign Address
            </span>
            <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all mt-1 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
              {campaignAddress}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Transaction Hash
            </span>
            <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all mt-1 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
              {transactionHash}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`https://sepolia.basescan.org/tx/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          View on Explorer
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={() => router.push(`/campaigns/${campaignAddress}`)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
        >
          View Campaign
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Create Another */}
      <button
        onClick={onCreateAnother}
        className="mt-6 inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
      >
        <RefreshCw className="w-4 h-4" />
        Create Another Campaign
      </button>
    </div>
  );
}

// =============================================================================
// MAIN FORM COMPONENT
// =============================================================================

interface CreateCampaignFormProps {
  onSuccess?: (campaignAddress: string) => void;
  redirectOnSuccess?: boolean;
  className?: string;
}

export default function CreateCampaignForm({
  onSuccess,
  redirectOnSuccess = true,
  className = '',
}: CreateCampaignFormProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  // Local state for market selection (needed for controlled component)
  const [selectedMarketQuestion, setSelectedMarketQuestion] = useState('');

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      goalAmount: undefined,
      recipient: '',
      deadline: undefined,
      conditionId: '',
      marketQuestion: '',
    },
  });

  // Watch form values
  const watchedConditionId = watch('conditionId');
  const watchedGoalAmount = watch('goalAmount');
  const watchedDeadline = watch('deadline');

  // Create campaign hook
  const {
    createCampaign,
    isPending,
    isWritePending,
    isConfirming,
    isSuccess,
    hash,
    error: txError,
    createdCampaignAddress,
    reset: resetTx,
    isCorrectChain,
  } = useCreateCampaign();

  // Convert conditionId to bytes32 format
  const conditionIdBytes32 = useConditionIdAsBytes32(watchedConditionId || '');

  // Set default recipient to connected wallet
  useEffect(() => {
    if (address && !watch('recipient')) {
      setValue('recipient', address, { shouldValidate: true });
    }
  }, [address, setValue, watch]);

  // Handle success
  useEffect(() => {
    if (isSuccess && createdCampaignAddress) {
      onSuccess?.(createdCampaignAddress);
      
      if (redirectOnSuccess) {
        // Small delay to show success state
        setTimeout(() => {
          router.push(`/campaigns/${createdCampaignAddress}`);
        }, 3000);
      }
    }
  }, [isSuccess, createdCampaignAddress, onSuccess, redirectOnSuccess, router]);

  // Handle market selection from MarketSelector
  const handleMarketSelect = useCallback(
    (conditionId: string, question: string) => {
      setValue('conditionId', conditionId, { shouldValidate: true });
      setValue('marketQuestion', question);
      setSelectedMarketQuestion(question);
    },
    [setValue]
  );

  // Form submission handler
  const onSubmit = (data: CreateCampaignFormData) => {
    if (!isConnected) {
      return;
    }

    // Convert deadline to Unix timestamp (bigint)
    const deadlineTimestamp = BigInt(Math.floor(data.deadline.getTime() / 1000));

    createCampaign({
      title: data.title,
      description: data.description,
      goalAmount: data.goalAmount,
      recipient: data.recipient as `0x${string}`,
      conditionId: conditionIdBytes32,
      deadline: deadlineTimestamp,
    });
  };

  // Reset form and transaction state
  const handleReset = () => {
    reset();
    resetTx();
    setSelectedMarketQuestion('');
  };

  // Calculate minimum date (1 hour from now)
  const minDate = new Date(Date.now() + 60 * 60 * 1000);
  const minDateString = minDate.toISOString().slice(0, 16);

  // Calculate max date (1 year from now)
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const maxDateString = maxDate.toISOString().slice(0, 16);

  // Show success card if transaction succeeded
  if (isSuccess && createdCampaignAddress && hash) {
    return (
      <div className={className}>
        <SuccessCard
          campaignAddress={createdCampaignAddress}
          transactionHash={hash}
          onCreateAnother={handleReset}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Form Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Campaign</h1>
              <p className="text-indigo-100 mt-1">
                Launch a prediction-gated crowdfunding campaign
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="px-6 sm:px-8 pt-6 space-y-4">
          {/* Not Connected Warning */}
          {!isConnected && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3">
              <Wallet className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Wallet Not Connected
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Please connect your wallet to create a campaign.
                </p>
              </div>
            </div>
          )}

          {/* Wrong Network Warning */}
          {isConnected && !isCorrectChain && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Wrong Network
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Please switch to Base Sepolia (Chain ID: {BASE_SEPOLIA_CHAIN_ID}) to create a campaign.
                </p>
              </div>
            </div>
          )}

          {/* Transaction Error */}
          {txError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-800 dark:text-red-200">
                  Transaction Failed
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 break-words">
                  {txError.message.includes('User rejected')
                    ? 'You rejected the transaction in your wallet.'
                    : txError.message.slice(0, 200)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          {/* Title Field */}
          <FormField
            label="Campaign Title"
            error={errors.title?.message}
            required
            icon={<Type className="w-4 h-4" />}
            hint="A clear, compelling title for your campaign"
          >
            <input
              {...register('title')}
              type="text"
              placeholder="e.g., Fund Climate Research if Paris Agreement Goals Met"
              disabled={isPending}
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                bg-gray-50 dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errors.title
                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                }
                focus:outline-none focus:ring-4
              `}
            />
          </FormField>

          {/* Description Field */}
          <FormField
            label="Description"
            error={errors.description?.message}
            required
            icon={<FileText className="w-4 h-4" />}
            hint="Explain your campaign and how the prediction market condition affects fund release"
          >
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe your campaign goals, how the funds will be used, and what prediction market outcome triggers the release of funds..."
              disabled={isPending}
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none
                bg-gray-50 dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errors.description
                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                }
                focus:outline-none focus:ring-4
              `}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{watch('description')?.length || 0} / 2000 characters</span>
            </div>
          </FormField>

          {/* Prediction Market Selector */}
          <FormField
            label="Prediction Market Condition"
            error={errors.conditionId?.message}
            required
            icon={<TrendingUp className="w-4 h-4" />}
            hint="Select the Polymarket prediction that will determine fund release"
          >
            <Controller
              name="conditionId"
              control={control}
              render={({ field }) => (
                <MarketSelector
                  onSelect={handleMarketSelect}
                  disabled={isPending}
                  initialConditionId={field.value}
                  className={errors.conditionId ? '[&>button]:border-red-300 dark:[&>button]:border-red-700' : ''}
                />
              )}
            />
          </FormField>

          {/* Selected Market Preview */}
          {selectedMarketQuestion && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    Selected Market
                  </p>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                    {selectedMarketQuestion}
                  </p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 font-mono truncate">
                    ID: {watchedConditionId?.slice(0, 30)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Two Column Grid for Goal and Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal Amount Field */}
            <FormField
              label="Funding Goal"
              error={errors.goalAmount?.message}
              required
              icon={<DollarSign className="w-4 h-4" />}
              hint="Amount in USDC"
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  $
                </span>
                <input
                  {...register('goalAmount', { valueAsNumber: true })}
                  type="number"
                  placeholder="1000"
                  min="1"
                  step="0.01"
                  disabled={isPending}
                  className={`
                    w-full pl-8 pr-20 py-3 rounded-xl border-2 transition-all duration-200
                    bg-gray-50 dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.goalAmount
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }
                    focus:outline-none focus:ring-4
                  `}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  USDC
                </span>
              </div>
              {watchedGoalAmount && watchedGoalAmount > 0 && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  ≈ ${watchedGoalAmount.toLocaleString()} USDC
                </p>
              )}
            </FormField>

            {/* Deadline Field */}
            <FormField
              label="Funding Deadline"
              error={errors.deadline?.message}
              required
              icon={<Calendar className="w-4 h-4" />}
              hint="When the funding period ends"
            >
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <input
                    type="datetime-local"
                    min={minDateString}
                    max={maxDateString}
                    disabled={isPending}
                    value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        field.onChange(new Date(value));
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                    className={`
                      w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                      bg-gray-50 dark:bg-gray-800
                      text-gray-900 dark:text-gray-100
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${errors.deadline
                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }
                      focus:outline-none focus:ring-4
                    `}
                  />
                )}
              />
              {watchedDeadline && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  {Math.ceil((watchedDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days from now
                </p>
              )}
            </FormField>
          </div>

          {/* Recipient Address Field */}
          <FormField
            label="Recipient Address"
            error={errors.recipient?.message}
            required
            icon={<User className="w-4 h-4" />}
            hint="The address that will receive funds if the campaign succeeds"
          >
            <div className="relative">
              <input
                {...register('recipient')}
                type="text"
                placeholder="0x..."
                disabled={isPending}
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-mono text-sm
                  bg-gray-50 dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.recipient
                    ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }
                  focus:outline-none focus:ring-4
                `}
              />
              {address && watch('recipient') !== address && (
                <button
                  type="button"
                  onClick={() => setValue('recipient', address, { shouldValidate: true })}
                  disabled={isPending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors disabled:opacity-50"
                >
                  Use My Wallet
                </button>
              )}
            </div>
          </FormField>

          {/* Summary Card */}
          {isValid && watchedGoalAmount && watchedConditionId && (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Campaign Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Goal</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    ${watchedGoalAmount.toLocaleString()} USDC
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {watchedDeadline?.toLocaleDateString() || 'Not set'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Condition</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {selectedMarketQuestion || 'Selected'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending || !isConnected || !isCorrectChain || !isValid}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-white
                flex items-center justify-center gap-3
                transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-indigo-500/20
                ${isPending || !isConnected || !isCorrectChain || !isValid
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
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

            {/* Form validation status */}
            {!isValid && isDirty && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                Please fill in all required fields correctly
              </p>
            )}
          </div>

          {/* Transaction Hash Display */}
          {hash && !isSuccess && (
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Transaction submitted!{' '}
                <a
                  href={`https://sepolia.basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono underline hover:no-underline"
                >
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 sm:px-8 pb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-700 dark:text-gray-300">How it works:</strong> Your campaign
              will accept contributions until the deadline. If the selected prediction market resolves
              to "Yes" and the funding goal is met, funds are released to the recipient. Otherwise,
              contributors can claim refunds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}