import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import type { ErrandCategory, ErrandStatus, CreateErrandRequest } from '@/types/errand';
import { ERRAND_PRICING } from '@/types/errand';

// 심부름 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // 필터 파라미터
    const statusParam = searchParams.get('status');
    const status = statusParam && statusParam !== 'all' ? (statusParam as ErrandStatus) : null;
    const category = searchParams.get('category') as ErrandCategory | null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const mode = searchParams.get('mode'); // 'my' for requester's errands, 'available' for helpers

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('errands')
      .select(
        `
        *,
        requester:profiles!errands_requester_id_fkey(id, name, avatar_url),
        helper:profiles!errands_helper_id_fkey(id, name, avatar_url)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 모드별 필터링
    if (mode === 'my' && user) {
      // 내가 요청한 심부름
      query = query.eq('requester_id', user.id);
    } else if (mode === 'available') {
      // 헬퍼가 지원 가능한 심부름 (OPEN 상태만)
      query = query.eq('status', 'OPEN');
    }

    // 상태 필터
    if (status) {
      query = query.eq('status', status);
    }

    // 카테고리 필터
    if (category) {
      query = query.eq('category', category);
    }

    const { data: errands, error, count } = await query;

    if (error) {
      logServerError(error, { context: 'errands_list' });
      return NextResponse.json({ error: '심부름 목록을 불러올 수 없습니다' }, { status: 500 });
    }

    return NextResponse.json({
      errands,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errands_list_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 심부름 등록
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body: CreateErrandRequest = await request.json();

    // 필수 필드 검증
    if (!body.title?.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요' }, { status: 400 });
    }
    if (!body.pickup_address?.trim()) {
      return NextResponse.json({ error: '출발지 주소를 입력해주세요' }, { status: 400 });
    }
    if (!body.delivery_address?.trim()) {
      return NextResponse.json({ error: '도착지 주소를 입력해주세요' }, { status: 400 });
    }
    if (!body.category) {
      return NextResponse.json({ error: '카테고리를 선택해주세요' }, { status: 400 });
    }

    // 거리 기반 가격 계산
    let distancePrice = 0;
    let estimatedDistance = null;

    if (body.pickup_lat && body.pickup_lng && body.delivery_lat && body.delivery_lng) {
      // 간단한 거리 계산 (Haversine formula)
      const R = 6371; // 지구 반경 (km)
      const dLat = ((body.delivery_lat - body.pickup_lat) * Math.PI) / 180;
      const dLng = ((body.delivery_lng - body.pickup_lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((body.pickup_lat * Math.PI) / 180) *
          Math.cos((body.delivery_lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      estimatedDistance = Math.round(R * c * 100) / 100; // km, 소수점 2자리

      // 거리 요금 계산
      distancePrice = Math.round(estimatedDistance * ERRAND_PRICING.PRICE_PER_KM);
    }

    const totalPrice = ERRAND_PRICING.BASE_PRICE + distancePrice + (body.tip || 0);

    // 심부름 생성
    const { data: errand, error } = await supabase
      .from('errands')
      .insert({
        requester_id: user.id,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        category: body.category,
        pickup_address: body.pickup_address.trim(),
        pickup_lat: body.pickup_lat || null,
        pickup_lng: body.pickup_lng || null,
        delivery_address: body.delivery_address.trim(),
        delivery_lat: body.delivery_lat || null,
        delivery_lng: body.delivery_lng || null,
        estimated_distance: estimatedDistance,
        base_price: ERRAND_PRICING.BASE_PRICE,
        distance_price: distancePrice,
        tip: body.tip || 0,
        total_price: totalPrice,
        status: 'OPEN',
        scheduled_at: body.scheduled_at || null,
      })
      .select()
      .single();

    if (error) {
      logServerError(error, { context: 'errand_create', user_id: user.id });
      return NextResponse.json({ error: '심부름 등록에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ errand }, { status: 201 });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_create_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
