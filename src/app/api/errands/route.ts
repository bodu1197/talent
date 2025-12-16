import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import { requireLogin } from '@/lib/api/auth';
import type { ErrandCategory, ErrandStatus, CreateErrandRequest } from '@/types/errand';
import {
  calculateErrandPrice,
  calculateMultiStopPrice,
  calculateShoppingPrice,
  calculateDistance,
  getCurrentTimeCondition,
} from '@/lib/errand-pricing';
import { calculateDistance as calculateGeoDistance } from '@/lib/geo';
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

// 심부름 목록 파라미터 파싱
interface ErrandListParams {
  status: ErrandStatus | null;
  category: ErrandCategory | null;
  limit: number;
  offset: number;
  mode: string | null;
  helperLat: number;
  helperLng: number;
  sortBy: string;
  maxDistance: number;
}

function parseErrandListParams(searchParams: URLSearchParams): ErrandListParams {
  const statusParam = searchParams.get('status');
  return {
    status: statusParam && statusParam !== 'all' ? (statusParam as ErrandStatus) : null,
    category: searchParams.get('category') as ErrandCategory | null,
    limit: Number.parseInt(searchParams.get('limit') || '20', 10),
    offset: Number.parseInt(searchParams.get('offset') || '0', 10),
    mode: searchParams.get('mode'),
    helperLat: parseFloat(searchParams.get('lat') || '0'),
    helperLng: parseFloat(searchParams.get('lng') || '0'),
    sortBy: searchParams.get('sort') || 'recent',
    maxDistance: parseFloat(searchParams.get('maxDistance') || '0'),
  };
}

// 심부름에 거리 정보 추가
function addDistanceToErrands(
  errands: Record<string, unknown>[],
  helperLat: number,
  helperLng: number
): Record<string, unknown>[] {
  return errands.map((errand) => {
    const pickupLat = errand.pickup_lat as number | null;
    const pickupLng = errand.pickup_lng as number | null;
    let distance: number | null = null;

    if (pickupLat && pickupLng) {
      distance = calculateGeoDistance(helperLat, helperLng, pickupLat, pickupLng);
    }

    return {
      ...errand,
      distance_km: distance ? Math.round(distance * 10) / 10 : null,
    };
  });
}

// 거리 기반 필터링 및 정렬
function filterAndSortByDistance(
  errands: Record<string, unknown>[],
  maxDistance: number,
  sortBy: string
): Record<string, unknown>[] {
  let result = errands;

  // 최대 거리 필터링
  if (maxDistance > 0) {
    result = result.filter(
      (errand) => errand.distance_km === null || (errand.distance_km as number) <= maxDistance
    );
  }

  // 정렬
  if (sortBy === 'distance') {
    result.sort((a, b) => {
      if (a.distance_km === null) return 1;
      if (b.distance_km === null) return -1;
      return (a.distance_km as number) - (b.distance_km as number);
    });
  } else if (sortBy === 'price') {
    result.sort((a, b) => ((b.total_price as number) || 0) - ((a.total_price as number) || 0));
  }

  return result;
}

// 심부름 목록 조회
// eslint-disable-next-line sonarjs/cognitive-complexity -- 목록 조회 필터링/정렬 로직으로 인한 예외 처리
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const params = parseErrandListParams(searchParams);

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
      .range(params.offset, params.offset + params.limit - 1);

    // 모드별 필터링
    if (params.mode === 'my' && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        query = query.eq('requester_id', profile.id);
      }
    } else if (params.mode === 'available') {
      query = query.eq('status', 'OPEN');
    }

    // 상태 필터
    if (params.status) {
      query = query.eq('status', params.status);
    }

    // 카테고리 필터
    if (params.category) {
      query = query.eq('category', params.category);
    }

    const { data: errands, error, count } = await query;

    if (error) {
      logServerError(error, { context: 'errands_list' });
      return NextResponse.json({ error: '심부름 목록을 불러올 수 없습니다' }, { status: 500 });
    }

    let processedErrands = (errands || []) as Record<string, unknown>[];

    // mode=my인 경우 각 심부름의 지원자 수 조회 (OPEN 상태만)
    if (params.mode === 'my' && processedErrands.length > 0) {
      const openErrandIds = processedErrands
        .filter((e) => e.status === 'OPEN')
        .map((e) => e.id as string);

      if (openErrandIds.length > 0) {
        const { data: applicationCounts } = await supabase
          .from('errand_applications')
          .select('errand_id')
          .in('errand_id', openErrandIds)
          .eq('status', 'pending');

        const countMap: Record<string, number> = {};
        applicationCounts?.forEach((app) => {
          countMap[app.errand_id] = (countMap[app.errand_id] || 0) + 1;
        });

        processedErrands = processedErrands.map((errand) => ({
          ...errand,
          application_count: errand.status === 'OPEN' ? countMap[errand.id as string] || 0 : 0,
        }));
      }
    }

    // 라이더 위치가 제공된 경우 거리 계산 및 정렬
    if (params.helperLat && params.helperLng && params.mode === 'available') {
      processedErrands = addDistanceToErrands(processedErrands, params.helperLat, params.helperLng);
      processedErrands = filterAndSortByDistance(
        processedErrands,
        params.maxDistance,
        params.sortBy
      );
    }

    return NextResponse.json({
      errands: processedErrands,
      total: count,
      limit: params.limit,
      offset: params.offset,
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
    // 사용자 인증 확인
    const authResult = await requireLogin();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!supabase) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

// 새 심부름 알림 발송 (구독 라이더 전체에게)
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
  // 구독 상태가 active 또는 trial인 라이더 전체에게 알림 (is_active 무관)
  // is_active는 위치 추적/활동 상태 표시용으로만 사용
  const { data: subscribedHelpers, error: helpersError } = await supabase
    .from('helper_profiles')
    .select('user_id')
    .in('subscription_status', ['active', 'trial'])
    .limit(100);

  if (helpersError) {
    logServerError(helpersError, {
      context: 'errand_notification_helpers_lookup',
      errand_id: errand.id,
    });
    return;
  }

  if (!subscribedHelpers?.length) {
    return;
  }

  const categoryLabel = errand.category === 'DELIVERY' ? '배달' : '구매대행';
  const notifications = subscribedHelpers.map((helper) => ({
    user_id: helper.user_id,
    type: 'new_errand',
    title: '새로운 심부름이 등록되었습니다!',
    message: `[${categoryLabel}] ${errand.title} - ${errand.total_price?.toLocaleString()}원`,
    link: `/errands/${errand.id}`,
    is_read: false,
  }));

  // Service Role Client 사용하여 RLS 우회
  const serviceClient = createServiceRoleClient();
  const { error: notifyError } = await serviceClient.from('notifications').insert(notifications);

  if (notifyError) {
    logServerError(notifyError, { context: 'errand_notification_insert', errand_id: errand.id });
    throw notifyError;
  }
}
