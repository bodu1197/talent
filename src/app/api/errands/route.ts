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
import type {
  WeatherCondition,
  TimeCondition,
  WeightClass,
  ShoppingRange,
} from '@/lib/errand-pricing';

// 요청 본문 검증
function validateErrandRequest(body: CreateErrandRequest): string | null {
  if (!body.title?.trim()) return '제목을 입력해주세요';
  if (!body.pickup_address?.trim()) return '출발지 주소를 입력해주세요';
  if (!body.delivery_address?.trim()) return '도착지 주소를 입력해주세요';
  if (!body.category) return '카테고리를 선택해주세요';
  return null;
}

// 최종 가격 계산 (클라이언트/서버 가격 검증)
function calculateFinalPrice(clientPrice: number, serverPrice: number, tip: number): number {
  const priceDiff = Math.abs(clientPrice - serverPrice);
  const totalPrice = priceDiff <= serverPrice * 0.1 ? clientPrice : serverPrice;
  return totalPrice + tip;
}

// 기본 데이터 생성
function buildBaseInsertData(userId: string, body: CreateErrandRequest): Record<string, unknown> {
  return {
    requester_id: userId,
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
}

// 배달 가격 데이터 생성
function buildDeliveryPriceData(
  body: CreateErrandRequest,
  estimatedDistance: number,
  weather: WeatherCondition,
  timeOfDay: TimeCondition,
  weight: WeightClass
): Record<string, unknown> {
  const isMultiStop = body.is_multi_stop || false;
  const totalStops = isMultiStop && body.stops ? body.stops.length + 1 : 1;
  const distance = body.distance_km || estimatedDistance;
  const clientPrice = body.estimated_price || 0;
  const tip = body.tip || 0;

  if (isMultiStop && totalStops > 1) {
    const breakdown = calculateMultiStopPrice({ distance, weather, timeOfDay, weight, totalStops });
    return {
      estimated_distance: estimatedDistance || null,
      base_price: breakdown.basePrice,
      distance_price: breakdown.distancePrice,
      total_price: calculateFinalPrice(clientPrice, breakdown.totalPrice, tip),
      is_multi_stop: true,
      total_stops: totalStops,
      stop_fee: breakdown.stopFee,
      // 구매대행 필드 (배달에서는 0)
      range_fee: 0,
      item_fee: 0,
    };
  }

  const breakdown = calculateErrandPrice({ distance, weather, timeOfDay, weight });
  return {
    estimated_distance: estimatedDistance || null,
    base_price: breakdown.basePrice,
    distance_price: breakdown.distancePrice,
    total_price: calculateFinalPrice(clientPrice, breakdown.totalPrice, tip),
    is_multi_stop: false,
    total_stops: 1,
    stop_fee: 0,
    // 구매대행 필드 (배달에서는 0)
    range_fee: 0,
    item_fee: 0,
  };
}

// 구매대행 가격 데이터 생성
function buildShoppingPriceData(
  body: CreateErrandRequest,
  estimatedDistance: number,
  weather: WeatherCondition,
  timeOfDay: TimeCondition
): Record<string, unknown> {
  const range: ShoppingRange = body.shopping_range || 'LOCAL';
  const items = body.shopping_items || [];
  const hasHeavyItem = items.some(
    (item) =>
      item.note?.toLowerCase().includes('무거') || item.note?.toLowerCase().includes('heavy')
  );

  const breakdown = calculateShoppingPrice({
    range,
    itemCount: items.length,
    distance: estimatedDistance,
    weather,
    timeOfDay,
    hasHeavyItem,
  });

  const clientPrice = body.estimated_price || 0;
  const tip = body.tip || 0;

  return {
    // 배달 필드 (구매대행에서도 필요)
    estimated_distance: estimatedDistance || null,
    is_multi_stop: false,
    total_stops: 1,
    stop_fee: 0,
    // 공통 가격 필드
    base_price: breakdown.basePrice,
    distance_price: breakdown.distancePrice,
    total_price: calculateFinalPrice(clientPrice, breakdown.totalPrice, tip),
    // 구매대행 전용 필드
    shopping_range: range,
    shopping_items: items,
    range_fee: breakdown.rangeFee,
    item_fee: breakdown.itemFee,
  };
}

// Haversine formula로 두 지점 간 거리 계산 (km)
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

    // 위치 기반 파라미터 (라이더용)
    const helperLat = parseFloat(searchParams.get('lat') || '0');
    const helperLng = parseFloat(searchParams.get('lng') || '0');
    const sortBy = searchParams.get('sort') || 'recent'; // 'recent' | 'distance' | 'price'
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '0'); // km, 0이면 제한 없음

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('errands')
      .select(
        `
        *,
        requester:profiles!errands_requester_id_fkey(id, name, profile_image),
        helper:profiles!errands_helper_id_fkey(id, name, profile_image)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 모드별 필터링
    if (mode === 'my' && user) {
      // 내가 요청한 심부름 - profiles.id로 조회해야 함
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        query = query.eq('requester_id', profile.id);
      }
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

    // 라이더 위치가 제공된 경우 거리 계산 및 정렬
    let processedErrands = errands || [];

    if (helperLat && helperLng && mode === 'available') {
      // 각 심부름에 거리 정보 추가
      processedErrands = processedErrands.map((errand) => {
        let distance: number | null = null;

        // pickup 위치와 라이더 위치 간 거리 계산
        if (errand.pickup_lat && errand.pickup_lng) {
          distance = haversineDistance(
            helperLat,
            helperLng,
            errand.pickup_lat,
            errand.pickup_lng
          );
        }

        return {
          ...errand,
          distance_km: distance ? Math.round(distance * 10) / 10 : null, // 소수점 1자리
        };
      });

      // 최대 거리 필터링
      if (maxDistance > 0) {
        processedErrands = processedErrands.filter(
          (errand) => errand.distance_km === null || errand.distance_km <= maxDistance
        );
      }

      // 정렬
      if (sortBy === 'distance') {
        processedErrands.sort((a, b) => {
          // 거리 정보가 없는 경우 맨 뒤로
          if (a.distance_km === null) return 1;
          if (b.distance_km === null) return -1;
          return a.distance_km - b.distance_km;
        });
      } else if (sortBy === 'price') {
        processedErrands.sort((a, b) => (b.total_price || 0) - (a.total_price || 0));
      }
      // 'recent'는 이미 created_at 기준으로 정렬됨
    }

    return NextResponse.json({
      errands: processedErrands,
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

    // profiles 테이블에서 사용자의 profile id 조회 (FK 참조용)
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // 프로필 가져오기 또는 자동 생성
    const profile = await getOrCreateProfile(supabase, user, existingProfile, profileError);
    if (!profile) {
      return NextResponse.json(
        { error: '프로필 정보를 처리할 수 없습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    const body: CreateErrandRequest = await request.json();

    // 필수 필드 검증
    const validationError = validateErrandRequest(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 거리 계산
    const estimatedDistance = calculateEstimatedDistance(body);

    // 요금 계산 조건
    const weather: WeatherCondition = body.weather_condition || 'CLEAR';
    const timeOfDay: TimeCondition = body.time_condition || getCurrentTimeCondition();
    const weight: WeightClass = body.weight_class || 'LIGHT';

    // 기본 데이터 생성 (profiles.id 사용 - FK 참조)
    const baseData = buildBaseInsertData(profile.id, body);

    // 카테고리별 가격 데이터 생성
    const priceData =
      body.category === 'SHOPPING'
        ? buildShoppingPriceData(body, estimatedDistance, weather, timeOfDay)
        : buildDeliveryPriceData(body, estimatedDistance, weather, timeOfDay, weight);

    const insertData = { ...baseData, ...priceData };

    // 심부름 생성
    const { data: errand, error } = await supabase
      .from('errands')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logServerError(error, { context: 'errand_create', user_id: user.id, insertData });
      // 개발 환경에서는 상세 에러 반환
      const errorMessage =
        process.env.NODE_ENV === 'development'
          ? `심부름 등록 실패: ${error.message} (code: ${error.code}, details: ${error.details})`
          : '심부름 등록에 실패했습니다';
      console.error('[Errand Create Error]', {
        error,
        insertData,
        profile_id: profile.id,
        user_id: user.id,
      });
      return NextResponse.json(
        {
          error: errorMessage,
          // 프로덕션에서도 디버깅용 힌트 제공
          debug: {
            code: error.code,
            hint: error.hint,
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    // 다중 배달인 경우 정차지 저장
    await saveErrandStops(supabase, body, errand.id);

    // 활성 헬퍼들에게 알림 발송 (비동기로 처리, 실패해도 심부름 등록은 성공)
    sendNewErrandNotifications(supabase, errand).catch((err) => {
      logServerError(err instanceof Error ? err : new Error(String(err)), {
        context: 'errand_notification_error',
        errand_id: errand.id,
      });
    });

    return NextResponse.json({ errand }, { status: 201 });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_create_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 거리 계산 헬퍼
function calculateEstimatedDistance(body: CreateErrandRequest): number {
  if (body.pickup_lat && body.pickup_lng && body.delivery_lat && body.delivery_lng) {
    return calculateDistance(
      body.pickup_lat,
      body.pickup_lng,
      body.delivery_lat,
      body.delivery_lng
    );
  }
  return 0;
}

// 정차지 저장 헬퍼
async function saveErrandStops(
  supabase: Awaited<ReturnType<typeof createClient>>,
  body: CreateErrandRequest,
  errandId: string
): Promise<void> {
  if (body.category !== 'DELIVERY' || !body.is_multi_stop || !body.stops?.length) {
    return;
  }

  const stopsToInsert = body.stops.map((stop, index) => ({
    errand_id: errandId,
    stop_order: index + 2,
    address: stop.address,
    address_detail: stop.address_detail || null,
    lat: stop.lat || null,
    lng: stop.lng || null,
    recipient_name: stop.recipient_name || null,
    recipient_phone: stop.recipient_phone || null,
  }));

  const { error: stopsError } = await supabase.from('errand_stops').insert(stopsToInsert);

  if (stopsError) {
    logServerError(stopsError, { context: 'errand_stops_create', errand_id: errandId });
  }
}

// 프로필 조회 또는 자동 생성 헬퍼
interface ProfileResult {
  id: string;
}

async function getOrCreateProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string; user_metadata?: { name?: string } },
  existingProfile: ProfileResult | null,
  profileError: { code?: string; message?: string } | null
): Promise<ProfileResult | null> {
  // 프로필이 이미 있으면 반환
  if (existingProfile && !profileError) {
    return existingProfile;
  }

  // PGRST116은 "no rows returned" 에러 - 프로필이 없음
  if (profileError?.code === 'PGRST116' || !existingProfile) {
    // profiles 테이블 스키마: id, user_id, name, profile_image, bio, role, created_at, updated_at
    // email 컬럼은 profiles 테이블에 존재하지 않음 (auth.users에만 있음)
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
      })
      .select('id')
      .single();

    if (createError || !newProfile) {
      logServerError(createError || new Error('Failed to create profile'), {
        context: 'errand_create_profile_auto_create',
        user_id: user.id,
      });
      return null;
    }
    return newProfile;
  }

  // 다른 에러인 경우
  if (profileError) {
    logServerError(new Error(profileError.message || 'Profile lookup failed'), {
      context: 'errand_create_profile_lookup',
      user_id: user.id,
    });
    return null;
  }

  return null;
}

// 새 심부름 알림 발송 (활성 헬퍼들에게)
interface ErrandForNotification {
  id: string;
  title: string;
  category: ErrandCategory;
  total_price: number;
  pickup_address: string;
}

async function sendNewErrandNotifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  errand: ErrandForNotification
): Promise<void> {
  // 활성 헬퍼들 조회 (구독 상태가 active 또는 trial인 헬퍼)
  const { data: activeHelpers, error: helpersError } = await supabase
    .from('helper_profiles')
    .select('user_id')
    .eq('is_active', true)
    .in('subscription_status', ['active', 'trial'])
    .limit(100);

  if (helpersError || !activeHelpers?.length) return;

  const categoryLabel = errand.category === 'DELIVERY' ? '배달' : '구매대행';
  const notifications = activeHelpers.map((helper) => ({
    user_id: helper.user_id,
    type: 'new_errand',
    title: '새로운 심부름이 등록되었습니다!',
    message: `[${categoryLabel}] ${errand.title} - ${errand.total_price?.toLocaleString()}원`,
    link: `/errands/${errand.id}`,
    is_read: false,
    data: {
      errand_id: errand.id,
      category: errand.category,
      pickup_address: errand.pickup_address,
    },
  }));

  const { error: notifyError } = await supabase.from('notifications').insert(notifications);
  if (notifyError) throw notifyError;
}
