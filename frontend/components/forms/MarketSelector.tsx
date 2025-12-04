// components/forms/MarketSelector.tsx

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  ChevronDown, 
  Loader2, 
  AlertCircle, 
  Check, 
  X,
  TrendingUp 
} from 'lucide-react';

// Types
interface Market {
  eventId: string;
  eventTitle: string;
  conditionId: string;
  question: string;
  outcomes: string[];
  outcomePrices?: number[];
}

interface MarketSelectorProps {
  onSelect: (conditionId: string, question: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  initialConditionId?: string;
}

interface ApiResponse {
  success: boolean;
  data: Market[];
  count: number;
  error?: string;
}

export default function MarketSelector({
  onSelect,
  placeholder = 'Select a prediction market...',
  className = '',
  disabled = false,
  initialConditionId,
}: MarketSelectorProps) {
  // State
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Fetch markets on mount
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/markets');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch markets');
        }

        setMarkets(data.data);
        setFilteredMarkets(data.data);

        // Set initial selection if provided
        if (initialConditionId) {
          const initial = data.data.find(m => m.conditionId === initialConditionId);
          if (initial) {
            setSelectedMarket(initial);
          }
        }
      } catch (err) {
        console.error('Error fetching markets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load markets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, [initialConditionId]);

  // Filter markets based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMarkets(markets);
      setHighlightedIndex(-1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = markets.filter(
      (market) =>
        market.question.toLowerCase().includes(query) ||
        market.eventTitle.toLowerCase().includes(query) ||
        market.outcomes.some(o => o.toLowerCase().includes(query))
    );
    setFilteredMarkets(filtered);
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  }, [searchQuery, markets]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredMarkets.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredMarkets[highlightedIndex]) {
            handleSelect(filteredMarkets[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery('');
          break;
      }
    },
    [isOpen, highlightedIndex, filteredMarkets]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      const highlightedItem = items[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (market: Market) => {
    setSelectedMarket(market);
    setSearchQuery('');
    setIsOpen(false);
    onSelect(market.conditionId, market.question);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMarket(null);
    setSearchQuery('');
    onSelect('', '');
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const formatPrice = (price: number): string => {
    return `${Math.round(price * 100)}%`;
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Prediction Market
      </label>

      {/* Main Button / Selected Display */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full flex items-center justify-between
          px-4 py-3.5 rounded-xl border-2
          bg-white dark:bg-gray-900
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
            : 'cursor-pointer'
          }
          ${isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-md'
          }
          ${error && !isOpen ? 'border-red-300 dark:border-red-700' : ''}
        `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />
          ) : (
            <TrendingUp className="w-5 h-5 text-gray-400 shrink-0" />
          )}

          {selectedMarket ? (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedMarket.question}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {selectedMarket.eventTitle}
              </p>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {isLoading ? 'Loading markets...' : placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-3 shrink-0">
          {selectedMarket && !isLoading && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </span>
          )}

          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && !disabled && (
        <div
          className="
            absolute z-50 w-full mt-2
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-2xl
            overflow-hidden
            animate-in fade-in-0 zoom-in-95 slide-in-from-top-2
            duration-200
          "
          role="listbox"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by question or event..."
                className="
                  w-full pl-10 pr-4 py-2.5
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-sm text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                  transition-all duration-200
                "
                aria-label="Search markets"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 flex items-start gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Failed to load markets</p>
                <p className="text-xs mt-0.5 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {/* Markets List */}
          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30" />
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin absolute top-2 left-2" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Loading markets
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Fetching from Polymarket...
                  </p>
                </div>
              </div>
            ) : filteredMarkets.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  No markets found
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] mx-auto">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'No active prediction markets available'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <ul ref={listRef} className="py-2" role="listbox">
                {filteredMarkets.map((market, index) => {
                  const isSelected = selectedMarket?.conditionId === market.conditionId;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li
                      key={market.conditionId}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(market)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`
                          w-full px-4 py-3 text-left
                          transition-colors duration-100
                          flex items-start gap-3
                          ${isHighlighted
                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }
                          ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
                        `}
                      >
                        {/* Selection Indicator */}
                        <div className={`
                          w-5 h-5 rounded-full border-2 shrink-0 mt-0.5
                          flex items-center justify-center transition-all
                          ${isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300 dark:border-gray-600'
                          }
                        `}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        {/* Market Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">
                            {market.question}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {market.eventTitle}
                          </p>

                          {/* Outcomes with Prices */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {market.outcomes.map((outcome, idx) => (
                              <span
                                key={idx}
                                className={`
                                  inline-flex items-center gap-1 px-2 py-1
                                  text-xs font-medium rounded-md
                                  ${idx === 0
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                  }
                                `}
                              >
                                {outcome}
                                {market.outcomePrices?.[idx] !== undefined && (
                                  <span className="opacity-70">
                                    {formatPrice(market.outcomePrices[idx])}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {!isLoading && filteredMarkets.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{filteredMarkets.length}</span>{' '}
                market{filteredMarkets.length !== 1 ? 's' : ''} available
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                ↑↓ to navigate • Enter to select
              </p>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      {!isOpen && !error && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Choose a Polymarket prediction to link with your campaign
        </p>
      )}
    </div>
  );
}