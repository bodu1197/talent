import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// 웹훅은 서버에서 직접 호출되므로 service role key 사용
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PortOne V2 API로 결제 정보 조회
async function getPaymentInfo(paymentId: string) {
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    throw new Error('PortOne API Secret이 설정되지 않았습니다');
  }

  const response = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: {
      Authorization: `PortOne ${apiSecret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('PortOne Payment API error:', {
      status: response.status,
      error: errorText,
    });
    throw new Error(`PortOne API 호출 실패: ${response.status}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info('PortOne Payment Webhook received:', body);

    const { type, data } = body;

    // 결제 관련 이벤트만 처리
    if (!type?.startsWith('Transaction.')) {
      return NextResponse.json({ success: true, message: 'Ignored event type' });
    }

    const paymentId = data?.paymentId;
    if (!paymentId) {
      logger.warn('Webhook missing paymentId:', body);
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    // PortOne API로 실제 결제 정보 조회 (위변조 방지)
    let payment;
    try {
      payment = await getPaymentInfo(paymentId);
    } catch (error) {
      logger.error('Failed to fetch payment info:', error);
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }

    logger.info('Payment info from PortOne:', {
      paymentId,
      status: payment.status,
      amount: payment.amount?.total,
    });

    // 결제 상태에 따른 처리
    switch (payment.status) {
      case 'PAID':
        // 결제 완료 처리
        await handlePaymentPaid(paymentId, payment);
        break;

      case 'CANCELLED':
      case 'PARTIAL_CANCELLED':
        // 결제 취소 처리
        await handlePaymentCancelled(paymentId, payment);
        break;

      case 'FAILED':
        // 결제 실패 처리
        await handlePaymentFailed(paymentId, payment);
        break;

      case 'VIRTUAL_ACCOUNT_ISSUED':
        // 가상계좌 발급 (입금 대기)
        await handleVirtualAccountIssued(paymentId, payment);
        break;

      default:
        logger.info(`Unhandled payment status: ${payment.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// 결제 완료 처리
async function handlePaymentPaid(paymentId: string, payment: Record<string, unknown>) {
  const merchantUid = paymentId;
  const amount = (payment.amount as Record<string, unknown>)?.total;

  // orders 테이블에서 해당 주문 찾기
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('merchant_uid', merchantUid)
    .single();

  if (orderError || !order) {
    // payment_requests에서 찾기 (채팅 결제)
    const { data: paymentRequest } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', merchantUid.replace('payment_', ''))
      .single();

    if (paymentRequest) {
      // 채팅 결제 완료 처리
      await supabase
        .from('payment_requests')
        .update({ status: 'paid' })
        .eq('id', paymentRequest.id);

      logger.info('Payment request marked as paid:', { id: paymentRequest.id });
    }
    return;
  }

  // 금액 검증
  if (order.total_amount !== amount) {
    logger.error('Payment amount mismatch:', {
      orderId: order.id,
      expected: order.total_amount,
      actual: amount,
    });
    return;
  }

  // 주문 상태 업데이트
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_id: paymentId,
    })
    .eq('id', order.id);

  if (updateError) {
    logger.error('Failed to update order status:', updateError);
    return;
  }

  logger.info('Order marked as paid via webhook:', {
    orderId: order.id,
    paymentId,
    amount,
  });
}

// 결제 취소 처리
async function handlePaymentCancelled(paymentId: string, _payment: Record<string, unknown>) {
  const merchantUid = paymentId;

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('merchant_uid', merchantUid);

  if (error) {
    logger.error('Failed to update cancelled order:', error);
    return;
  }

  logger.info('Order marked as cancelled via webhook:', { paymentId });
}

// 결제 실패 처리
async function handlePaymentFailed(paymentId: string, payment: Record<string, unknown>) {
  const merchantUid = paymentId;
  const failReason = (payment as Record<string, unknown>).failReason || 'Unknown';

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'failed',
      fail_reason: failReason as string,
    })
    .eq('merchant_uid', merchantUid);

  if (error) {
    logger.error('Failed to update failed order:', error);
    return;
  }

  logger.info('Order marked as failed via webhook:', { paymentId, failReason });
}

// 가상계좌 발급 처리
async function handleVirtualAccountIssued(paymentId: string, payment: Record<string, unknown>) {
  const merchantUid = paymentId;
  const virtualAccount = payment.virtualAccount as Record<string, unknown> | undefined;

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'pending_payment',
      virtual_account_info: virtualAccount ? JSON.stringify(virtualAccount) : null,
    })
    .eq('merchant_uid', merchantUid);

  if (error) {
    logger.error('Failed to update virtual account order:', error);
    return;
  }

  logger.info('Virtual account issued via webhook:', { paymentId, virtualAccount });
}

// GET 요청 처리 (웹훅 URL 확인용)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'PortOne Payment Webhook Endpoint',
    timestamp: new Date().toISOString(),
  });
}
