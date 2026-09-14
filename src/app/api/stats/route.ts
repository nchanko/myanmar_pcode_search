import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve stats', details: error?.message },
      { status: 500 }
    );
  }
}
