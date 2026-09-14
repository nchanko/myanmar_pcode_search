import { NextRequest, NextResponse } from 'next/server';
import { getPlaceByPCode } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const trimmed = (code || '').trim();

  if (!trimmed) {
    return NextResponse.json({ error: 'PCode parameter is required.' }, { status: 400 });
  }

  try {
    const place = getPlaceByPCode(trimmed);
    if (!place) {
      return NextResponse.json(
        { error: `No place found with PCode "${trimmed}"`, pcode: trimmed },
        { status: 404 }
      );
    }

    return NextResponse.json(place, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=2592000',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error('PCode API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve place by PCode', details: error?.message },
      { status: 500 }
    );
  }
}
