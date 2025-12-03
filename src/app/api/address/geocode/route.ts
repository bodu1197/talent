import { NextRequest, NextResponse } from 'next/server';

// POST: 주소 → 좌표 변환 (Nominatim OpenStreetMap 사용 - 무료, API 키 불필요)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Nominatim API 호출 (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    console.log('[Geocode] Nominatim URL:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Dolpagu/1.0 (https://dolpagu.com)',
        'Accept-Language': 'ko',
      },
    });

    if (!response.ok) {
      console.error('[Geocode] Nominatim API error:', response.status);
      return NextResponse.json(
        { error: 'Geocoding API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Geocode] Nominatim response:', JSON.stringify(data));

    if (!data || data.length === 0) {
      return NextResponse.json({ latitude: 0, longitude: 0 });
    }

    const result = data[0];
    return NextResponse.json({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    });
  } catch (error) {
    console.error('Geocode error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
