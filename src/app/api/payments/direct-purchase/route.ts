import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import { directPurchaseRateLimit, checkRateLimit } from '@/lib/rate-limit'
import { createOrderWithIdempotency } from '@/lib/transaction'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // Redis 기반 Rate Limiting 체크
    const rateLimitResult = await checkRateLimit(user.id, directPurchaseRateLimit)
    if (!rateLimitResult.success) {
      return rateLimitResult.error!
    }

    const body = await request.json()
    const { seller_id, service_id, title, amount, description, delivery_days, revision_count } = body

    // 입력 검증
    if (!seller_id || !service_id || !title || !amount) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 })
    }

    // 금액 검증 (최소 1,000원, 최대 1억원)
    if (typeof amount !== 'number' || amount < 1000 || amount > 100000000) {
      return NextResponse.json({ error: '유효하지 않은 결제 금액입니다' }, { status: 400 })
    }

    // 제목 길이 제한
    if (typeof title !== 'string' || title.length > 200) {
      return NextResponse.json({ error: '유효하지 않은 제목입니다' }, { status: 400 })
    }

    // 판매자 정보 확인
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, user_id')
      .eq('id', seller_id)
      .single()

    if (sellerError || !seller) {
      return NextResponse.json({ error: '판매자를 찾을 수 없습니다' }, { status: 404 })
    }

    // 자신의 서비스 구매 방지
    if (seller.user_id === user.id) {
      return NextResponse.json({ error: '자신의 서비스는 구매할 수 없습니다' }, { status: 403 })
    }

    // 서비스 정보 확인 (가격 검증)
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, title, price, delivery_days, revision_count')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: '서비스를 찾을 수 없습니다' }, { status: 404 })
    }

    // 서비스 가격과 요청 금액 일치 확인 (가격 위변조 방지)
    if (service.price !== amount) {
      return NextResponse.json({ error: '서비스 가격과 일치하지 않습니다' }, { status: 400 })
    }

    // 주문 생성 (Idempotency 보장 - Race Condition 방지)
    // merchant_uid를 Idempotency Key로 사용하여 중복 주문 방지
    const merchantUid = `order_${Date.now()}_${require('crypto').randomBytes(4).toString('hex')}`

    // 납품 예정일 계산 (형식적, 실제로는 판매자 작업 완료 선언이 중요)
    const deliveryDate = new Date(Date.now() + (delivery_days || service.delivery_days || 7) * 24 * 60 * 60 * 1000)

    const { data: order, error: orderError, isExisting: _isExisting } = await createOrderWithIdempotency(
      supabase,
      {
        buyer_id: user.id,
        seller_id: seller.user_id, // users.id를 참조 (sellers.id가 아님)
        service_id: service_id,
        amount: amount,
        base_amount: amount,
        total_amount: amount,
        commission_rate: 0, // 수수료율 (추후 설정 가능)
        commission_fee: 0,
        seller_amount: amount, // 판매자 받을 금액 (수수료 제외 전)
        title: title,
        description: description || service.title,
        delivery_days: delivery_days || service.delivery_days,
        revision_count: revision_count || service.revision_count,
        delivery_date: deliveryDate.toISOString(),
        status: 'pending_payment',
      },
      merchantUid
    )

    if (orderError) {
      // 보안: 서버 로그에만 상세 정보 기록, 클라이언트에는 일반 메시지만 반환
      const pgError = orderError as PostgrestError
      console.error('Order creation error:', {
        message: pgError.message,
        code: pgError.code,
        details: pgError.details,
        hint: pgError.hint
      })
      return NextResponse.json({
        error: '주문 생성 실패'
      }, { status: 500 })
    }

    // 채팅방 자동 생성 (이미 존재하면 무시)
    try {
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', seller_id)
        .maybeSingle()

      if (!existingRoom) {
        await supabase
          .from('chat_rooms')
          .insert({
            buyer_id: user.id,
            seller_id: seller_id, // sellers.id 사용
            service_id: service_id
          })
      }
    } catch (chatError) {
      // 채팅방 생성 실패는 주문 생성을 막지 않음
      console.error('Chat room creation error:', chatError)
    }

    // Type assertion: order is guaranteed to be non-null here due to error check above
    if (!order) {
      return NextResponse.json({ error: '주문 생성 실패' }, { status: 500 })
    }

    return NextResponse.json({
      order_id: order.id,
      merchant_uid: merchantUid,
      amount: amount
    })
  } catch (error) {
    console.error('Direct purchase error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
