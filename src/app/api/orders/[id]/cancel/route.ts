import { NextRequest, NextResponse } from 'next/server';
import { orderStatusRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { notifyOrderCancelled } from '@/lib/notifications';
import { requireAuth } from '@/lib/api/auth';

// 취소 가능한 상태들
const CANCELLABLE_STATUSES = ['pending_payment', 'paid', 'in_progress'];

// PortOne 결제 취소 (환불) 처리
async function cancelPaymentOnPortOne(
  paymentId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    logger.error('PORTONE_API_SECRET is not configured');
    return { success: false, error: '서버 설정 오류' };
  }

  try {
    const response = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `PortOne ${apiSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('PortOne cancel error:', errorData);
      return { success: false, error: errorData.message || '결제 취소 실패' };
    }

    return { success: true };
  } catch (error) {
    logger.error('PortOne cancel request error:', error);
    return { success: false, error: '결제 취소 요청 실패' };
  }
}

// POST /api/orders/[id]/cancel - 주문 취소 요청
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 사용자 인증 확인
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Redis 기반 Rate Limiting 체크
    const rateLimitResult = await checkRateLimit(user.id, orderStatusRateLimit);
    if (!rateLimitResult.success) {
      return rateLimitResult.error!;
    }

    const { cancel_reason } = await request.json();

    // 취소 사유 검증
    if (!cancel_reason || typeof cancel_reason !== 'string' || cancel_reason.trim().length === 0) {
      return NextResponse.json({ error: '취소 사유를 입력해주세요' }, { status: 400 });
    }

    // 주문 조회 및 결제 정보 함께 조회
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, payments(*)')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
    }

    // 구매자 권한 확인
    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // 취소 가능한 상태인지 확인
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        {
          error: `현재 상태(${order.status})에서는 취소할 수 없습니다`,
          current_status: order.status,
        },
        { status: 400 }
      );
    }

    // 이미 취소된 주문인지 확인
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: '이미 취소된 주문입니다' }, { status: 400 });
    }

    // 결제가 완료된 주문인 경우 PortOne 환불 처리
    const payment = order.payments?.[0];
    if (payment?.payment_id && (order.status === 'paid' || order.status === 'in_progress')) {
      const cancelResult = await cancelPaymentOnPortOne(payment.payment_id, cancel_reason.trim());

      if (!cancelResult.success) {
        return NextResponse.json(
          { error: cancelResult.error || '결제 취소에 실패했습니다. 고객센터로 문의해주세요.' },
          { status: 500 }
        );
      }

      // 결제 상태 업데이트
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
        })
        .eq('id', payment.id);
    }

    const now = new Date().toISOString();

    // 주문 취소 처리
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancel_reason: cancel_reason.trim(),
        cancelled_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Order cancellation error:', updateError);
      return NextResponse.json({ error: '주문 취소에 실패했습니다' }, { status: 500 });
    }

    // 정산 상태도 취소로 업데이트
    const { error: settlementError } = await supabase
      .from('order_settlements')
      .update({
        status: 'cancelled',
        cancelled_at: now,
      })
      .eq('order_id', id)
      .eq('status', 'pending'); // pending 상태인 경우만 취소 가능

    if (settlementError) {
      logger.error('Settlement cancellation error:', settlementError);
    }

    // 전문가에게 취소 알림 전송
    await notifyOrderCancelled(order.seller_id, order.id, order.title);

    return NextResponse.json({
      success: true,
      message: payment?.payment_id
        ? '주문이 취소되고 환불이 처리되었습니다'
        : '주문이 취소되었습니다',
    });
  } catch (error) {
    logger.error('Order cancel API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
