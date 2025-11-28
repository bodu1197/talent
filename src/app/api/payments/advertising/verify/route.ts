import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { payment_id, amount, bonus } = body;

    // 입력 검증
    if (!payment_id || !amount) {
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
      // 크레딧은 이미 추가되었으므로 에러 반환하지 않음
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
