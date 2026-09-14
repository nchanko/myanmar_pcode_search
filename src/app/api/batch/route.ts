import { NextRequest, NextResponse } from 'next/server';
import { batchLookupCoordinates } from '@/lib/dataStore';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const contentType = request.headers.get('content-type') || '';
    let items: { id: string | number; latitude: number; longitude: number }[] = [];

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (Array.isArray(body)) {
        items = body;
      } else if (Array.isArray(body?.items)) {
        items = body.items;
      } else {
        return NextResponse.json(
          { error: 'Expected JSON array or { items: [...] } format' },
          { status: 400 }
        );
      }
    } else {
      // Assume CSV or form-data
      const text = await request.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      items = (parsed.data as any[]).map((row, idx) => {
        const id = row.id || row.ID || row.Id || idx + 1;
        const latitude = parseFloat(row.latitude || row.lat || row.Latitude || row.Lat || '');
        const longitude = parseFloat(row.longitude || row.lng || row.lon || row.Longitude || row.Lng || '');
        return { id, latitude, longitude };
      });
    }

    if (!items.length) {
      return NextResponse.json({ error: 'No coordinate items provided.' }, { status: 400 });
    }

    if (items.length > 2000) {
      return NextResponse.json(
        { error: 'Batch limit exceeded. Maximum 2,000 items per request.' },
        { status: 400 }
      );
    }

    const results = batchLookupCoordinates(items);
    const successCount = results.filter(r => r.status === 'FOUND').length;
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json({
      totalProcessed: results.length,
      successCount,
      results,
      executionTimeMs
    });
  } catch (error: any) {
    console.error('Batch API error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch request', details: error?.message },
      { status: 500 }
    );
  }
}
