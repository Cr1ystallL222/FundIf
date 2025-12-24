'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccount, useSwitchChain } from 'wagmi';
import { isAddress } from 'viem';
import { useRouter } from 'next/navigation';
import { 
  Loader2, AlertCircle, CheckCircle2, ArrowRight, Search, Info, 
  Calendar, Wallet, RefreshCw, ExternalLink, Upload, X, Image as ImageIcon
} from 'lucide-react';

import { 
  useCreateCampaign, 
  useConditionIdAsBytes32,
  BASE_SEPOLIA_CHAIN_ID 
} from '@/hooks/useCreateCampaign';
import IdentityVerify from '@/components/ui/IdentityVerify';

// =============================================================================
// 1. CONFIGURATION & UTILS
// =============================================================================

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// =============================================================================
// 2. CUSTOM ICONS
// =============================================================================

const Icons = {
  Polymarket: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  USDC: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V18M15 9H11C10.4477 9 10 9.44772 10 10V10C10 10.5523 10.4477 11 11 11H13C13.5523 11 14 11.4477 14 12V12C14 12.5523 13.5523 13 13 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Ethereum: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M11.999 2L4 14.5L11.999 22L20 14.5L11.999 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.999 2V15M11.999 15L11.999 22M11.999 15L20 14.5M11.999 15L4 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// =============================================================================
// 3. VALIDATION
// =============================================================================

const campaignSchema = z.object({
  title: z.string().min(5).max(60),
  description: z.string().min(20).max(1000),
  goalAmount: z.number().min(10).max(1000000),
  recipient: z.string().refine((val) => isAddress(val), { message: "Invalid address" }),
  deadline: z.string().refine((val) => new Date(val) > new Date(), { message: "Deadline must be in the future" }),
  conditionId: z.string().min(1, "Market selection is required"),
  marketQuestion: z.string().optional(),
  marketSlug: z.string().min(1, "Market slug is required"), 
});

type FormValues = z.infer<typeof campaignSchema>;

// =============================================================================
// 4. UI COMPONENTS
// =============================================================================

const Tooltip = ({ content }: { content: string }) => {
  return (
    <div className="group relative inline-flex items-center justify-center ml-2 cursor-help">
      <Info className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#18181b] border border-white/10 rounded-md text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#18181b]" />
      </div>
    </div>
  );
};

const FormLabel = ({ children, required, tooltip }: { children: React.ReactNode; required?: boolean; tooltip?: string }) => (
  <label className="flex items-center text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
    {children}
    {required && <span className="text-lime-500 ml-0.5">*</span>}
    {tooltip && <Tooltip content={tooltip} />}
  </label>
);

const InputError = ({ message }: { message?: string }) => (
  <AnimatePresence mode="wait">
    {message && (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="flex items-center gap-1.5 mt-2 text-red-400 text-xs font-medium"
      >
        <AlertCircle className="w-3 h-3" />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

// =============================================================================
// 5. MARKET SELECTOR
// =============================================================================

interface Market {
  conditionId: string;
  question: string;
  slug: string;
  outcomePrices: number[];
  eventTitle?: string;
  endDate?: string | null;
}

const MarketSearch = ({ onSelect, disabled, error }: { onSelect: (m: Market) => void; disabled: boolean; error?: string }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      try {
        const limit = 50;
        const endpoint = query 
          ? `/api/markets?search=${encodeURIComponent(query)}&limit=${limit}`
          : `/api/markets?limit=${limit}`;
        
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.success) setResults(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchMarkets();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative z-50" ref={wrapperRef}>
      <div className={cn(
        "relative flex items-center w-full h-12 px-4 rounded-lg border bg-elevated transition-all duration-200",
        error ? "border-red-500/50 focus-within:border-red-500" : "border-white/10 focus-within:border-lime-500/50 focus-within:ring-1 focus-within:ring-lime-500/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <Search className="w-4 h-4 text-zinc-500 mr-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Search events (e.g. 'Bitcoin', 'Election', 'Rate Cut')..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600"
        />
        {loading && <Loader2 className="w-4 h-4 text-lime-500 animate-spin" />}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#111113] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800"
          >
            {results.length === 0 && !loading ? (
              <div className="p-4 text-center text-xs text-zinc-500">No markets found matching "{query}"</div>
            ) : (
              results.map((market) => (
                <button
                  key={market.conditionId}
                  type="button"
                  onClick={() => {
                    onSelect(market);
                    setQuery(market.question);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-sm text-zinc-200 group-hover:text-white font-medium truncate flex-1">{market.question}</div>
                    {market.endDate && (
                      <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap">
                        {new Date(market.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500 font-mono">YES: {Math.round((market.outcomePrices?.[0] || 0) * 100)}%</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px] opacity-50">{market.eventTitle}</span>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// 6. MAIN PAGE COMPONENT
// =============================================================================

export default function CreateCampaignPage() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientInput, setRecipientInput] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    createCampaign,
    isPending,
    isWritePending,
    isConfirming,
    isSuccess,
    hash,
    error: writeError,
    createdCampaignAddress,
    isCorrectChain,
    reset: resetTx
  } = useCreateCampaign();

  const { 
    register, handleSubmit, control, setValue, watch, 
    formState: { errors, isValid } 
  } = useForm<FormValues>({
    resolver: zodResolver(campaignSchema),
    mode: 'onChange',
    defaultValues: { recipient: '' }
  });

  const watchedValues = useWatch({ control });
  const conditionIdBytes32 = useConditionIdAsBytes32(watchedValues.conditionId || '');

  useEffect(() => {
    if (address && !recipientInput) {
      setRecipientInput(address);
      setValue('recipient', address, { shouldValidate: true });
    }
  }, [address]); 

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File size too large. Please upload an image under 4MB.");
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  useEffect(() => {
    const uploadImageToServer = async () => {
      if (isSuccess && createdCampaignAddress && imageFile) {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', imageFile);
          formData.append('campaignAddress', createdCampaignAddress);

          const res = await fetch('/api/campaign/upload', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error('Failed to upload image');
          console.log("Image uploaded successfully for campaign", createdCampaignAddress);
        } catch (error) {
          console.error("Image upload error:", error);
        } finally {
          setIsUploading(false);
        }
      }
    };

    uploadImageToServer();
  }, [isSuccess, createdCampaignAddress, imageFile]);

  const onSubmit = (data: FormValues) => {
    if (!isConnected) return;
    setIsSubmitting(true);
    
    try {
      const deadlineTimestamp = BigInt(Math.floor(new Date(data.deadline).getTime() / 1000));
      
      createCampaign({
        title: data.title,
        description: data.description,
        goalAmount: data.goalAmount,
        recipient: data.recipient as `0x${string}`,
        conditionId: conditionIdBytes32,
        marketSlug: data.marketSlug,
        deadline: deadlineTimestamp,
      });
    } catch (err) {
      console.error("Submission error", err);
      setIsSubmitting(false);
    }
  };

  // ===========================================================================
  // SUCCESS STATE
  // ===========================================================================
  if (isSuccess && createdCampaignAddress) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-surface border border-white/10 rounded-2xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-lime-500/10 blur-3xl -z-10" />
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-lime-500/10 rounded-full flex items-center justify-center border border-lime-500/20 mb-6"
            >
              <CheckCircle2 className="w-8 h-8 text-lime-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">Campaign Deployed</h2>
            <p className="text-zinc-400 text-sm mb-8">
              Your condition-based fundraising campaign is live on the blockchain.
              {isUploading && <span className="block mt-2 text-lime-500 text-xs animate-pulse">Syncing image to server...</span>}
            </p>

            <div className="w-full bg-[#111113] border border-white/5 rounded-xl p-4 mb-6 text-left space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Address</label>
                <div className="flex items-center justify-between mt-1">
                  <code className="text-xs text-zinc-300 font-mono bg-black/30 px-2 py-1 rounded">{createdCampaignAddress}</code>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </div>
              </div>
              <div className="h-px bg-white/5" />
              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Transaction</label>
                <div className="flex items-center justify-between mt-1">
                  <code className="text-xs text-zinc-300 font-mono bg-black/30 px-2 py-1 rounded">{hash?.slice(0,20)}...</code>
                  <a 
                    href={`https://basescan.org/tx/${hash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1"
                  >
                    Explorer <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { resetTx(); window.location.reload(); }}
                className="flex-1 py-3 px-4 rounded-lg border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Create New
              </button>
              <button
                onClick={() => router.push(`/campaign/${createdCampaignAddress}`)} 
                className="flex-1 py-3 px-4 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                View Campaign
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===========================================================================
  // MAIN FORM
  // ===========================================================================
  return (
    <div className="min-h-screen bg-surface text-white selection:bg-lime-500/30 selection:text-lime-200">
      <div className="fixed top-0 left-0 right-0 h-96 bg-linear-to-b from-lime-900/10 via-surface/50 to-surface pointer-events-none z-0" />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 lg:pt-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-lime-500" />
            <span className="text-lime-400 text-xs font-mono uppercase tracking-widest">Campaign Studio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Create Logic-Gated Funding
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Launch a crowdfunding campaign where funds are only released if a specific 
            Polymarket event resolves to <span className="text-white font-medium">"YES"</span>. 
            Trustless. Automated.
          </p>
        </motion.div>

        {/* Network Check */}
        {isConnected && !isCorrectChain && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-200">Wrong Network</h3>
                <p className="text-xs text-amber-200/80 mt-1">
                  Your wallet is on Chain ID {chainId || 'unknown'}. Please switch to Base (Chain ID: {BASE_SEPOLIA_CHAIN_ID}).
                </p>
              </div>
            </div>
            <button
              onClick={() => switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID })}
              disabled={isSwitchingChain}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0 ml-4"
            >
              {isSwitchingChain ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Switching...
                </>
              ) : (
                'Switch Network'
              )}
            </button>
          </motion.div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          
          {/* LEFT COLUMN: FORM */}
          <div className="lg:col-span-7 space-y-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* 1. Campaign Details */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-white font-medium pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px]">1</span>
                  Details
                </div>
                
                <div className="space-y-1">
                  <FormLabel required tooltip="The public name of your fundraising campaign.">Campaign Title</FormLabel>
                  <input
                    {...register('title')}
                    disabled={isPending}
                    placeholder="e.g. Mainnet Launch Fund"
                    className={cn(
                      "w-full bg-elevated border rounded-lg px-4 py-3 text-sm text-white transition-all duration-200 outline-none placeholder:text-zinc-600",
                      errors.title ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                    )}
                  />
                  <InputError message={errors.title?.message} />
                </div>

                {/* IMAGE UPLOAD SECTION */}
                <div className="space-y-1">
                  <FormLabel tooltip="Upload a cover image for your campaign card (Max 4MB)">Cover Image</FormLabel>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isPending}
                      id="image-upload"
                      className="hidden"
                    />
                    {!imagePreview ? (
                      <label 
                        htmlFor="image-upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg bg-elevated/50 hover:bg-elevated hover:border-lime-500/30 transition-all cursor-pointer"
                      >
                        <div className="p-3 rounded-full bg-white/5 group-hover:scale-110 transition-transform">
                           <Upload className="w-5 h-5 text-zinc-400 group-hover:text-lime-400" />
                        </div>
                        <span className="mt-2 text-xs text-zinc-500 group-hover:text-zinc-300">Click to upload image</span>
                      </label>
                    ) : (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10 group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                          <label htmlFor="image-upload" className="p-2 bg-white/10 rounded-full hover:bg-white/20 cursor-pointer text-white" title="Change Image">
                            <ImageIcon className="w-5 h-5" />
                          </label>
                          <button 
                            type="button" 
                            onClick={clearImage} 
                            className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors" 
                            title="Remove Image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <FormLabel required>Description</FormLabel>
                  <textarea
                    {...register('description')}
                    disabled={isPending}
                    rows={5}
                    placeholder="Explain why you need funds and how the prediction market event aligns with your goals..."
                    className={cn(
                      "w-full bg-elevated border rounded-lg px-4 py-3 text-sm text-white transition-all duration-200 outline-none placeholder:text-zinc-600 resize-none",
                      errors.description ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                    )}
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-zinc-600">{watchedValues.description?.length || 0}/1000</span>
                  </div>
                  <InputError message={errors.description?.message} />
                </div>
              </section>

              {/* 2. The Condition (Polymarket) */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-white font-medium pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px]">2</span>
                  The Condition
                </div>

                <div className="space-y-1">
                  <FormLabel required tooltip="Funds are only released if this event resolves to YES. Otherwise, backers get refunded.">
                    Prediction Market Event
                  </FormLabel>
                  
                  <Controller
                    control={control}
                    name="conditionId"
                    render={({ field }) => (
                      <MarketSearch 
                        disabled={isPending}
                        error={errors.conditionId?.message}
                        onSelect={(market) => {
                          field.onChange(market.conditionId);
                          setValue('marketQuestion', market.question);
                          setValue('marketSlug', market.slug, { shouldValidate: true });

                          if (market.endDate) {
                             const date = new Date(market.endDate);
                             date.setHours(date.getHours() + 24);
                             const isoString = date.toISOString().slice(0, 16);
                             setValue('deadline', isoString, { shouldValidate: true });
                          }
                        }}
                      />
                    )}
                  />
                  <InputError message={errors.conditionId?.message} />
                  <InputError message={errors.marketSlug?.message} />
                  
                  {watchedValues.marketQuestion && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-lime-500/5 border border-lime-500/20 rounded-lg flex gap-3"
                    >
                      <div className="mt-1">
                        <Icons.Polymarket className="w-4 h-4 text-lime-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-lime-200">Selected Event</p>
                        <p className="text-sm text-white mt-0.5 truncate">{watchedValues.marketQuestion}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-[10px] font-mono text-lime-400/60 truncate max-w-[150px]">
                            {watchedValues.conditionId}
                          </code>
                          <span className="text-[10px] text-zinc-500 px-1 border-l border-white/10">
                            Slug: {watchedValues.marketSlug}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </section>

              {/* 3. Financials */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-white font-medium pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px]">3</span>
                  Financials & Logistics
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <FormLabel required>Funding Goal</FormLabel>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        {...register('goalAmount', { valueAsNumber: true })}
                        disabled={isPending}
                        placeholder="10000"
                        className={cn(
                          "w-full bg-elevated border rounded-lg pl-4 pr-16 py-3 text-sm text-white transition-all duration-200 outline-none placeholder:text-zinc-600",
                          errors.goalAmount ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                        )}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                        <Icons.USDC className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-500">USDC</span>
                      </div>
                    </div>
                    <InputError message={errors.goalAmount?.message} />
                  </div>

                  <div className="space-y-1">
                    <FormLabel required>Deadline</FormLabel>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        {...register('deadline')}
                        disabled={isPending}
                        className={cn(
                          "w-full bg-elevated border rounded-lg px-4 py-3 text-sm text-white transition-all duration-200 outline-none placeholder:text-zinc-600 scheme-dark",
                          errors.deadline ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                        )}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                    <InputError message={errors.deadline?.message} />
                  </div>
                </div>

                <div className="space-y-1">
                  <FormLabel required tooltip="The wallet that receives the USDC if the condition is met. Can be a Basename (name.base.eth).">Recipient Address</FormLabel>
                  <div className="relative">
                    <input
                      value={recipientInput}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setRecipientInput(newValue);
                        
                        if (newValue && isAddress(newValue)) {
                          setValue('recipient', newValue, { shouldValidate: true });
                        } else {
                          setValue('recipient', '', { shouldValidate: true });
                        }
                      }}
                      disabled={isPending}
                      placeholder="0x... or name.base.eth"
                      className={cn(
                        "w-full bg-elevated border rounded-lg pl-10 pr-24 py-3 text-sm font-mono text-white transition-all duration-200 outline-none placeholder:text-zinc-600",
                        errors.recipient ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                      )}
                    />
                    <Icons.Ethereum className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    
                    {address && recipientInput !== address && (
                      <button
                        type="button"
                        onClick={() => {
                          setRecipientInput(address);
                          setValue('recipient', address, { shouldValidate: true });
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-medium text-zinc-400 hover:text-white transition-colors border border-white/5"
                      >
                        Use My Wallet
                      </button>
                    )}
                  </div>
                  
                  <IdentityVerify 
                    input={recipientInput}
                    onResolved={(validAddress) => {
                      if (validAddress) {
                        setValue('recipient', validAddress, { shouldValidate: true });
                      }
                    }}
                  />

                  <InputError message={errors.recipient?.message} />
                </div>
              </section>

              {/* Action Bar */}
              <div className="pt-6 border-t border-white/10">
                {writeError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-sm text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">{writeError.message.split('\n')[0]}</span>
                  </div>
                )}
                
                {!isConnected ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 rounded-lg bg-zinc-800 text-zinc-400 font-semibold text-sm cursor-not-allowed border border-white/5 flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet to Create
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!isValid || isPending || !isCorrectChain}
                    type="submit"
                    className={cn(
                      "w-full py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg",
                      !isValid || isPending || !isCorrectChain
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-white text-black hover:bg-zinc-200 shadow-white/10"
                    )}
                  >
                    {isWritePending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Confirm in Wallet...
                      </>
                    ) : isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deploying Contract...
                      </>
                    ) : (
                      <>
                        Deploy Campaign <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                )}
                <p className="text-center text-xs text-zinc-600 mt-4">
                  This will create an immutable smart contract on Base.
                </p>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="sticky top-32">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest">Live Preview</h3>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-zinc-400">Updating</span>
                </div>
              </div>

              <motion.div 
                className="bg-[#111113] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-xl"
                layout
              >
                <div className="h-32 relative bg-linear-to-br from-zinc-800 to-elevated border-b border-white/5">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Campaign Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  )}
                  
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] text-white backdrop-blur-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                      Conditional Funding
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    {watchedValues.title ? (
                      <h2 className="text-xl font-bold text-white leading-tight wrap-break-word">{watchedValues.title}</h2>
                    ) : (
                      <div className="h-7 w-3/4 bg-zinc-800 rounded animate-pulse" />
                    )}
                    
                    <div className="mt-3">
                      {watchedValues.description ? (
                        <p className="text-sm text-zinc-400 line-clamp-3 wrap-break-word">{watchedValues.description}</p>
                      ) : (
                        <div className="space-y-2 mt-3">
                          <div className="h-3 w-full bg-zinc-900 rounded animate-pulse" />
                          <div className="h-3 w-5/6 bg-zinc-900 rounded animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-surface border border-white/5 rounded-lg p-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-lime-500" />
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                        <Icons.Polymarket className="w-4 h-4 text-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Condition</span>
                       </div>
                       {watchedValues.marketSlug && (
                         <a 
                           href={`https://polymarket.com/event/${watchedValues.marketSlug}`} 
                           target="_blank"
                           rel="noreferrer"
                           className="text-[10px] text-lime-500 hover:text-lime-400 flex items-center gap-1"
                         >
                           View on Polymarket <ArrowRight className="w-2.5 h-2.5" />
                         </a>
                       )}
                    </div>
                    <p className="text-sm text-lime-100 font-medium">
                      {watchedValues.marketQuestion || "Select a prediction market..."}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500">
                      <span>Outcome:</span>
                      <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20 font-bold">YES</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-white font-medium">
                        $0 <span className="text-zinc-500">raised</span>
                      </span>
                      <span className="text-zinc-400">
                        Goal: ${watchedValues.goalAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[2%]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Deadline</p>
                      <p className="text-xs text-white font-mono">
                        {watchedValues.deadline ? new Date(watchedValues.deadline).toLocaleDateString() : '--/--/--'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Recipient</p>
                      <div className="flex items-center justify-end gap-1">
                         <p className="text-xs text-white font-mono truncate max-w-20">
                          {watchedValues.recipient || '0x...'}
                        </p>
                        {watchedValues.recipient && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="mt-6 p-4 rounded-lg border border-dashed border-white/10 bg-white/5">
                <h4 className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-2">
                  <Info className="w-3 h-3" /> How it works
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  You are creating a smart contract that holds funds in escrow. 
                  Funds are programmatically locked until Polymarket resolves the event. 
                  NO human intervention is required.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}