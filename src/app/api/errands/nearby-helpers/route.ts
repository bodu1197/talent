import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import { calculateDistance } from '@/lib/geo';

// GET /api/errands/nearby-helpers - 내 주변 활성 라이더 수 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number.parseFloat(searchParams.get('lat') ?? '');
    const lng = Number.parseFloat(searchParams.get('lng') ?? '');
    const radiusKm = Number.parseFloat(searchParams.get('radius') || '5'); // 기본 5km
    const staleMinutes = Number.parseInt(searchParams.get('stale') || '10'); // 기본 10분

    // 위치 파라미터 검증
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ error: '위치 정보가 필요합니다 (lat, lng)' }, { status: 400 });
    }

    // 위도/경도 범위 검사
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: '위치 범위가 올바르지 않습니다' }, { status: 400 });
    }

    const supabase = await createClient();

    // PostgreSQL 함수 호출 시도 (마이그레이션 완료 시)
    try {
      const { data, error } = await supabase.rpc('get_nearby_helpers_count', {
        p_lat: lat,
        p_lng: lng,
        p_radius_km: radiusKm,
        p_stale_minutes: staleMinutes,
      });

      if (!error && data !== null) {
        return NextResponse.json({
          count: data,
          location: { lat, lng },
          radiusKm,
          message: getNearbyMessage(data),
        });
      }
    } catch {
      // 함수가 없으면 fallback 쿼리 사용
    }

    // Fallback: 직접 쿼리 (함수가 없을 때)
    // 위치 컬럼이 없으면 활성 라이더 총 수 반환
    const { data: helpers, error: fallbackError } = await supabase
      .from('helper_profiles')
      .select('id, current_lat, current_lng, last_location_at')
      .eq('is_active', true)
      .in('subscription_status', ['active', 'trial']);

    if (fallbackError) {
      // 컬럼이 없는 경우
      if (
        fallbackError.message.includes('current_lat') ||
        fallbackError.message.includes('column')
      ) {
        // 위치 컬럼 없음 - 활성 라이더 수만 반환
        const { count, error: countError } = await supabase
          .from('helper_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .in('subscription_status', ['active', 'trial']);

        if (countError) {
          throw countError;
        }

        return NextResponse.json({
          count: count || 0,
          location: { lat, lng },
          radiusKm,
          message: getNearbyMessage(count || 0),
          note: '위치 기반 필터링 미적용 (마이그레이션 필요)',
        });
      }
      throw fallbackError;
    }

    // 위치 컬럼이 있는 경우 - JavaScript로 거리 계산
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - staleMinutes * 60 * 1000);

    const nearbyCount = (helpers || []).filter((helper) => {
      // 위치 정보가 없으면 제외
      if (!helper.current_lat || !helper.current_lng) return false;

      // 위치가 오래되었으면 제외
      if (helper.last_location_at) {
        const lastUpdate = new Date(helper.last_location_at);
        if (lastUpdate < staleThreshold) return false;
      } else {
        return false; // 위치 업데이트 시간이 없으면 제외
      }

      // 거리 계산 (Haversine formula)
      const distance = calculateDistance(
        lat,
        lng,
        Number.parseFloat(helper.current_lat),
        Number.parseFloat(helper.current_lng)
      );

      return distance <= radiusKm;
    }).length;

    return NextResponse.json({
      count: nearbyCount,
      location: { lat, lng },
      radiusKm,
      message: getNearbyMessage(nearbyCount),
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'nearby_helpers_count_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// Haversine formula로 두 지점 간 거리 계산 (km)

// 주변 라이더 수에 따른 메시지
function getNearbyMessage(count: number): string {
  if (count === 0) {
    return '현재 주변에 활동 중인 라이더가 없습니다';
  } else if (count === 1) {
    return '주변에 1명의 라이더가 활동 중입니다';
  } else if (count <= 3) {
    return `주변에 ${count}명의 라이더가 활동 중입니다`;
  } else if (count <= 10) {
    return `주변에 ${count}명의 라이더가 대기 중! 빠른 매칭이 가능합니다`;
  } else {
    return `주변에 ${count}명의 라이더가 대기 중! 즉시 매칭 가능합니다`;
  }
}
