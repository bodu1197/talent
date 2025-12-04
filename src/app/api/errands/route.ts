import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import type { ErrandCategory, ErrandStatus, CreateErrandRequest } from '@/types/errand';
import {
  calculateErrandPrice,
  calculateMultiStopPrice,
  calculateShoppingPrice,
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

    // 카테고리별 요금 계산 분기
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let insertData: Record<string, any> = {
      requester_id: user.id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      category: body.category,
      pickup_address: body.pickup_address.trim(),
      pickup_detail: body.pickup_detail?.trim() || null,
      pickup_lat: body.pickup_lat || null,
      pickup_lng: body.pickup_lng || null,
      delivery_address: body.delivery_address.trim(),
      delivery_detail: body.delivery_detail?.trim() || null,
      delivery_lat: body.delivery_lat || null,
      delivery_lng: body.delivery_lng || null,
      tip: body.tip || 0,
      status: 'OPEN',
      scheduled_at: body.scheduled_at || null,
    };

    if (body.category === 'DELIVERY') {
      // 배달 카테고리
      const isMultiStop = body.is_multi_stop || false;
      const totalStops = isMultiStop && body.stops ? body.stops.length + 1 : 1;

      if (isMultiStop && totalStops > 1) {
        // 다중 배달
        const multiStopBreakdown = calculateMultiStopPrice({
          distance: body.distance_km || estimatedDistance,
          weather,
          timeOfDay,
          weight,
          totalStops,
        });

        const clientPrice = body.estimated_price || 0;
        const serverPrice = multiStopBreakdown.totalPrice;
        const priceDiff = Math.abs(clientPrice - serverPrice);
        const totalPrice = priceDiff <= serverPrice * 0.1 ? clientPrice : serverPrice;
        const finalPrice = totalPrice + (body.tip || 0);

        insertData = {
          ...insertData,
          estimated_distance: estimatedDistance || null,
          base_price: multiStopBreakdown.basePrice,
          distance_price: multiStopBreakdown.distancePrice,
          total_price: finalPrice,
          is_multi_stop: true,
          total_stops: totalStops,
          stop_fee: multiStopBreakdown.stopFee,
        };
      } else {
        // 단일 배달
        const priceBreakdown = calculateErrandPrice({
          distance: body.distance_km || estimatedDistance,
          weather,
          timeOfDay,
          weight,
        });

        const clientPrice = body.estimated_price || 0;
        const serverPrice = priceBreakdown.totalPrice;
        const priceDiff = Math.abs(clientPrice - serverPrice);
        const totalPrice = priceDiff <= serverPrice * 0.1 ? clientPrice : serverPrice;
        const finalPrice = totalPrice + (body.tip || 0);

        insertData = {
          ...insertData,
          estimated_distance: estimatedDistance || null,
          base_price: priceBreakdown.basePrice,
          distance_price: priceBreakdown.distancePrice,
          total_price: finalPrice,
          is_multi_stop: false,
          total_stops: 1,
          stop_fee: 0,
        };
      }
    } else if (body.category === 'SHOPPING') {
      // 구매대행 카테고리
      const shoppingRange = body.shopping_range || 'LOCAL';
      const shoppingItems = body.shopping_items || [];
      const hasHeavyItem = shoppingItems.some(
        (item) => item.note?.toLowerCase().includes('무거') || item.note?.toLowerCase().includes('heavy')
      );

      const shoppingBreakdown = calculateShoppingPrice({
        range: shoppingRange,
        itemCount: shoppingItems.length,
        distance: estimatedDistance,
        weather,
        timeOfDay,
        hasHeavyItem,
      });

      const clientPrice = body.estimated_price || 0;
      const serverPrice = shoppingBreakdown.totalPrice;
      const priceDiff = Math.abs(clientPrice - serverPrice);
      const totalPrice = priceDiff <= serverPrice * 0.1 ? clientPrice : serverPrice;
      const finalPrice = totalPrice + (body.tip || 0);

      insertData = {
        ...insertData,
        base_price: shoppingBreakdown.basePrice,
        distance_price: shoppingBreakdown.distancePrice,
        total_price: finalPrice,
        shopping_range: shoppingRange,
        shopping_items: shoppingItems,
        range_fee: shoppingBreakdown.rangeFee,
        item_fee: shoppingBreakdown.itemFee,
      };
    }

    // 심부름 생성
    const { data: errand, error } = await supabase
      .from('errands')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logServerError(error, { context: 'errand_create', user_id: user.id });
      return NextResponse.json({ error: '심부름 등록에 실패했습니다' }, { status: 500 });
    }

    // 다중 배달인 경우 정차지 저장
    if (body.category === 'DELIVERY' && body.is_multi_stop && body.stops && body.stops.length > 0) {
      const stopsToInsert = body.stops.map((stop, index) => ({
        errand_id: errand.id,
        stop_order: index + 2, // 첫 번째 도착지 다음부터
        address: stop.address,
        address_detail: stop.address_detail || null,
        lat: stop.lat || null,
        lng: stop.lng || null,
        recipient_name: stop.recipient_name || null,
        recipient_phone: stop.recipient_phone || null,
      }));

      const { error: stopsError } = await supabase.from('errand_stops').insert(stopsToInsert);

      if (stopsError) {
        logServerError(stopsError, { context: 'errand_stops_create', errand_id: errand.id });
        // 정차지 저장 실패해도 심부름은 생성됨 (경고만 로깅)
      }
    }

    return NextResponse.json({ errand }, { status: 201 });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_create_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
