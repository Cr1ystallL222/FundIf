// app/api/markets/route.ts

import { NextResponse } from 'next/server';

// Type definitions for Polymarket API response
interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  outcomes: string; // JSON string like '["Yes", "No"]'
  active: boolean;
  closed: boolean;
  outcomePrices?: string;
}

interface PolymarketEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  markets: PolymarketMarket[];
  active: boolean;
  closed: boolean;
}

// Clean response type for our frontend
export interface CleanMarket {
  eventId: string;
  eventTitle: string;
  conditionId: string;
  question: string;
  outcomes: string[];
  outcomePrices?: number[];
}

export interface MarketsApiResponse {
  success: boolean;
  data: CleanMarket[];
  count: number;
  error?: string;
}

export async function GET(request: Request) {
  try {
    // Parse query params for optional filtering
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const search = searchParams.get('search') || '';

    // Fetch active, non-closed events from Polymarket
    const apiUrl = new URL('https://gamma-api.polymarket.com/events');
    apiUrl.searchParams.set('active', 'true');
    apiUrl.searchParams.set('closed', 'false');
    apiUrl.searchParams.set('limit', limit);
    
    if (search) {
      apiUrl.searchParams.set('title_like', search);
    }

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-Crowdfunding-App/1.0',
      },
      // Revalidate cache every 60 seconds
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Polymarket API Error:', response.status, errorText);
      throw new Error(`Polymarket API responded with status: ${response.status}`);
    }

    const events: PolymarketEvent[] = await response.json();

    // Transform to clean format
    const markets: CleanMarket[] = [];

    for (const event of events) {
      // Skip events without markets
      if (!event.markets || !Array.isArray(event.markets)) {
        continue;
      }

      for (const market of event.markets) {
        // Skip markets without a condition ID (required for betting)
        if (!market.conditionId || !market.question) {
          continue;
        }

        // Skip inactive or closed markets
        if (market.closed || !market.active) {
          continue;
        }

        // Parse outcomes - can be a JSON string or array
        let outcomes: string[] = ['Yes', 'No']; // Default
        try {
          if (typeof market.outcomes === 'string') {
            outcomes = JSON.parse(market.outcomes);
          } else if (Array.isArray(market.outcomes)) {
            outcomes = market.outcomes;
          }
        } catch {
          console.warn(`Failed to parse outcomes for market ${market.id}`);
        }

        // Parse outcome prices if available
        let outcomePrices: number[] | undefined;
        try {
          if (market.outcomePrices) {
            const parsed = typeof market.outcomePrices === 'string' 
              ? JSON.parse(market.outcomePrices) 
              : market.outcomePrices;
            if (Array.isArray(parsed)) {
              outcomePrices = parsed.map(Number);
            }
          }
        } catch {
          // Prices are optional, ignore parse errors
        }

        markets.push({
          eventId: event.id,
          eventTitle: event.title || 'Untitled Event',
          conditionId: market.conditionId,
          question: market.question,
          outcomes,
          outcomePrices,
        });
      }
    }

    // Sort by event title for consistent ordering
    markets.sort((a, b) => a.eventTitle.localeCompare(b.eventTitle));

    const responseData: MarketsApiResponse = {
      success: true,
      data: markets,
      count: markets.length,
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    console.error('Error fetching Polymarket events:', error);

    const errorResponse: MarketsApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch markets',
      data: [],
      count: 0,
    };

    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}