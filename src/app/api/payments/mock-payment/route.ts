import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 테스트용 Mock 결제 API
// 실제 결제 없이 주문 상태를 paid로 변경

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다' }, { status: 400 })
    }

    // 주문 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 본인 주문인지 확인
    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 이미 결제된 주문인지 확인
    if (order.status !== 'pending_payment') {
      return NextResponse.json({ error: '이미 처리된 주문입니다' }, { status: 400 })
    }

    // 주문 상태를 paid로 변경 (테스트용)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        started_at: new Date().toISOString()
      })
      .eq('id', order_id)

    if (updateError) {
      console.error('Order update error:', updateError)
      return NextResponse.json({ error: '주문 업데이트 실패' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Mock 결제 완료 (테스트 모드)'
    })
  } catch (error) {
    console.error('Mock payment error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
