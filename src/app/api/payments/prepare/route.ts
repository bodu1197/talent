import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentPrepareRateLimit, checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // Redis 기반 Rate Limiting 체크
    const rateLimitResult = await checkRateLimit(user.id, paymentPrepareRateLimit)
    if (!rateLimitResult.success) {
      return rateLimitResult.error!
    }

    const body = await request.json()
    const { payment_request_id, amount, title } = body

    // 입력 검증
    if (!payment_request_id || !amount || !title) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 })
    }

    // 금액 검증 (최소 1,000원, 최대 1억원)
    if (typeof amount !== 'number' || amount < 1000 || amount > 100000000) {
      return NextResponse.json({ error: '유효하지 않은 결제 금액입니다' }, { status: 400 })
    }

    // XSS 방지: 제목 길이 제한
    if (typeof title !== 'string' || title.length > 200) {
      return NextResponse.json({ error: '유효하지 않은 제목입니다' }, { status: 400 })
    }

    // 결제 요청 확인
    const { data: paymentRequest, error: prError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', payment_request_id)
      .single()

    if (prError || !paymentRequest) {
      return NextResponse.json({ error: '결제 요청을 찾을 수 없습니다' }, { status: 404 })
    }

    // 구매자 확인
    if (paymentRequest.buyer_id !== user.id) {
      return NextResponse.json({ error: '구매자만 결제할 수 있습니다' }, { status: 403 })
    }

    // 수락된 상태 확인
    if (paymentRequest.status !== 'accepted') {
      return NextResponse.json({ error: '수락된 결제 요청만 결제할 수 있습니다' }, { status: 400 })
    }

    // 금액 확인
    if (paymentRequest.amount !== amount) {
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 })
    }

    // 주문 생성
    const merchantUid = `order_${Date.now()}_${require('crypto').randomBytes(4).toString('hex')}`

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: paymentRequest.buyer_id,
        seller_id: paymentRequest.seller_id,
        service_id: paymentRequest.service_id,
        amount: paymentRequest.amount,
        title: paymentRequest.title,
        description: paymentRequest.description,
        delivery_days: paymentRequest.delivery_days,
        revision_count: paymentRequest.revision_count,
        status: 'pending_payment',
        merchant_uid: merchantUid,
        payment_request_id: paymentRequest.id
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: '주문 생성 실패' }, { status: 500 })
    }

    return NextResponse.json({
      order_id: order.id,
      merchant_uid: merchantUid,
      amount: paymentRequest.amount
    })
  } catch (error) {
    console.error('Payment prepare error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
