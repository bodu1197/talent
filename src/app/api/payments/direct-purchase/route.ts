import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrderWithIdempotency } from '@/lib/transaction';
import { randomBytes } from 'node:crypto';
import { logger } from '@/lib/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

// 입력 유효성 검사
function validateInput(body: Record<string, unknown>): NextResponse | null {
  const { seller_id, service_id, title, amount, package_type } = body;

  if (!seller_id || !service_id || !title || !amount) {
    return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
  }

  if (package_type && !['standard', 'deluxe', 'premium'].includes(package_type as string)) {
    return NextResponse.json({ error: '유효하지 않은 패키지 타입입니다' }, { status: 400 });
  }

  if (typeof amount !== 'number' || amount < 1000 || amount > 100000000) {
    return NextResponse.json({ error: '유효하지 않은 결제 금액입니다' }, { status: 400 });
  }

  if (typeof title !== 'string' || title.length > 200) {
    return NextResponse.json({ error: '유효하지 않은 제목입니다' }, { status: 400 });
  }

  return null;
}

// 패키지 가격 검증 결과
interface PriceValidation {
  price: number;
  deliveryDays: number;
  revisionCount: number;
  error?: NextResponse;
}

// 패키지 가격 검증
async function validatePackagePrice(
  supabase: SupabaseClient,
  serviceId: string,
  packageId: string | undefined,
  packageType: string | undefined,
  basePrice: number,
  baseDeliveryDays: number,
  baseRevisionCount: number
): Promise<PriceValidation> {
  if (!packageId || !packageType) {
    return { price: basePrice, deliveryDays: baseDeliveryDays, revisionCount: baseRevisionCount };
  }

  const { data: packageData, error: packageError } = await supabase
    .from('service_packages')
    .select('id, price, delivery_days, revision_count, is_active, package_type')
    .eq('id', packageId)
    .eq('service_id', serviceId)
    .eq('is_active', true)
    .single();

  if (packageError || !packageData) {
    return {
      price: 0,
      deliveryDays: 0,
      revisionCount: 0,
      error: NextResponse.json({ error: '패키지를 찾을 수 없습니다' }, { status: 404 }),
    };
  }

  if (packageData.package_type !== packageType) {
    return {
      price: 0,
      deliveryDays: 0,
      revisionCount: 0,
      error: NextResponse.json({ error: '패키지 타입이 일치하지 않습니다' }, { status: 400 }),
    };
  }

  return {
    price: packageData.price,
    deliveryDays: packageData.delivery_days,
    revisionCount: packageData.revision_count,
  };
}

// 채팅방 자동 생성
async function ensureChatRoom(
  supabase: SupabaseClient,
  buyerId: string,
  sellerId: string,
  serviceId: string
): Promise<void> {
  try {
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .maybeSingle();

    if (!existingRoom) {
      await supabase.from('chat_rooms').insert({
        buyer_id: buyerId,
        seller_id: sellerId,
        service_id: serviceId,
      });
    }
  } catch (chatError) {
    logger.error('Chat room creation error:', chatError);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const validationError = validateInput(body);
    if (validationError) return validationError;

    const {
      seller_id,
      service_id,
      title,
      amount,
      description,
      delivery_days,
      revision_count,
      package_type,
      package_id,
    } = body;

    // 판매자 정보 확인
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, user_id')
      .eq('id', seller_id)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json({ error: '판매자를 찾을 수 없습니다' }, { status: 404 });
    }

    if (seller.user_id === user.id) {
      return NextResponse.json({ error: '자신의 서비스는 구매할 수 없습니다' }, { status: 403 });
    }

    // 서비스 정보 확인
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, title, price, delivery_days, revision_count, has_packages')
      .eq('id', service_id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: '서비스를 찾을 수 없습니다' }, { status: 404 });
    }

    // 가격 검증
    const priceValidation = await validatePackagePrice(
      supabase,
      service_id,
      package_id,
      package_type,
      service.price,
      service.delivery_days,
      service.revision_count
    );

    if (priceValidation.error) {
      return priceValidation.error;
    }

    if (priceValidation.price !== amount) {
      return NextResponse.json({ error: '가격이 일치하지 않습니다' }, { status: 400 });
    }

    // 주문 생성
    const merchantUid = `order_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const finalDeliveryDays = delivery_days || priceValidation.deliveryDays || 7;
    const deliveryDate = new Date(Date.now() + finalDeliveryDays * 24 * 60 * 60 * 1000);

    const { data: order, error: orderError } = await createOrderWithIdempotency(
      supabase,
      {
        buyer_id: user.id,
        seller_id: seller.user_id,
        service_id: service_id,
        amount: amount,
        base_amount: amount,
        total_amount: amount,
        commission_rate: 0,
        commission_fee: 0,
        seller_amount: amount,
        title: title,
        description: description || service.title,
        delivery_days: finalDeliveryDays,
        revision_count: revision_count ?? priceValidation.revisionCount ?? 0,
        delivery_date: deliveryDate.toISOString(),
        status: 'pending_payment',
        package_type: package_type || null,
      },
      merchantUid
    );

    if (orderError) {
      logger.error('Order creation error:', {
        message: orderError.message,
        code: orderError.code,
        details: orderError.details,
        hint: orderError.hint,
      });
      return NextResponse.json({ error: '주문 생성 실패' }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: '주문 생성 실패' }, { status: 500 });
    }

    // 채팅방 생성 (비동기, 실패해도 주문 완료)
    await ensureChatRoom(supabase, user.id, seller_id, service_id);

    return NextResponse.json({
      order_id: order.id,
      merchant_uid: merchantUid,
      amount: amount,
    });
  } catch (error) {
    logger.error('Direct purchase error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
