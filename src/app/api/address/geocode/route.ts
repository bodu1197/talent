import { NextRequest, NextResponse } from 'next/server';

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

// POST: 주소 → 좌표 변환
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    if (!KAKAO_REST_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Kakao API error' }, { status: response.status });
    }

    const data = await response.json();

    if (!data.documents || data.documents.length === 0) {
      return NextResponse.json({ latitude: 0, longitude: 0 });
    }

    const doc = data.documents[0];
    return NextResponse.json({
      latitude: parseFloat(doc.y),
      longitude: parseFloat(doc.x),
    });
  } catch (error) {
    console.error('Geocode error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
