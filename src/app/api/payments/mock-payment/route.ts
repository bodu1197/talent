import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';
import { verifyOrderBuyer } from '@/lib/api/ownership';

// 테스트용 Mock 결제 API
// 실제 결제 없이 주문 상태를 paid로 변경

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult.error;

    const { supabase, user } = authResult;
    if (!supabase || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다' }, { status: 400 });
    }

    // 주문 조회 및 구매자 권한 확인
    const orderResult = await verifyOrderBuyer(supabase, order_id, user.id);
    if (!orderResult.success) {
      return orderResult.error!;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = orderResult.data!.order as any;

    // 이미 결제된 주문인지 확인
    if (order.status !== 'pending_payment') {
      return NextResponse.json({ error: '이미 처리된 주문입니다' }, { status: 400 });
    }

    // 주문 상태를 paid로 변경 (테스트용)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      logger.error('Order update error:', updateError);
      return NextResponse.json({ error: '주문 업데이트 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Mock 결제 완료 (테스트 모드)',
    });
  } catch (error) {
    logger.error('Mock payment error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
