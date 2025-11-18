import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { room_id, service_id, title, amount, description, delivery_days, revision_count } = body

    // 필수 필드 검증
    if (!room_id || !title || !amount) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다' }, { status: 400 })
    }

    if (amount < 1000) {
      return NextResponse.json({ error: '최소 결제 금액은 1,000원입니다' }, { status: 400 })
    }

    // 채팅방 정보 조회 (판매자 확인)
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('seller_id, buyer_id')
      .eq('id', room_id)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    // 판매자의 user_id 조회
    const { data: seller } = await supabase
      .from('sellers')
      .select('user_id')
      .eq('id', room.seller_id)
      .single()

    // 판매자인지 확인
    if (seller?.user_id !== user.id) {
      return NextResponse.json({ error: '판매자만 결제 요청을 할 수 있습니다' }, { status: 403 })
    }

    // 결제 요청 생성
    const { data: paymentRequest, error: insertError } = await supabase
      .from('payment_requests')
      .insert({
        room_id,
        seller_id: room.seller_id,
        buyer_id: room.buyer_id,
        service_id: service_id || null,
        title,
        amount,
        description: description || null,
        delivery_days: delivery_days || 7,
        revision_count: revision_count || 0,
        status: 'pending',
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() // 72시간 후
      })
      .select()
      .single()

    if (insertError) {
      console.error('결제 요청 생성 실패:', insertError)
      return NextResponse.json({ error: '결제 요청 생성에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ success: true, payment_request: paymentRequest })
  } catch (error) {
    console.error('Payment request API error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// GET: 결제 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('room_id')

    if (!roomId) {
      return NextResponse.json({ error: 'room_id가 필요합니다' }, { status: 400 })
    }

    // 채팅방의 결제 요청 목록 조회
    const { data: paymentRequests, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('결제 요청 조회 실패:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      return NextResponse.json({ error: '결제 요청 조회에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ payment_requests: paymentRequests || [] })
  } catch (error) {
    console.error('Get payment requests error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
