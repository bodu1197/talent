import { NextRequest, NextResponse } from 'next/server';
import { orderStatusRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { requireAuthWithRateLimit } from '@/lib/api/auth';

// 주문 상태 전환 규칙 (보안: 임의 상태 변경 방지)
const ALLOWED_TRANSITIONS: Record<string, Record<string, string[]>> = {
  buyer: {
    delivered: ['completed', 'dispute'], // 구매 확정 또는 분쟁 제기
  },
  seller: {
    in_progress: ['delivered'], // 작업 완료
    revision: ['in_progress'], // 수정 요청 후 재작업
  },
};

/**
 * 상태 전환 가능 여부 확인
 * @param currentStatus 현재 주문 상태
 * @param newStatus 변경하려는 상태
 * @param role 사용자 역할 (buyer/seller)
 * @returns 전환 가능 여부
 */
function canTransition(
  currentStatus: string,
  newStatus: string,
  role: 'buyer' | 'seller'
): boolean {
  const roleTransitions = ALLOWED_TRANSITIONS[role];
  if (!roleTransitions) return false;

  const allowedStatuses = roleTransitions[currentStatus];
  if (!allowedStatuses) return false;

  return allowedStatuses.includes(newStatus);
}

// PATCH /api/orders/[id]/status - 주문 상태 업데이트
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { status: newStatus } = await request.json();

    // 상태 값 검증
    if (!newStatus || typeof newStatus !== 'string') {
      return NextResponse.json({ error: '상태 값이 필요합니다' }, { status: 400 });
    }

    // 허용된 상태 값인지 확인
    const validStatuses = [
      'pending_payment',
      'in_progress',
      'revision',
      'delivered',
      'completed',
      'cancelled',
      'dispute',
    ];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: '유효하지 않은 상태 값입니다' }, { status: 400 });
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

    // 역할 결정
    let role: 'buyer' | 'seller' | null = null;
    if (order.buyer_id === user.id) {
      role = 'buyer';
    } else if (order.seller_id === user.id) {
      role = 'seller';
    } else {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // 상태 전환 가능 여부 확인
    if (!canTransition(order.status, newStatus, role)) {
      return NextResponse.json(
        {
          error: `현재 상태(${order.status})에서 ${newStatus}(으)로 변경할 수 없습니다`,
          current_status: order.status,
          requested_status: newStatus,
          role: role,
        },
        { status: 400 }
      );
    }

    // 상태 업데이트
    interface OrderStatusUpdate {
      status: string;
      updated_at: string;
      delivered_at?: string;
      completed_at?: string;
      auto_confirm_at?: string;
    }

    const updateData: OrderStatusUpdate = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // 특정 상태 변경 시 추가 필드 업데이트
    if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
      // 자동 구매확정일 설정 (3일 후)
      const autoConfirmDate = new Date();
      autoConfirmDate.setDate(autoConfirmDate.getDate() + 3);
      updateData.auto_confirm_at = autoConfirmDate.toISOString();
    } else if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase.from('orders').update(updateData).eq('id', id);

    if (updateError) {
      logger.error('Order status update error:', updateError);
      return NextResponse.json({ error: '주문 상태 업데이트에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
    });
  } catch (error) {
    logger.error('Order status update API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
