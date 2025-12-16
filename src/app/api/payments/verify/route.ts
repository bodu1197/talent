import { NextRequest, NextResponse } from 'next/server';
import type { Tables } from '@/types/database';
import { notifyPaymentReceived } from '@/lib/notifications';
import { paymentVerifyRateLimit } from '@/lib/rate-limit';
import { createPaymentWithIdempotency } from '@/lib/transaction';
import { logger } from '@/lib/logger';
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
    const { payment_id, order_id, payment_request_id } = body;

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

    // Type assertion for order
    const typedOrder = order as Tables<'orders'>;

    // 구매자 확인
    if (typedOrder.buyer_id !== user.id) {
      return NextResponse.json({ error: '구매자만 결제 검증을 할 수 있습니다' }, { status: 403 });
    }

    // 이미 결제된 주문인지 확인
    if (typedOrder.status === 'paid' || typedOrder.status === 'in_progress') {
      return NextResponse.json({ error: '이미 결제된 주문입니다' }, { status: 400 });
    }

    // [Production] 실제 환경에서는 PortOne API를 통해 결제 정보를 검증해야 합니다
    // const portOneResponse = await fetch(`https://api.portone.io/payments/${payment_id}`, {
    //   headers: {
    //     'Authorization': `PortOne ${process.env.PORTONE_API_SECRET}`
    //   }
    // })
    // const paymentData = await portOneResponse.json()
    // if (paymentData.amount !== order.amount) {
    //   throw new Error('결제 금액이 일치하지 않습니다')
    // }

    // 결제 기록 생성 (Idempotency 보장 - 중복 결제 방지)
    const {
      data: payment,
      error: paymentError,
      isExisting,
    } = await createPaymentWithIdempotency(supabase, {
      order_id: typedOrder.id,
      amount: typedOrder.total_amount,
      payment_method: 'card', // PortOne에서 받은 정보로 설정
      payment_id: payment_id,
      status: 'completed',
      paid_at: new Date().toISOString(),
    });

    if (paymentError) {
      // Using logger instead of console.error
      return NextResponse.json({ error: '결제 기록 생성 실패' }, { status: 500 });
    }

    // Type assertion for payment
    if (!payment) {
      return NextResponse.json({ error: '결제 기록 생성 실패' }, { status: 500 });
    }

    const typedPayment = payment;

    // 이미 존재하는 결제인 경우 (동시 요청으로 인한 중복)
    if (isExisting) {
      // Idempotent payment - returning existing result
      return NextResponse.json({
        success: true,
        order: {
          id: typedOrder.id,
          status: typedOrder.status,
          payment_id: typedPayment.id,
        },
      });
    }

    // 주문 상태 업데이트
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status: 'in_progress',
        payment_status: 'completed',
        paid_at: new Date().toISOString(),
      })
      .eq('id', typedOrder.id);

    if (updateOrderError) {
      logger.error('Order update error:', updateOrderError);
      return NextResponse.json({ error: '주문 상태 업데이트 실패' }, { status: 500 });
    }

    // 결제 요청 상태 업데이트
    if (payment_request_id) {
      await supabase
        .from('payment_requests')
        .update({
          status: 'paid',
          order_id: typedOrder.id,
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment_request_id);
    }

    // 전문가에게 결제 완료 알림 전송 (실패해도 결제는 성공으로 처리)
    try {
      await notifyPaymentReceived(typedOrder.seller_id, typedOrder.id, typedOrder.total_amount);
    } catch (notificationError) {
      // 알림 전송 실패는 로그만 남기고 계속 진행
      logger.error('Payment notification failed (non-critical):', notificationError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: typedOrder.id,
        status: 'in_progress',
        payment_id: typedPayment.id,
      },
    });
  } catch (error) {
    logger.error('Payment verify error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
