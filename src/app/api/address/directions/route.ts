import { NextRequest, NextResponse } from 'next/server';
import { calculateDistance } from '@/lib/geo';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY || '';

interface DirectionsResponse {
  distance: number; // 미터 단위
  duration: number; // 초 단위
  distanceKm: number; // km 단위
  durationMin: number; // 분 단위
}

// POST: 두 좌표 간 도로 거리 계산 (카카오 모빌리티 API)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originLat, originLng, destLat, destLng } = body;

    if (!originLat || !originLng || !destLat || !destLng) {
      return NextResponse.json({ error: '출발지와 도착지 좌표가 필요합니다' }, { status: 400 });
    }

    if (!KAKAO_REST_API_KEY) {
      // API 키가 없으면 직선 거리 × 1.4 보정계수 적용
      const straightDistance = calculateDistance(originLat, originLng, destLat, destLng);
      const estimatedRoadDistance = straightDistance * 1.4;

      return NextResponse.json({
        distance: Math.round(estimatedRoadDistance * 1000),
        duration: Math.round((estimatedRoadDistance / 30) * 3600), // 30km/h 평균 속도 가정
        distanceKm: Math.round(estimatedRoadDistance * 10) / 10,
        durationMin: Math.round((estimatedRoadDistance / 30) * 60),
        estimated: true,
      });
    }

    // 카카오 모빌리티 길찾기 API 호출
    // origin, destination: "경도,위도" 형식
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${originLng},${originLat}&destination=${destLng},${destLat}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Directions] Kakao API error:', response.status, errorText);

      // API 오류 시 직선 거리 × 1.4 보정계수 적용
      const straightDistance = calculateDistance(originLat, originLng, destLat, destLng);
      const estimatedRoadDistance = straightDistance * 1.4;

      return NextResponse.json({
        distance: Math.round(estimatedRoadDistance * 1000),
        duration: Math.round((estimatedRoadDistance / 30) * 3600),
        distanceKm: Math.round(estimatedRoadDistance * 10) / 10,
        durationMin: Math.round((estimatedRoadDistance / 30) * 60),
        estimated: true,
        fallback: true,
      });
    }

    const data = await response.json();

    // 응답에서 거리와 시간 추출
    const route = data.routes?.[0];
    if (route?.result_code !== 0) {
      // 경로를 찾을 수 없는 경우 직선 거리 사용
      const straightDistance = calculateDistance(originLat, originLng, destLat, destLng);
      const estimatedRoadDistance = straightDistance * 1.4;

      return NextResponse.json({
        distance: Math.round(estimatedRoadDistance * 1000),
        duration: Math.round((estimatedRoadDistance / 30) * 3600),
        distanceKm: Math.round(estimatedRoadDistance * 10) / 10,
        durationMin: Math.round((estimatedRoadDistance / 30) * 60),
        estimated: true,
        noRoute: true,
      });
    }

    const summary = route.summary;
    const distanceMeters = summary.distance; // 미터
    const durationSeconds = summary.duration; // 초

    const result: DirectionsResponse = {
      distance: distanceMeters,
      duration: durationSeconds,
      distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
      durationMin: Math.round(durationSeconds / 60),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Directions API error:', error);

    // 오류 시 기본값 반환
    return NextResponse.json({ error: '길찾기 API 오류가 발생했습니다' }, { status: 500 });
  }
}

// Haversine 공식으로 직선 거리 계산 (km)
