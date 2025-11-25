import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// PATCH: 결제 요청 수락/거부
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { action, buyer_response } = body;

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: '유효하지 않은 액션입니다' }, { status: 400 });
    }

    // 결제 요청 조회
    const { data: paymentRequest, error: fetchError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !paymentRequest) {
      return NextResponse.json({ error: '결제 요청을 찾을 수 없습니다' }, { status: 404 });
    }

    // 구매자인지 확인
    if (paymentRequest.buyer_id !== user.id) {
      return NextResponse.json({ error: '구매자만 응답할 수 있습니다' }, { status: 403 });
    }

    // 이미 응답했는지 확인
    if (paymentRequest.status !== 'pending') {
      return NextResponse.json({ error: '이미 처리된 요청입니다' }, { status: 400 });
    }

    // 만료 확인
    if (new Date(paymentRequest.expires_at) < new Date()) {
      // 만료 상태로 업데이트
      await supabase.from('payment_requests').update({ status: 'expired' }).eq('id', id);

      return NextResponse.json({ error: '만료된 요청입니다' }, { status: 400 });
    }

    // 상태 업데이트
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { data: updatedRequest, error: updateError } = await supabase
      .from('payment_requests')
      .update({
        status: newStatus,
        buyer_response: buyer_response || null,
        responded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Update payment request error:', updateError);
      return NextResponse.json({ error: '요청 처리에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      payment_request: updatedRequest,
      message: action === 'accept' ? '결제 요청을 수락했습니다' : '결제 요청을 거부했습니다',
    });
  } catch (error) {
    logger.error('Payment request response error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
