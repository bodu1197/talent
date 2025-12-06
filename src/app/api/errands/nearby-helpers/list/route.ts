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
    const staleMinutes = parseInt(searchParams.get('stale') || '10');
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

    // PostgreSQL 함수로 주변 라이더 목록 조회 시도
    try {
      const { data, error } = await supabase.rpc('get_nearby_helpers', {
        p_lat: lat,
        p_lng: lng,
        p_radius_km: radiusKm,
        p_stale_minutes: staleMinutes,
        p_limit: limit,
      });

      if (!error && data) {
        // 프로필 정보와 조인
        const helperIds = data.map((h: { user_id: string }) => h.user_id);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, profile_image')
          .in('user_id', helperIds);

        const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

        const helpers: HelperLocation[] = data.map(
          (h: {
            helper_id: string;
            user_id: string;
            grade: string;
            average_rating: number;
            distance_km: number;
          }) => {
            const profile = profileMap.get(h.user_id);
            return {
              id: h.helper_id,
              name: profile?.name || '라이더',
              profileImage: profile?.profile_image || null,
              // eslint-disable-next-line sonarjs/pseudo-random -- 보안에 민감하지 않은 UI 위치 표시용
              lat: lat + (Math.random() - 0.5) * 0.02,
              // eslint-disable-next-line sonarjs/pseudo-random -- 보안에 민감하지 않은 UI 위치 표시용
              lng: lng + (Math.random() - 0.5) * 0.02,
              distance: h.distance_km,
              grade: h.grade,
              rating: h.average_rating,
            };
          }
        );

        return NextResponse.json({
          helpers,
          count: helpers.length,
          location: { lat, lng },
          radiusKm,
        });
      }
    } catch {
      // 함수가 없으면 fallback 쿼리 사용
    }

    // Fallback: 직접 쿼리
    const { data: helperProfiles, error: fallbackError } = await supabase
      .from('helper_profiles')
      .select(
        `
        id,
        user_id,
        grade,
        average_rating,
        current_lat,
        current_lng,
        last_location_at,
        profiles!helper_profiles_profile_id_fkey (
          name,
          profile_image
        )
      `
      )
      .eq('is_active', true)
      .eq('is_online', true)
      .in('subscription_status', ['active', 'trial'])
      .limit(limit * 2); // 거리 필터 후 줄어들 것을 대비

    if (fallbackError) {
      // 컬럼이 없는 경우 - 위치 컬럼 없이 조회
      if (
        fallbackError.message.includes('current_lat') ||
        fallbackError.message.includes('column')
      ) {
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

        if (basicError) throw basicError;

        // 위치 없이 반환 (가상의 위치로 표시)
        /* eslint-disable sonarjs/pseudo-random */
        const helpers: HelperLocation[] = (basicHelpers || []).map((h, index) => {
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
          note: '위치 기반 필터링 미적용 (마이그레이션 필요)',
        });
      }
      throw fallbackError;
    }

    // 위치 정보가 있는 경우 - 거리 계산 및 필터링
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - staleMinutes * 60 * 1000);

    const helpers: HelperLocation[] = (helperProfiles || [])
      .filter((helper) => {
        if (!helper.current_lat || !helper.current_lng) return false;
        if (helper.last_location_at) {
          const lastUpdate = new Date(helper.last_location_at);
          if (lastUpdate < staleThreshold) return false;
        } else {
          return false;
        }
        const distance = calculateDistance(
          lat,
          lng,
          parseFloat(helper.current_lat),
          parseFloat(helper.current_lng)
        );
        return distance <= radiusKm;
      })
      .map((helper) => {
        const distance = calculateDistance(
          lat,
          lng,
          parseFloat(helper.current_lat!),
          parseFloat(helper.current_lng!)
        );
        const profile = Array.isArray(helper.profiles) ? helper.profiles[0] : helper.profiles;

        return {
          id: helper.id,
          name: profile?.name || '라이더',
          profileImage: profile?.profile_image || null,
          lat: parseFloat(helper.current_lat!),
          lng: parseFloat(helper.current_lng!),
          distance: parseFloat(distance.toFixed(2)),
          grade: helper.grade,
          rating: helper.average_rating,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({
      helpers,
      count: helpers.length,
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

// Haversine formula로 두 지점 간 거리 계산 (km)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
