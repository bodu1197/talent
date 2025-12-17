import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';
import { verifyOrderBuyer } from '@/lib/api/ownership';

// 무통장 입금 요청 API
// 주문 상태를 pending_bank_transfer로 변경

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult.error;

    const { supabase, user } = authResult;
    if (!supabase || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, cash_receipt } = body;

    if (!order_id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다' }, { status: 400 });
    }

    // 현금영수증 정보 검증
    if (cash_receipt) {
      const { type, value } = cash_receipt;
      if (!type || !['personal', 'business'].includes(type)) {
        return NextResponse.json({ error: '잘못된 현금영수증 유형입니다' }, { status: 400 });
      }
      if (!value) {
        return NextResponse.json({ error: '현금영수증 발행 정보가 필요합니다' }, { status: 400 });
      }
    }

    // 주문 조회 및 구매자 권한 확인
    const orderResult = await verifyOrderBuyer(supabase, order_id, user.id);
    if (!orderResult.success) {
      return orderResult.error!;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = orderResult.data!.order as any;

    // 이미 처리된 주문인지 확인
    if (order.status !== 'pending_payment') {
      return NextResponse.json({ error: '이미 처리된 주문입니다' }, { status: 400 });
    }

    // 업데이트 데이터 준비
    const updateData: Record<string, unknown> = {
      status: 'pending_bank_transfer',
      payment_status: 'pending',
    };

    // 현금영수증 정보가 있으면 메타데이터에 저장
    if (cash_receipt) {
      // 기존 메타데이터와 병합
      const existingMetadata = order.metadata || {};
      updateData.metadata = {
        ...existingMetadata,
        cash_receipt: {
          type: cash_receipt.type, // 'personal' 또는 'business'
          value: cash_receipt.value, // 휴대폰번호 또는 사업자등록번호
          requested_at: new Date().toISOString(),
        },
      };

      logger.info('Cash receipt requested:', {
        orderId: order_id,
        type: cash_receipt.type,
        valueMasked: cash_receipt.value.substring(0, 4) + '****',
      });
    }

    // 주문 상태를 pending_bank_transfer로 변경
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id);

    if (updateError) {
      logger.error('Order update error:', updateError);
      return NextResponse.json({ error: '주문 업데이트 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '입금 대기 상태로 변경되었습니다',
    });
  } catch (error) {
    logger.error('Bank transfer request error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
