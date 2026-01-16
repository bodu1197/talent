import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';
import { verifyOrderBuyer } from '@/lib/api/ownership';

// POST /api/orders/[id]/revision - 수정 요청
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if (!authResult.success) return authResult.error;

    const { supabase, user } = authResult;
    if (!supabase || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { reason } = await request.json();

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: '수정 요청 사유가 필요합니다' }, { status: 400 });
    }

    // 주문 조회 및 구매자 권한 확인
    const orderResult = await verifyOrderBuyer(supabase, id, user.id);
    if (!orderResult.success) {
      return orderResult.error!;
    }

    // 트랜잭션으로 처리: orders 업데이트 + revision_history 추가
    // 1. 상태를 'revision'으로 변경
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'revision',
        revision_reason: reason,
        revision_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Revision request error:', updateError);
      return NextResponse.json({ error: '수정 요청에 실패했습니다' }, { status: 500 });
    }

    // 2. revision_history에 이력 추가
    const { error: historyError } = await supabase.from('revision_history').insert({
      order_id: id,
      requested_by: user.id,
      reason: reason,
      requested_at: new Date().toISOString(),
    });

    if (historyError) {
      logger.error('Revision history insert error:', historyError);
      // 이력 추가 실패해도 메인 기능은 동작하도록 경고만 출력
      logger.warn('수정 요청 이력 저장에 실패했지만 주문 상태는 변경되었습니다');
    }

    // 알림은 DB 트리거 (notify_order_status_change)가 자동 처리
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Revision request API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
