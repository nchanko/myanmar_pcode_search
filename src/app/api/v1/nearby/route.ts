import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces } from '@/lib/dataStore';

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

  const parsedRadius = radiusParam !== null ? parseFloat(radiusParam) : NaN;
  const radiusKm = Math.min(Math.max(Number.isFinite(parsedRadius) ? parsedRadius : 10, 0.5), 100);

  const parsedLimit = limitParam !== null ? parseInt(limitParam, 10) : NaN;
  const limit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 20, 1), 50);

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
          // Netlify's durable cache keys responses by path, and the Next.js
          // runtime's own Netlify-Vary lists only __nextDataReq and _rsc, so
          // the query string is not part of the key: a cached response here
          // was served to every later query. Searching Bago returned Mandalay
          // on the live site. Anything that varies by query stays uncached.
          'Cache-Control': 'no-store',
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
