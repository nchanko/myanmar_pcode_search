import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 20, 1), 100) : 25;

  if (!q.trim()) {
    return NextResponse.json(
      {
        version: 'v1',
        error: 'Query parameter "q" is required.',
        results: [],
        count: 0,
        executionTimeMs: 0
      },
      { status: 400 }
    );
  }

  try {
    const results = searchPlaces(q, type, limit);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json(
      {
        version: 'v1',
        query: q,
        type: type || 'all',
        count: results.length,
        results,
        executionTimeMs
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { version: 'v1', error: 'Failed to execute search query', details: error?.message },
      { status: 500 }
    );
  }
}
