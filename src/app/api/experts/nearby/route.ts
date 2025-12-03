import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET: 주변 전문가 조회 (위치 기반)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseInt(searchParams.get('radius') || '10'); // 기본 10km
    const category = searchParams.get('category') || null; // 카테고리 필터 (slug)
    const limit = parseInt(searchParams.get('limit') || '20');

    // 필수 파라미터 검증
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          error: 'Missing or invalid coordinates: lat, lng required',
        },
        { status: 400 }
      );
    }

    // 좌표 범위 검증
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          error: 'Coordinates out of range',
        },
        { status: 400 }
      );
    }

    // RPC 함수로 주변 전문가 조회
    const { data, error } = await supabase.rpc('get_nearby_experts', {
      user_lat: lat,
      user_lon: lng,
      category_slug_filter: category,
      radius_km: radius,
      limit_count: limit,
    });

    if (error) {
      logger.error('Get nearby experts error:', error);
      return NextResponse.json(
        {
          error: 'Failed to get nearby experts',
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
    logger.error('Nearby experts GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
