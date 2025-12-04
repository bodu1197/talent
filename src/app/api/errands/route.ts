import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import type { ErrandCategory, ErrandStatus, CreateErrandRequest } from '@/types/errand';
import {
  calculateErrandPrice,
  calculateDistance,
  getCurrentTimeCondition,
} from '@/lib/errand-pricing';
import type { WeatherCondition, TimeCondition, WeightClass } from '@/lib/errand-pricing';

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

    // 거리 계산
    let estimatedDistance = 0;

    if (body.pickup_lat && body.pickup_lng && body.delivery_lat && body.delivery_lng) {
      estimatedDistance = calculateDistance(
        body.pickup_lat,
        body.pickup_lng,
        body.delivery_lat,
        body.delivery_lng
      );
    }

    // 클라이언트에서 전달된 요금 정보 사용 (검증 포함)
    const weather: WeatherCondition = body.weather_condition || 'CLEAR';
    const timeOfDay: TimeCondition = body.time_condition || getCurrentTimeCondition();
    const weight: WeightClass = body.weight_class || 'LIGHT';

    // 서버에서도 가격 계산하여 검증
    const priceBreakdown = calculateErrandPrice({
      distance: body.distance_km || estimatedDistance,
      weather,
      timeOfDay,
      weight,
    });

    // 클라이언트 가격과 서버 가격 비교 (10% 이내 차이 허용)
    const clientPrice = body.estimated_price || 0;
    const serverPrice = priceBreakdown.totalPrice;
    const priceDiff = Math.abs(clientPrice - serverPrice);
    const totalPrice = priceDiff <= serverPrice * 0.1 ? clientPrice : serverPrice;

    // 팁 추가
    const finalPrice = totalPrice + (body.tip || 0);

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
        estimated_distance: estimatedDistance || null,
        base_price: priceBreakdown.basePrice,
        distance_price: priceBreakdown.distancePrice,
        tip: body.tip || 0,
        total_price: finalPrice,
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
