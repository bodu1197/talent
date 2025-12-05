import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';

// POST /api/helper/location - 라이더 위치 업데이트
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { lat, lng, isOnline } = body;

    // 위치 유효성 검사
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: '유효하지 않은 위치 정보입니다' }, { status: 400 });
    }

    // 위도/경도 범위 검사
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: '위치 범위가 올바르지 않습니다' }, { status: 400 });
    }

    // 헬퍼 프로필 확인
    const { data: helperProfile, error: profileError } = await supabase
      .from('helper_profiles')
      .select('id, is_active, subscription_status')
      .eq('user_id', user.id)
      .single();

    if (profileError || !helperProfile) {
      return NextResponse.json({ error: '라이더로 등록되어 있지 않습니다' }, { status: 404 });
    }

    // 구독 상태 확인 (활성 구독만 위치 업데이트 허용)
    if (
      helperProfile.subscription_status !== 'active' &&
      helperProfile.subscription_status !== 'trial'
    ) {
      return NextResponse.json(
        { error: '활성 구독이 필요합니다. 구독을 갱신해주세요.' },
        { status: 403 }
      );
    }

    // 위치 업데이트
    const updateData: Record<string, unknown> = {
      current_lat: lat,
      current_lng: lng,
      last_location_at: new Date().toISOString(),
    };

    // isOnline이 명시적으로 전달된 경우에만 업데이트
    if (typeof isOnline === 'boolean') {
      updateData.is_online = isOnline;
    }

    const { error: updateError } = await supabase
      .from('helper_profiles')
      .update(updateData)
      .eq('id', helperProfile.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: '위치가 업데이트되었습니다',
      location: { lat, lng },
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_location_update_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// GET /api/helper/location - 내 현재 위치 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { data: helperProfile, error } = await supabase
      .from('helper_profiles')
      .select('current_lat, current_lng, last_location_at, is_online')
      .eq('user_id', user.id)
      .single();

    if (error || !helperProfile) {
      return NextResponse.json({ error: '라이더로 등록되어 있지 않습니다' }, { status: 404 });
    }

    return NextResponse.json({
      location: {
        lat: helperProfile.current_lat,
        lng: helperProfile.current_lng,
        updatedAt: helperProfile.last_location_at,
      },
      isOnline: helperProfile.is_online,
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_location_get_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// PATCH /api/helper/location - 온라인 상태만 변경
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { isOnline } = body;

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ error: 'isOnline 값이 필요합니다' }, { status: 400 });
    }

    // 헬퍼 프로필 확인
    const { data: helperProfile, error: profileError } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !helperProfile) {
      return NextResponse.json({ error: '라이더로 등록되어 있지 않습니다' }, { status: 404 });
    }

    // 온라인 상태 업데이트
    const { error: updateError } = await supabase
      .from('helper_profiles')
      .update({ is_online: isOnline })
      .eq('id', helperProfile.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      isOnline,
      message: isOnline ? '활동을 시작합니다' : '활동을 종료합니다',
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_online_status_update_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
