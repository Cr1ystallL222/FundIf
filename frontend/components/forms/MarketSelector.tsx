// components/forms/MarketSelector.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, TrendingUp, Loader2, ExternalLink, Check } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Market {
  conditionId: string;
  question: string;
  category?: string;
  volume?: string;
  endDate?: string;
  probability?: number;
}

interface MarketSelectorProps {
  onSelect: (conditionId: string, question: string) => void;
  disabled?: boolean;
  initialConditionId?: string;
  className?: string;
}

// =============================================================================
// MOCK DATA (Replace with actual API call)
// =============================================================================

const MOCK_MARKETS: Market[] = [
  {
    conditionId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    question: 'Will Bitcoin reach $100,000 by end of 2025?',
    category: 'Crypto',
    volume: '$2.4M',
    probability: 65,
  },
  {
    conditionId: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    question: 'Will the Paris Agreement climate goals be met by 2030?',
    category: 'Climate',
    volume: '$890K',
    probability: 32,
  },
  {
    conditionId: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    question: 'Will SpaceX successfully land humans on Mars before 2030?',
    category: 'Space',
    volume: '$1.2M',
    probability: 18,
  },
  {
    conditionId: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
    question: 'Will a major AI breakthrough occur in 2025?',
    category: 'Technology',
    volume: '$3.1M',
    probability: 72,
  },
  {
    conditionId: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeee0000',
    question: 'Will renewable energy exceed 50% of global power by 2030?',
    category: 'Energy',
    volume: '$560K',
    probability: 45,
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function MarketSelector({
  onSelect,
  disabled = false,
  initialConditionId = '',
  className = '',
}: MarketSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>(MOCK_MARKETS);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find initial market if provided
  useEffect(() => {
    if (initialConditionId) {
      const market = markets.find((m) => m.conditionId === initialConditionId);
      if (market) {
        setSelectedMarket(market);
      }
    }
  }, [initialConditionId, markets]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter markets based on search query
  const filteredMarkets = markets.filter(
    (market) =>
      market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle market selection
  const handleSelect = (market: Market) => {
    setSelectedMarket(market);
    onSelect(market.conditionId, market.question);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

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
          {selectedMarket ? (
            <div className="flex-1 min-w-0">
              <p className="text-text-main text-sm font-medium truncate">
                {selectedMarket.question}
              </p>
              <p className="text-text-muted text-xs truncate">
                {selectedMarket.category} • {selectedMarket.volume}
              </p>
            </div>
          ) : (
            <span className="text-text-muted">Select a prediction market...</span>
          )}
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
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </div>

          {/* Markets List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-secondary animate-spin" />
              </div>
            ) : filteredMarkets.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-text-muted text-sm">No markets found</p>
              </div>
            ) : (
              <div className="py-1">
                {filteredMarkets.map((market) => (
                  <button
                    key={market.conditionId}
                    type="button"
                    onClick={() => handleSelect(market)}
                    className={`
                      w-full px-4 py-3 text-left transition-colors duration-150
                      hover:bg-white/5 focus:bg-white/5 focus:outline-none
                      ${selectedMarket?.conditionId === market.conditionId ? 'bg-secondary/10' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-text-main text-sm font-medium leading-tight">
                          {market.question}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-box">
                            {market.category}
                          </span>
                          <span className="text-xs text-text-muted">
                            Vol: {market.volume}
                          </span>
                          {market.probability !== undefined && (
                            <span className="text-xs text-text-muted">
                              {market.probability}% Yes
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedMarket?.conditionId === market.conditionId && (
                        <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-background/50">
            <a
              href="https://polymarket.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-text-muted hover:text-secondary transition-colors"
            >
              <span>Browse all markets on Polymarket</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}