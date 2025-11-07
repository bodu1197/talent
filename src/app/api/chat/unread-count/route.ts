import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 읽지 않은 메시지 총 개수 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 사용자가 판매자인지 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    // 사용자가 참여한 모든 채팅방 ID 조회
    let roomIds: string[] = []

    if (seller) {
      // 판매자인 경우
      const { data: sellerRooms } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('seller_id', seller.id)

      roomIds = sellerRooms?.map(room => room.id) || []
    } else {
      // 구매자인 경우
      const { data: buyerRooms } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('buyer_id', user.id)

      roomIds = buyerRooms?.map(room => room.id) || []
    }

    if (roomIds.length === 0) {
      return NextResponse.json({ unreadCount: 0 })
    }

    // 읽지 않은 메시지 총 개수 조회 (내가 보낸 메시지 제외)
    const { count: unreadCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .in('room_id', roomIds)
      .eq('is_read', false)
      .neq('sender_id', user.id)

    return NextResponse.json({ unreadCount: unreadCount || 0 })
  } catch (error) {
    console.error('Unread count API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
