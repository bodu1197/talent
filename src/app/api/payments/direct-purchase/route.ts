import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Rate Limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || userLimit.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // Rate Limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json({ error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
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

    // 주문 생성 (pending_payment 상태)
    const merchantUid = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: seller_id,
        service_id: service_id,
        amount: amount,
        title: title,
        description: description || service.title,
        delivery_days: delivery_days || service.delivery_days,
        revision_count: revision_count || service.revision_count,
        status: 'pending_payment',
        merchant_uid: merchantUid
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
      amount: amount
    })
  } catch (error) {
    console.error('Direct purchase error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
