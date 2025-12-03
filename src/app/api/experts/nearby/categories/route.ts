import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET: 카테고리별 주변 전문가 수 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseInt(searchParams.get('radius') || '10'); // 기본 10km

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

    // RPC 함수로 카테고리별 전문가 수 조회
    const { data, error } = await supabase.rpc('get_nearby_experts_count', {
      user_lat: lat,
      user_lon: lng,
      radius_km: radius,
    });

    if (error) {
      logger.error('Get nearby experts count error:', error);
      return NextResponse.json(
        {
          error: 'Failed to get nearby experts count',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // ThirdHeroBanner에 맞게 응답 형식 변환
    const categories = (data || []).map(
      (item: {
        category_id: string;
        category_slug: string;
        category_name: string;
        expert_count: number;
      }) => ({
        category_id: item.category_id,
        category_slug: item.category_slug,
        category_name: item.category_name,
        count: item.expert_count, // expert_count → count로 매핑
      })
    );

    return NextResponse.json({
      categories,
      meta: {
        lat,
        lng,
        radius_km: radius,
        total_categories: categories.length,
      },
    });
  } catch (error) {
    logger.error('Nearby experts categories GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
