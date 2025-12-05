// app/api/markets/route.ts

import { NextResponse } from 'next/server';

export const runtime = 'edge';

// ============ Constants ============
const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';
const CACHE_TTL = 60; 

// ============ Types (Kept from your original file for the list view logic) ============
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
    
    // ============================================================
    // PART 1: PROXY LOGIC (Fixes your CORS issue)
    // Handles direct lookups for CampaignCard.tsx
    // ============================================================
    const lookupSlug = searchParams.get('slug');
    const lookupConditionId = searchParams.get('condition_id');

    // If looking up by SLUG specifically
    if (lookupSlug) {
      const res = await fetch(`${POLYMARKET_GAMMA_API}/markets/slug/${lookupSlug}`, {
        next: { revalidate: CACHE_TTL } 
      });
      
      if (!res.ok) {
        return NextResponse.json({ error: 'Market not found' }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    // If looking up by CONDITION ID specifically
    if (lookupConditionId) {
      const res = await fetch(`${POLYMARKET_GAMMA_API}/markets?condition_ids=${lookupConditionId}`, {
        next: { revalidate: CACHE_TTL }
      });
      
      if (!res.ok) {
        return NextResponse.json({ error: 'Market not found' }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    // ============================================================
    // PART 2: EXISTING LIST/SEARCH LOGIC
    // Handles bulk fetching for lists
    // ============================================================
    
    const search = searchParams.get('search')?.trim() || '';
    const limitParam = parseInt(searchParams.get('limit') || '', 10);
    const limit = Math.min(
      isNaN(limitParam) ? 2000 : limitParam,  // Default: 50 → 200
      10000  // Max cap: 100 → 500
    );

    let events: PolymarketEvent[] = [];

if (search) {
  // When searching: fetch multiple pages to find relevant markets
  const pagesToFetch = 5; // 5 pages × 500 = 2500 events searched
  
  for (let offset = 0; offset < pagesToFetch * 500; offset += 500) {
    const apiUrl = new URL(`${POLYMARKET_GAMMA_API}/events`);
    apiUrl.searchParams.set('active', 'true');
    apiUrl.searchParams.set('closed', 'false');
    apiUrl.searchParams.set('limit', '500');
    apiUrl.searchParams.set('offset', String(offset));
    apiUrl.searchParams.set('q', search);
    
    const res = await fetch(apiUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-Polymarket-Proxy/1.0',
      },
      next: { revalidate: CACHE_TTL },
    });
    
    if (!res.ok) break;
    
    const pageEvents: PolymarketEvent[] = await res.json();
    if (pageEvents.length === 0) break;
    
    events = [...events, ...pageEvents];
  }
} else {
  // When browsing (no search): show popular markets
  const apiUrl = new URL(`${POLYMARKET_GAMMA_API}/events`);
  apiUrl.searchParams.set('active', 'true');
  apiUrl.searchParams.set('closed', 'false');
  apiUrl.searchParams.set('limit', String(limit));
  apiUrl.searchParams.set('order', 'volume24hr');
  apiUrl.searchParams.set('ascending', 'false');
  
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

    events = await response.json();
    }
    const markets: CleanMarket[] = [];
    const searchLower = search.toLowerCase();

    for (const event of events) {
      if (!Array.isArray(event.markets) || event.markets.length === 0) continue;

      for (const market of event.markets) {
        if (!market.conditionId || !market.question) continue;
        if (market.closed || !market.active) continue;

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

    if (search) {
       markets.sort((a, b) => a.question.localeCompare(b.question));
    }

    return NextResponse.json(
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
    return NextResponse.json(
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