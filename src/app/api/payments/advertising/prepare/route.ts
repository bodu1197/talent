import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult.error;

    const { supabase, user } = authResult;
    if (!supabase || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { service_id, months, monthly_price } = body;

    // 입력 검증
    if (!service_id || !months || !monthly_price) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
    }

    // 전문가 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!seller) {
      return NextResponse.json({ error: '전문가 정보를 찾을 수 없습니다' }, { status: 400 });
    }

    // 서비스 확인 및 소유권 검증
    const { data: service } = await supabase
      .from('services')
      .select('id, title, seller_id')
      .eq('id', service_id)
      .single();

    if (!service) {
      return NextResponse.json({ error: '서비스를 찾을 수 없습니다' }, { status: 404 });
    }

    if (service.seller_id !== seller.id) {
      return NextResponse.json({ error: '본인 서비스만 광고할 수 있습니다' }, { status: 403 });
    }

    // 이미 활성 광고가 있는지 확인
    const { data: existingAd } = await supabase
      .from('advertising_subscriptions')
      .select('id')
      .eq('service_id', service_id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingAd) {
      return NextResponse.json({ error: '이미 광고가 진행 중인 서비스입니다' }, { status: 400 });
    }

    // 금액 계산
    const totalSupplyPrice = monthly_price * months;
    const vatAmount = Math.round(totalSupplyPrice * 0.1);
    const totalAmount = totalSupplyPrice + vatAmount;

    // 광고 주문 ID 생성
    const orderId = crypto.randomUUID();
    const merchantUid = `AD_${Date.now()}_${orderId.slice(0, 8)}`;

    // 광고 결제 대기 레코드 생성
    const { error: insertError } = await supabase.from('advertising_payments').insert({
      id: orderId,
      seller_id: seller.id,
      service_id: service_id,
      amount: totalAmount,
      supply_amount: totalSupplyPrice,
      vat_amount: vatAmount,
      months: months,
      monthly_price: monthly_price,
      merchant_uid: merchantUid,
      payment_method: 'card',
      status: 'pending',
    });

    if (insertError) {
      logger.error('Advertising payment insert error:', insertError);
      return NextResponse.json({ error: '결제 준비 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      merchant_uid: merchantUid,
      amount: totalAmount,
      service_title: service.title,
    });
  } catch (error) {
    logger.error('Advertising payment prepare error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
