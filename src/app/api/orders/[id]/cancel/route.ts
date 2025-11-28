import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { orderStatusRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// 취소 가능한 상태들
const CANCELLABLE_STATUSES = ['pending_payment', 'paid', 'in_progress'];

// POST /api/orders/[id]/cancel - 주문 취소 요청
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
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

    // 주문 조회 및 권한 확인
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
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

    // 주문 취소 처리
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancel_reason: cancel_reason.trim(),
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Order cancellation error:', updateError);
      return NextResponse.json({ error: '주문 취소에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '주문이 취소되었습니다',
    });
  } catch (error) {
    logger.error('Order cancel API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
