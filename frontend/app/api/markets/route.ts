// app/api/markets/route.ts

import { NextResponse } from 'next/server';

export const runtime = 'edge';

// ============ Type Definitions ============

interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomes: string;
  outcomePrices?: string;
  active: boolean;
  closed: boolean;
  endDate?: string;
}

interface PolymarketEvent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  markets: PolymarketMarket[];
  active: boolean;
  closed: boolean;
  endDate?: string;
}

export interface CleanMarket {
  conditionId: string;
  question: string;
  slug: string;
  endDate: string | null;
  outcomePrices: number[];
  outcomes: string[];
  eventTitle: string;
  eventSlug: string;
}

export interface MarketsApiResponse {
  success: boolean;
  data: CleanMarket[];
  count: number;
  error?: string;
}

// ============ Constants ============

const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100; // Increased to capture more markets per event
const CACHE_TTL = 60; 

// ============ Helper Functions ============

function parseJsonField<T>(value: string | T | undefined, fallback: T): T {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeOutcomePrices(prices: unknown[]): number[] {
  return prices.map((p) => {
    const num = Number(p);
    return isNaN(num) ? 0 : Math.round(num * 10000) / 10000;
  });
}

// ============ Main Handler ============

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const limitParam = parseInt(searchParams.get('limit') || '', 10);
    const limit = Math.min(
      isNaN(limitParam) ? DEFAULT_LIMIT : limitParam,
      MAX_LIMIT
    );

    const apiUrl = new URL(`${POLYMARKET_GAMMA_API}/events`);
    apiUrl.searchParams.set('active', 'true');
    apiUrl.searchParams.set('closed', 'false');
    apiUrl.searchParams.set('limit', String(limit));
    
    // Always sort by volume to show "Majors" first
    apiUrl.searchParams.set('order', 'volume24hr');
    apiUrl.searchParams.set('ascending', 'false');

    // Use 'q' for full-text search (Title, Slug, Desc)
    if (search) {
      apiUrl.searchParams.set('q', search);
    }

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-Polymarket-Proxy/1.0',
      },
      next: {
        revalidate: CACHE_TTL,
        tags: ['polymarket-markets'],
      },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const events: PolymarketEvent[] = await response.json();
    const markets: CleanMarket[] = [];
    const searchLower = search.toLowerCase();

    for (const event of events) {
      if (!Array.isArray(event.markets) || event.markets.length === 0) continue;

      for (const market of event.markets) {
        if (!market.conditionId || !market.question) continue;
        if (market.closed || !market.active) continue;

        // FILTER: Relaxed matching logic
        // If user searches "Trump", we want:
        // 1. Markets with "Trump" in the question.
        // 2. Markets inside an event titled "Trump" (even if question is "Winner").
        if (search) {
          const questionMatch = market.question.toLowerCase().includes(searchLower);
          const titleMatch = event.title.toLowerCase().includes(searchLower);
          const slugMatch = (market.slug || '').toLowerCase().includes(searchLower);
          
          if (!questionMatch && !titleMatch && !slugMatch) {
            continue;
          }
        }

        const outcomes = parseJsonField<string[]>(market.outcomes, ['Yes', 'No']);
        const rawPrices = parseJsonField<unknown[]>(market.outcomePrices, []);
        const outcomePrices = normalizeOutcomePrices(rawPrices);

        markets.push({
          conditionId: market.conditionId,
          question: market.question,
          slug: market.slug || event.slug || market.conditionId,
          endDate: market.endDate || event.endDate || null,
          outcomePrices,
          outcomes,
          eventTitle: event.title || 'Untitled Event',
          eventSlug: event.slug || '',
        });
      }
    }

    // Sort alphabetical by default for clean UI, unless pure volume is preferred
    // If searched, we keep alphabetical. If default view, volume is handled by API return order.
    if (search) {
       markets.sort((a, b) => a.question.localeCompare(b.question));
    }

    return NextResponse.json<MarketsApiResponse>(
      {
        success: true,
        data: markets,
        count: markets.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=300`,
          'X-Total-Count': String(markets.length),
        },
      }
    );

  } catch (error) {
    console.error('[Markets API Error]', error);
    return NextResponse.json<MarketsApiResponse>(
      {
        success: false,
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch markets',
      },
      { status: 500 }
    );
  }
}