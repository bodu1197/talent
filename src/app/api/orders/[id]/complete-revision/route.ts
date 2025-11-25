import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// PATCH /api/orders/[id]/complete-revision - 수정 완료
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // 주문 조회 및 권한 확인
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
    }

    // 판매자만 수정 완료 가능
    if (order.seller_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // 주문 상태가 'revision'인지 확인
    if (order.status !== 'revision') {
      return NextResponse.json({ error: '수정 요청 상태가 아닙니다' }, { status: 400 });
    }

    // 트랜잭션으로 처리: orders 업데이트 + revision_history 완료 처리
    // 1. 상태를 'delivered'로 변경
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Complete revision error:', updateError);
      return NextResponse.json({ error: '수정 완료 처리에 실패했습니다' }, { status: 500 });
    }

    // 2. revision_history에서 가장 최근의 미완료 수정 요청을 완료 처리
    const { error: historyError } = await supabase
      .from('revision_history')
      .update({
        completed_at: new Date().toISOString(),
        completed_by: user.id,
      })
      .eq('order_id', id)
      .is('completed_at', null)
      .order('requested_at', { ascending: false })
      .limit(1);

    if (historyError) {
      logger.error('Revision history update error:', historyError);
      // 이력 업데이트 실패해도 메인 기능은 동작하도록 경고만 출력
      logger.warn('수정 완료 이력 저장에 실패했지만 주문 상태는 변경되었습니다');
    }

    // [Future Enhancement] 구매자에게 알림 전송 기능 추가 필요

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Complete revision API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
