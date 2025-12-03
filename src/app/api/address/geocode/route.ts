import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY || '';

// POST: 주소 → 좌표 변환 (Kakao REST API 사용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Kakao 주소 검색 API 호출
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    logger.debug('[Geocode] Kakao API URL:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('[Geocode] Kakao API error:', response.status);
      return NextResponse.json(
        { error: 'Geocoding API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    logger.debug('[Geocode] Kakao response:', JSON.stringify(data));

    if (!data.documents || data.documents.length === 0) {
      // 주소 검색 실패 시 키워드 검색으로 재시도
      const keywordUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address)}`;
      const keywordResponse = await fetch(keywordUrl, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      });

      if (keywordResponse.ok) {
        const keywordData = await keywordResponse.json();
        if (keywordData.documents && keywordData.documents.length > 0) {
          const result = keywordData.documents[0];
          return NextResponse.json({
            latitude: parseFloat(result.y),
            longitude: parseFloat(result.x),
          });
        }
      }

      return NextResponse.json({ latitude: 0, longitude: 0 });
    }

    const result = data.documents[0];
    return NextResponse.json({
      latitude: parseFloat(result.y),
      longitude: parseFloat(result.x),
    });
  } catch (error) {
    console.error('Geocode error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
