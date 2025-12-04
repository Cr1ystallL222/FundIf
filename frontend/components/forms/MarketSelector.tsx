// components/forms/MarketSelector.tsx

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  Search,
  TrendingUp,
  Loader2,
  ExternalLink,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

// Match the API response type from /api/markets
interface CleanMarket {
  conditionId: string;
  question: string;
  slug: string;
  endDate: string | null;
  outcomePrices: number[];
  outcomes: string[];
  eventTitle: string;
  eventSlug: string;
}

interface MarketsApiResponse {
  success: boolean;
  data: CleanMarket[];
  count: number;
  error?: string;
}

interface MarketSelectorProps {
  onSelect: (conditionId: string, question: string) => void;
  disabled?: boolean;
  initialConditionId?: string;
  className?: string;
}

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

/**
 * Debounce hook to delay value updates
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format outcome prices as readable percentages
 */
function formatOdds(prices: number[], outcomes: string[]): string {
  if (!prices || prices.length === 0) return 'No odds available';

  return outcomes
    .map((outcome, index) => {
      const price = prices[index];
      if (price === undefined) return null;
      const percentage = Math.round(price * 100);
      return `${outcome}: ${percentage}%`;
    })
    .filter(Boolean)
    .join(' / ');
}

/**
 * Format ISO date string to readable format
 */
function formatEndDate(endDate: string | null): string {
  if (!endDate) return '';

  try {
    const date = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Show relative time for near dates
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays <= 7) return `Ends in ${diffDays} days`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return '';
  }
}

/**
 * Get color classes for outcome badges
 */
function getOutcomeColor(outcome: string, index: number): string {
  const lower = outcome.toLowerCase();
  
  if (lower === 'yes') return 'bg-green-500/20 text-green-400';
  if (lower === 'no') return 'bg-red-500/20 text-red-400';
  
  // For non-binary markets, alternate colors
  const colors = [
    'bg-blue-500/20 text-blue-400',
    'bg-purple-500/20 text-purple-400',
    'bg-amber-500/20 text-amber-400',
    'bg-cyan-500/20 text-cyan-400',
  ];
  return colors[index % colors.length];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEBOUNCE_DELAY = 300; // ms
const API_ENDPOINT = '/api/markets';
const DEFAULT_LIMIT = 20;

// =============================================================================
// COMPONENT
// =============================================================================

export default function MarketSelector({
  onSelect,
  disabled = false,
  initialConditionId = '',
  className = '',
}: MarketSelectorProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markets, setMarkets] = useState<CleanMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<CleanMarket | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // ---------------------------------------------------------------------------
  // API FETCH
  // ---------------------------------------------------------------------------

  const fetchMarkets = useCallback(async (search: string, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(DEFAULT_LIMIT),
      });
      
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch(`${API_ENDPOINT}?${params}`, {
        signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? 'Too many requests. Please wait a moment.'
            : `Failed to fetch markets (${response.status})`
        );
      }

      const data: MarketsApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch markets');
      }

      setMarkets(data.data);
      setHasInitialLoad(true);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load markets');
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  // Fetch markets when dropdown opens or debounced search changes
  useEffect(() => {
    if (!isOpen) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    fetchMarkets(debouncedSearch, abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [isOpen, debouncedSearch, fetchMarkets]);

  // Set initial market if provided
  useEffect(() => {
    if (initialConditionId && markets.length > 0 && !selectedMarket) {
      const market = markets.find((m) => m.conditionId === initialConditionId);
      if (market) {
        setSelectedMarket(market);
      }
    }
  }, [initialConditionId, markets, selectedMarket]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const handleSelect = (market: CleanMarket) => {
    setSelectedMarket(market);
    onSelect(market.conditionId, market.question);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleRetry = () => {
    fetchMarkets(debouncedSearch);
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  const renderSelectedDisplay = () => {
    if (!selectedMarket) {
      return (
        <span className="text-text-muted">Select a prediction market...</span>
      );
    }

    return (
      <div className="flex-1 min-w-0">
        <p className="text-text-main text-sm font-medium truncate">
          {selectedMarket.question}
        </p>
        <p className="text-text-muted text-xs truncate">
          {formatOdds(selectedMarket.outcomePrices, selectedMarket.outcomes)}
          {selectedMarket.endDate && ` • ${formatEndDate(selectedMarket.endDate)}`}
        </p>
      </div>
    );
  };

  const renderMarketItem = (market: CleanMarket) => {
    const isSelected = selectedMarket?.conditionId === market.conditionId;

    return (
      <button
        key={market.conditionId}
        type="button"
        onClick={() => handleSelect(market)}
        className={`
          w-full px-4 py-3 text-left transition-colors duration-150
          hover:bg-white/5 focus:bg-white/5 focus:outline-none
          ${isSelected ? 'bg-secondary/10' : ''}
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Question */}
            <p className="text-text-main text-sm font-medium leading-tight">
              {market.question}
            </p>

            {/* Metadata Row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Odds Badges */}
              {market.outcomePrices.length > 0 && (
                <div className="flex items-center gap-1">
                  {market.outcomes.slice(0, 4).map((outcome, index) => {
                    const price = market.outcomePrices[index];
                    if (price === undefined) return null;
                    const percentage = Math.round(price * 100);

                    return (
                      <span
                        key={outcome}
                        className={`text-xs px-2 py-0.5 rounded-box font-medium ${getOutcomeColor(outcome, index)}`}
                      >
                        {outcome}: {percentage}%
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Event Title */}
              {market.eventTitle && (
                <span className="text-xs text-text-muted truncate max-w-[150px]">
                  {market.eventTitle}
                </span>
              )}

              {/* End Date */}
              {market.endDate && (
                <span className="text-xs text-text-muted whitespace-nowrap">
                  • {formatEndDate(market.endDate)}
                </span>
              )}
            </div>
          </div>

          {/* Selected Check */}
          {isSelected && (
            <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          )}
        </div>
      </button>
    );
  };

  const renderContent = () => {
    // Error state
    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 py-8 px-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-red-400 text-sm text-center">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      );
    }

    // Initial loading state
    if (isLoading && !hasInitialLoad) {
      return (
        <div className="flex items-center justify-center py-8 gap-2">
          <Loader2 className="w-6 h-6 text-secondary animate-spin" />
          <span className="text-text-muted text-sm">Loading markets...</span>
        </div>
      );
    }

    // Empty state
    if (markets.length === 0) {
      return (
        <div className="py-8 text-center px-4">
          <p className="text-text-muted text-sm">
            {searchQuery
              ? `No markets found for "${searchQuery}"`
              : 'No active markets available'}
          </p>
          <p className="text-text-muted/60 text-xs mt-1">
            Try searching for topics like "Bitcoin", "Trump", or "AI"
          </p>
        </div>
      );
    }

    // Markets list
    return (
      <div className="py-1">
        {markets.map(renderMarketItem)}
        
        {/* Show loading indicator for search updates */}
        {isLoading && (
          <div className="flex items-center justify-center py-2 border-t border-border">
            <Loader2 className="w-4 h-4 text-secondary animate-spin" />
            <span className="text-text-muted text-xs ml-2">Updating...</span>
          </div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-box border transition-all duration-200
          bg-background border-border text-left
          flex items-center justify-between gap-3
          hover:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/30
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'border-secondary ring-2 ring-secondary/30' : ''}
        `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <TrendingUp className="w-5 h-5 text-secondary flex-shrink-0" />
          {renderSelectedDisplay()}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-text-muted transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-box shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search markets (e.g., Trump, Bitcoin, AI)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 pr-10 py-2 text-sm w-full"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary animate-spin" />
              )}
            </div>
          </div>

          {/* Markets List */}
          <div className="max-h-80 overflow-y-auto">{renderContent()}</div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-background/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                {markets.length} market{markets.length !== 1 ? 's' : ''} found
              </span>
              <a
                href="https://polymarket.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-secondary transition-colors"
              >
                <span>View all on Polymarket</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}