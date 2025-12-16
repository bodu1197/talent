import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';
import type { SupabaseClient } from '@supabase/supabase-js';

// PortOne V2 API 결제 정보 조회
async function getPortOnePayment(paymentId: string) {
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    throw new Error('PortOne API Secret이 설정되지 않았습니다');
  }

  const response = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: {
      Authorization: `PortOne ${apiSecret}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('PortOne API error:', { status: response.status, error: errorText });
    throw new Error(`PortOne API 호출 실패: ${response.status}`);
  }

  return response.json();
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const body = await request.json();
    const { payment_id, advertising_payment_id, amount, bonus } = body;

    // 입력 검증
    if (!payment_id) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
    }

    // PortOne API로 실제 결제 검증
    let portOnePayment;
    try {
      portOnePayment = await getPortOnePayment(payment_id);
    } catch (error) {
      logger.error('PortOne verification failed:', error);
      return NextResponse.json({ error: '결제 검증 실패: PortOne API 오류' }, { status: 500 });
    }

    // 결제 상태 확인
    if (portOnePayment.status !== 'PAID') {
      return NextResponse.json(
        { error: `결제가 완료되지 않았습니다. 상태: ${portOnePayment.status}` },
        { status: 400 }
      );
    }

    // 구독형 광고 결제 처리 (advertising_payment_id가 있는 경우)
    if (advertising_payment_id) {
      return handleSubscriptionPayment(supabase, user.id, advertising_payment_id, portOnePayment);
    }

    // 크레딧 충전 처리 (기존 로직)
    if (!amount) {
      return NextResponse.json({ error: '결제 금액이 누락되었습니다' }, { status: 400 });
    }

    // 결제 금액 검증
    if (portOnePayment.amount?.total !== amount) {
      logger.error('Amount mismatch:', {
        expected: amount,
        actual: portOnePayment.amount?.total,
      });
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 });
    }

    // 크레딧 조회 또는 생성
    const { data: existingCredit } = await supabase
      .from('advertising_credits')
      .select('*')
      .eq('seller_id', user.id)
      .single();

    if (existingCredit) {
      // 기존 크레딧에 추가
      const { error: updateError } = await supabase
        .from('advertising_credits')
        .update({
          amount: existingCredit.amount + amount + (bonus || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('seller_id', user.id);

      if (updateError) {
        logger.error('Credit update error:', updateError);
        return NextResponse.json({ error: '크레딧 업데이트 실패' }, { status: 500 });
      }
    } else {
      // 새 크레딧 레코드 생성
      const { error: insertError } = await supabase.from('advertising_credits').insert({
        seller_id: user.id,
        amount: amount + (bonus || 0),
        used_amount: 0,
      });

      if (insertError) {
        logger.error('Credit insert error:', insertError);
        return NextResponse.json({ error: '크레딧 생성 실패' }, { status: 500 });
      }
    }

    // 결제 내역 기록
    const { error: paymentError } = await supabase.from('advertising_payments').insert({
      seller_id: user.id,
      amount: amount,
      bonus_amount: bonus || 0,
      payment_method: 'card',
      pg_transaction_id: payment_id,
      status: 'completed',
      paid_at: new Date().toISOString(),
    });

    if (paymentError) {
      logger.error('Payment record error:', paymentError);
    }

    return NextResponse.json({
      success: true,
      total_credited: amount + (bonus || 0),
    });
  } catch (error) {
    logger.error('Advertising payment verify error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 구독형 광고 결제 처리
async function handleSubscriptionPayment(
  supabase: SupabaseClient,
  userId: string,
  advertisingPaymentId: string,
  portOnePayment: { amount?: { total: number }; pgTxId?: string }
) {
  // 광고 결제 정보 조회
  const { data: adPayment, error: fetchError } = await supabase
    .from('advertising_payments')
    .select('*')
    .eq('id', advertisingPaymentId)
    .single();

  if (fetchError || !adPayment) {
    logger.error('Advertising payment not found:', fetchError);
    return NextResponse.json({ error: '결제 정보를 찾을 수 없습니다' }, { status: 404 });
  }

  // 전문가 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!seller || seller.id !== adPayment.seller_id) {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  // 금액 확인
  if (portOnePayment.amount?.total !== adPayment.amount) {
    logger.error('Amount mismatch', {
      expected: adPayment.amount,
      received: portOnePayment.amount?.total,
    });
    return NextResponse.json({ error: '결제 금액 불일치' }, { status: 400 });
  }

  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(
    now.getTime() + adPayment.months * 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // 결제 상태 업데이트
  const { error: updateError } = await supabase
    .from('advertising_payments')
    .update({
      status: 'completed',
      paid_at: now.toISOString(),
      pg_tx_id: portOnePayment.pgTxId,
      updated_at: now.toISOString(),
    })
    .eq('id', advertisingPaymentId);

  if (updateError) {
    logger.error('Payment update error:', updateError);
    return NextResponse.json({ error: '결제 상태 업데이트 실패' }, { status: 500 });
  }

  // 광고 구독 생성
  const { error: subscriptionError } = await supabase.from('advertising_subscriptions').insert({
    seller_id: adPayment.seller_id,
    service_id: adPayment.service_id,
    payment_id: advertisingPaymentId,
    status: 'active',
    start_date: startDate,
    end_date: endDate,
    months: adPayment.months,
    monthly_price: adPayment.monthly_price,
    total_amount: adPayment.amount,
  });

  if (subscriptionError) {
    logger.error('Subscription creation error:', subscriptionError);
  }

  logger.info('Advertising subscription payment verified', {
    advertising_payment_id: advertisingPaymentId,
    amount: adPayment.amount,
    months: adPayment.months,
  });

  return NextResponse.json({ success: true });
}
