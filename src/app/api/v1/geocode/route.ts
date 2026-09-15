import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  name: string;
  display_name: string;
  class: string;
  type: string;
  importance?: number;
  address?: Record<string, string>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  if (!query || query.length < 2) {
    return NextResponse.json({
      success: false,
      error: 'Query parameter "q" must be at least 2 characters.',
      results: []
    }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: Math.min(limit, 10).toString(),
      countrycodes: 'mm',
      addressdetails: '1',
      extratags: '1'
    });

    const osmUrl = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    const res = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'MyanmarPCodeSearch/2.0 (Medaius-PCode-App; https://github.com/nchanko/myanmar_pcode_search)',
        'Accept-Language': 'en,my'
      },
      // Cache geocodes for 1 hour
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error(`Nominatim API error: ${res.status} ${res.statusText}`);
    }

    const data: NominatimItem[] = await res.json();

    const formatted = data.map((item) => ({
      placeId: item.place_id,
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      category: item.class,
      type: item.type,
      importance: item.importance || 0,
      address: item.address || {}
    }));

    return NextResponse.json({
      success: true,
      query,
      count: formatted.length,
      results: formatted
    });
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Geocoding service unavailable',
      results: []
    }, { status: 502 });
  }
}
