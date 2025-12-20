'use client';

import { useState, useEffect, useCallback } from 'react';

interface MarketData {
  conditionId: string;
  question: string;
  slug: string;
  endDate: string | null;
  outcomePrices: number[];
  outcomes: string[];
  eventTitle: string;
  eventSlug: string;
}

interface UseMarketResult {
  market: MarketData | null;
  probability: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const ZERO_CONDITION_ID = '0x0000000000000000000000000000000000000000000000000000000000000000';

export function useMarketByConditionId(conditionId: string | undefined): UseMarketResult {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarket = useCallback(async () => {
    // Skip if no conditionId or it's the zero value
    if (!conditionId || conditionId === ZERO_CONDITION_ID) {
      setMarket(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/markets?conditionId=${encodeURIComponent(conditionId)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setMarket(data.data);
        setError(null);
      } else {
        setMarket(null);
        setError(data.error || 'Market not found');
      }
    } catch (err) {
      console.error('Failed to fetch market:', err);
      setMarket(null);
      setError('Failed to fetch market data');
    } finally {
      setIsLoading(false);
    }
  }, [conditionId]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  // Calculate probability (YES price * 100)
  const probability = market?.outcomePrices?.[0] 
    ? Math.round(market.outcomePrices[0] * 100) 
    : 0;

  return { 
    market, 
    probability,
    isLoading, 
    error, 
    refetch: fetchMarket 
  };
}