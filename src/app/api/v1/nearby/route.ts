import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const searchParams = request.nextUrl.searchParams;
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng') || searchParams.get('lon');
  const radiusParam = searchParams.get('radius');
  const limitParam = searchParams.get('limit');

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { version: 'v1', error: 'Both "lat" and "lng" parameters are required.' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng) || lat < 9 || lat > 29 || lng < 92 || lng > 102) {
    return NextResponse.json(
      { version: 'v1', error: 'Coordinates are out of bounds for Myanmar (Lat: 9.0 - 29.0, Lng: 92.0 - 102.0).' },
      { status: 400 }
    );
  }

  const radiusKm = radiusParam ? Math.min(Math.max(parseFloat(radiusParam) || 10, 0.5), 100) : 10;
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 20, 1), 50) : 20;

  try {
    const results = getNearbyPlaces(lat, lng, radiusKm, limit);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json(
      {
        version: 'v1',
        latitude: lat,
        longitude: lng,
        radiusKm,
        count: results.length,
        results,
        executionTimeMs
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error: any) {
    console.error('Nearby API error:', error);
    return NextResponse.json(
      { version: 'v1', error: 'Failed to find nearby locations', details: error?.message },
      { status: 500 }
    );
  }
}
