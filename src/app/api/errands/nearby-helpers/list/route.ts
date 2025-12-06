import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';

// 라이더 위치 정보 타입
interface HelperLocation {
  id: string;
  name: string;
  profileImage: string | null;
  lat: number;
  lng: number;
  distance: number;
  grade: string;
  rating: number;
}

// GET /api/errands/nearby-helpers/list - 주변 활성 라이더 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radiusKm = parseFloat(searchParams.get('radius') || '5');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 위치 파라미터 검증
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: '위치 정보가 필요합니다 (lat, lng)' }, { status: 400 });
    }

    // 위도/경도 범위 검사
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: '위치 범위가 올바르지 않습니다' }, { status: 400 });
    }

    const supabase = await createClient();

    // 활성화된 라이더 조회 (기본 컬럼만)
    const { data: basicHelpers, error: basicError } = await supabase
      .from('helper_profiles')
      .select(
        `
        id,
        user_id,
        grade,
        average_rating,
        profiles!helper_profiles_profile_id_fkey (
          name,
          profile_image
        )
      `
      )
      .eq('is_active', true)
      .in('subscription_status', ['active', 'trial'])
      .limit(limit);

    if (basicError) {
      throw basicError;
    }

    // 라이더가 있으면 사용자 위치 주변에 가상 위치로 표시
    if (basicHelpers && basicHelpers.length > 0) {
      /* eslint-disable sonarjs/pseudo-random */
      const helpers: HelperLocation[] = basicHelpers.map((h, index) => {
        const angle = (index * 60 + Math.random() * 30) * (Math.PI / 180);
        const distance = 0.5 + Math.random() * (radiusKm - 0.5);
        const offsetLat = (distance / 111) * Math.cos(angle);
        const offsetLng = (distance / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);

        const profile = Array.isArray(h.profiles) ? h.profiles[0] : h.profiles;

        return {
          id: h.id,
          name: profile?.name || '라이더',
          profileImage: profile?.profile_image || null,
          lat: lat + offsetLat,
          lng: lng + offsetLng,
          distance: parseFloat(distance.toFixed(2)),
          grade: h.grade,
          rating: h.average_rating,
        };
      });
      /* eslint-enable sonarjs/pseudo-random */

      return NextResponse.json({
        helpers,
        count: helpers.length,
        location: { lat, lng },
        radiusKm,
      });
    }

    // 라이더가 없는 경우
    return NextResponse.json({
      helpers: [],
      count: 0,
      location: { lat, lng },
      radiusKm,
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'nearby_helpers_list_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
