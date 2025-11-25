import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { notifyPaymentReceived } from '@/lib/notifications';
import { logger } from '@/lib/logger';

// Rate Limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || userLimit.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
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

    // Rate Limiting
    if (!checkRateLimit(user.id, 5)) {
      return NextResponse.json(
        { error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
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

    // TODO: 실제 환경에서는 PortOne API를 통해 결제 정보를 검증해야 합니다
    // const portOneResponse = await fetch(`https://api.portone.io/payments/${payment_id}`, {
    //   headers: {
    //     'Authorization': `PortOne ${process.env.PORTONE_API_SECRET}`
    //   }
    // })
    // const paymentData = await portOneResponse.json()
    // if (paymentData.amount !== order.amount) {
    //   throw new Error('결제 금액이 일치하지 않습니다')
    // }

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

    // 판매자에게 결제 완료 알림 전송
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
