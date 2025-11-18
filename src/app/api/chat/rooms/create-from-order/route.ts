import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 주문으로부터 채팅방 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: 'order_id가 필요합니다' }, { status: 400 })
    }

    // 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, seller_id, service_id')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 확인 (구매자 또는 판매자만 채팅방 생성 가능)
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // user1_id와 user2_id 정렬 (user1_id <= user2_id)
    const user1_id = order.buyer_id < order.seller_id ? order.buyer_id : order.seller_id
    const user2_id = order.buyer_id < order.seller_id ? order.seller_id : order.buyer_id

    // 기존 채팅방 확인 (user1_id, user2_id, service_id로 확인)
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('user1_id', user1_id)
      .eq('user2_id', user2_id)
      .eq('service_id', order.service_id)
      .maybeSingle()

    if (existingRoom) {
      return NextResponse.json({
        room: existingRoom,
        message: '이미 채팅방이 존재합니다'
      })
    }

    // 새 채팅방 생성
    const { data: newRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        user1_id,
        user2_id,
        service_id: order.service_id
      })
      .select('id')
      .single()

    if (roomError) {
      console.error('Chat room creation error:', roomError)
      return NextResponse.json({ error: '채팅방 생성 실패' }, { status: 500 })
    }

    return NextResponse.json({
      room: newRoom,
      message: '채팅방이 생성되었습니다'
    })
  } catch (error) {
    console.error('Create chat room from order error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
