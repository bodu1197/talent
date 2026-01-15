import { NextRequest, NextResponse } from 'next/server';
import { orderStatusRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { notifyOrderConfirmed } from '@/lib/notifications';
import { requireAuthWithRateLimit } from '@/lib/api/auth';
import { verifyOrderBuyer } from '@/lib/api/ownership';

// 구매확정 가능한 상태들
const CONFIRMABLE_STATUSES = new Set([
  'in_progress',
  'delivered',
  'revision_requested',
  'revision_completed',
]);

// POST /api/orders/[id]/confirm - 구매확정 (플랫폼 에스크로 - 정산 승인)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 사용자 인증 및 Rate Limiting 확인
    const authResult = await requireAuthWithRateLimit(orderStatusRateLimit);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // 주문 조회 및 구매자 권한 확인
    const orderResult = await verifyOrderBuyer(supabase, id, user.id);
    if (!orderResult.success) {
      return orderResult.error!;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = orderResult.data!.order as any;

    // 구매확정 가능한 상태인지 확인
    if (!CONFIRMABLE_STATUSES.has(order.status)) {
      return NextResponse.json(
        {
          error: `현재 상태(${order.status})에서는 구매확정을 할 수 없습니다`,
          current_status: order.status,
        },
        { status: 400 }
      );
    }

    // 이미 완료된 주문인지 확인
    if (order.status === 'completed') {
      return NextResponse.json({ error: '이미 구매확정된 주문입니다' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // 주문 상태 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        completed_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Order completion error:', updateError);
      return NextResponse.json({ error: '주문 완료 처리에 실패했습니다' }, { status: 500 });
    }

    // 정산 상태 업데이트 (pending → confirmed)
    // 구매확정 되면 판매자에게 정산 대기 상태가 됨
    const { error: settlementError } = await supabase
      .from('order_settlements')
      .update({
        status: 'confirmed',
        confirmed_at: now,
      })
      .eq('order_id', id)
      .eq('status', 'pending');

    if (settlementError) {
      // 정산 업데이트 실패해도 구매확정은 성공으로 처리
      logger.error('Settlement update error:', settlementError);
    }

    // 전문가에게 구매확정 알림 전송
    await notifyOrderConfirmed(order.seller_id, order.id, order.amount);

    return NextResponse.json({
      success: true,
      message: '구매확정이 완료되었습니다. 정산이 예정되어 있습니다.',
    });
  } catch (error) {
    logger.error('Order confirm API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
