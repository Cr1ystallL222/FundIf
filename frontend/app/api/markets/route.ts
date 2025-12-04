// app/api/markets/route.ts

import { NextResponse } from 'next/server';

// Enable Edge Runtime for better performance and global distribution
export const runtime = 'edge';

// ============ Type Definitions ============

interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomes: string;           // JSON string: '["Yes", "No"]'
  outcomePrices?: string;     // JSON string: '[0.65, 0.35]'
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

// Clean response type matching your requirements
export interface CleanMarket {
  conditionId: string;
  question: string;
  slug: string;
  endDate: string | null;
  outcomePrices: number[];
  outcomes: string[];
  // Bonus: include event context
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
const MAX_LIMIT = 100;
const CACHE_TTL = 60; // seconds

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
    // Round to 4 decimal places (e.g., 0.6523)
    return isNaN(num) ? 0 : Math.round(num * 10000) / 10000;
  });
}

// ============ Main Handler ============

export async function GET(request: Request) {
  try {
    // 1. Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const limitParam = parseInt(searchParams.get('limit') || '', 10);
    const limit = Math.min(
      isNaN(limitParam) ? DEFAULT_LIMIT : limitParam,
      MAX_LIMIT
    );

    // 2. Build Polymarket API URL
    const apiUrl = new URL(`${POLYMARKET_GAMMA_API}/events`);
    apiUrl.searchParams.set('active', 'true');
    apiUrl.searchParams.set('closed', 'false');
    apiUrl.searchParams.set('limit', String(limit));

    // Search by title if query provided
    if (search) {
      apiUrl.searchParams.set('title_like', search);
    }

    // 3. Fetch from Polymarket with ISR caching
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

    // 4. Handle API errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Polymarket API] ${response.status}: ${errorText}`);
      
      throw new Error(
        response.status === 429
          ? 'Rate limited by Polymarket API'
          : `Polymarket API error: ${response.status}`
      );
    }

    // 5. Parse and transform response
    const events: PolymarketEvent[] = await response.json();
    const markets: CleanMarket[] = [];

    for (const event of events) {
      // Skip events without valid markets array
      if (!Array.isArray(event.markets) || event.markets.length === 0) {
        continue;
      }

      for (const market of event.markets) {
        // Validate required fields
        if (!market.conditionId || !market.question) {
          continue;
        }

        // Skip closed/inactive markets
        if (market.closed || !market.active) {
          continue;
        }

        // Parse outcomes (default to Yes/No binary)
        const outcomes = parseJsonField<string[]>(
          market.outcomes,
          ['Yes', 'No']
        );

        // Parse and normalize outcome prices
        const rawPrices = parseJsonField<unknown[]>(
          market.outcomePrices,
          []
        );
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

    // 6. Sort results alphabetically by question
    markets.sort((a, b) => a.question.localeCompare(b.question));

    // 7. Return success response
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
    // Log error for debugging
    console.error('[Markets API Error]', error);

    // Determine appropriate status code
    const status = error instanceof Error && error.message.includes('Rate limited')
      ? 429
      : 500;

    return NextResponse.json<MarketsApiResponse>(
      {
        success: false,
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch markets',
      },
      {
        status,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}