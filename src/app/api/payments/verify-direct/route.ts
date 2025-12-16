import { NextRequest, NextResponse } from 'next/server';
import { notifyPaymentReceived } from '@/lib/notifications';
import { logger } from '@/lib/logger';
import { paymentVerifyRateLimit } from '@/lib/rate-limit';
import { requireAuthWithRateLimit } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 및 Rate Limiting 확인 (검증은 더 엄격하게: 분당 5회)
    const authResult = await requireAuthWithRateLimit(paymentVerifyRateLimit);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const body = await request.json();
    const { payment_id, order_id } = body;

    // 입력 검증
    if (!payment_id || !order_id) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
    }

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(order_id)) {
      return NextResponse.json({ error: '유효하지 않은 주문 ID입니다' }, { status: 400 });
    }

    // 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
    }

    // 구매자 확인
    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: '구매자만 결제 검증을 할 수 있습니다' }, { status: 403 });
    }

    // 이미 결제된 주문인지 확인
    if (order.status === 'paid' || order.status === 'in_progress') {
      return NextResponse.json({ error: '이미 결제된 주문입니다' }, { status: 400 });
    }

    // PortOne API를 통해 결제 정보 검증
    const apiSecret = process.env.PORTONE_API_SECRET;
    if (!apiSecret) {
      logger.error('PORTONE_API_SECRET is not configured');
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
    }

    const portOneResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(payment_id)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `PortOne ${apiSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!portOneResponse.ok) {
      logger.error('PortOne API error:', await portOneResponse.text());
      return NextResponse.json({ error: '결제 정보 조회 실패' }, { status: 400 });
    }

    const paymentData = await portOneResponse.json();

    // 결제 상태 확인
    if (paymentData.status !== 'PAID') {
      logger.error('Payment not paid:', paymentData.status);
      return NextResponse.json({ error: '결제가 완료되지 않았습니다' }, { status: 400 });
    }

    // 결제 금액 확인
    if (paymentData.amount?.total !== order.amount) {
      logger.error('Amount mismatch:', paymentData.amount?.total, order.amount);
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 });
    }

    // 결제 기록 생성
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        amount: order.amount,
        payment_method: 'card',
        payment_id: payment_id,
        status: 'completed',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      logger.error('Payment record error:', paymentError);
      return NextResponse.json({ error: '결제 기록 생성 실패' }, { status: 500 });
    }

    // 주문 상태 업데이트
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status: 'in_progress',
        payment_id: payment.id,
        paid_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateOrderError) {
      logger.error('Order update error:', updateOrderError);
      return NextResponse.json({ error: '주문 상태 업데이트 실패' }, { status: 500 });
    }

    // 정산 대기 기록 생성 (플랫폼 에스크로)
    // PG 수수료 약 3.3% (이니시스 기준, VAT 포함)
    const pgFeeRate = 0.033;
    const pgFee = Math.round(order.amount * pgFeeRate);
    const platformFee = 0; // 돌파구는 수수료 없음
    const netAmount = order.amount - pgFee - platformFee;

    const { error: settlementError } = await supabase.from('order_settlements').insert({
      order_id: order.id,
      seller_id: order.seller_id,
      order_amount: order.amount,
      pg_fee: pgFee,
      platform_fee: platformFee,
      net_amount: netAmount,
      status: 'pending', // 구매확정 대기
    });

    if (settlementError) {
      // 정산 기록 실패해도 결제는 성공으로 처리 (로그만 남김)
      logger.error('Settlement record error:', settlementError);
    }

    // 전문가에게 결제 완료 알림 전송
    await notifyPaymentReceived(order.seller_id, order.id, order.amount);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: 'in_progress',
        payment_id: payment.id,
      },
    });
  } catch (error) {
    logger.error('Payment verify error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
