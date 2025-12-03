import { NextRequest, NextResponse } from 'next/server';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY || '';

// POST: 좌표 → 주소 변환 (역지오코딩)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    if (!KAKAO_REST_API_KEY) {
      return NextResponse.json({ error: 'Kakao API key not configured' }, { status: 500 });
    }

    // Kakao 역지오코딩 API 호출
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Reverse geocoding API error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.documents || data.documents.length === 0) {
      return NextResponse.json({
        address: null,
        roadAddress: null,
        region: null,
      });
    }

    const doc = data.documents[0];
    const address = doc.address;
    const roadAddress = doc.road_address;

    return NextResponse.json({
      address: address?.address_name || null,
      roadAddress: roadAddress?.address_name || null,
      region: address?.region_2depth_name || null, // 구/군
      latitude,
      longitude,
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
