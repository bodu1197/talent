import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 좌표 검증 헬퍼
function validateCoordinates(lat: number, lng: number): NextResponse | null {
  // NaN 체크
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: 'Missing or invalid coordinates: lat, lng required' },
      { status: 400 }
    );
  }

  // 범위 검증
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
  }

  return null;
}

// GET: 주변 서비스 조회 (서비스 위치 기반)
// 판매자가 아닌 실제 서비스 제공 위치를 기준으로 검색
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const lat = Number.parseFloat(searchParams.get('lat') ?? '');
    const lng = Number.parseFloat(searchParams.get('lng') ?? '');
    const radius = Number.parseInt(searchParams.get('radius') || '10'); // 기본 10km
    const category = searchParams.get('category') || null; // 카테고리 필터 (slug)
    const limit = Number.parseInt(searchParams.get('limit') || '20');

    // 좌표 검증
    const validationError = validateCoordinates(lat, lng);
    if (validationError) {
      return validationError;
    }

    // RPC 함수로 주변 서비스 조회 (서비스 위치 기반)
    const { data, error } = await supabase.rpc('get_nearby_services', {
      user_lat: lat,
      user_lon: lng,
      category_slug_filter: category,
      radius_km: radius,
      limit_count: limit,
    });

    if (error) {
      logger.error('Get nearby services error:', error);
      return NextResponse.json(
        {
          error: 'Failed to get nearby services',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      meta: {
        lat,
        lng,
        radius_km: radius,
        category_filter: category,
        total: data?.length || 0,
      },
    });
  } catch (error) {
    logger.error('Nearby services GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
