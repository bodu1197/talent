import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// 채팅방 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 채팅방 목록 조회 (user1_id 또는 user2_id로 참여한 채팅방)
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        user1_id,
        user2_id,
        service_id,
        last_message_at,
        created_at
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) {
      logger.error('Chat rooms fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 각 채팅방의 마지막 메시지, 읽지 않은 메시지 수, 그리고 관련 정보 조회
    const roomsWithMessages = await Promise.all(
      (rooms || []).map(async (room) => {
        // 상대방 ID 확인 (현재 사용자가 아닌 다른 사용자)
        const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id

        // 상대방 정보
        const { data: otherUser } = await supabase
          .from('users')
          .select('id, name, profile_image')
          .eq('id', otherUserId)
          .single()

        // 서비스 정보
        let service = null
        if (room.service_id) {
          const { data: serviceData } = await supabase
            .from('services')
            .select('id, title')
            .eq('id', room.service_id)
            .single()
          service = serviceData
        }

        // 마지막 메시지
        const { data: lastMessage } = await supabase
          .from('chat_messages')
          .select('message, created_at, sender_id')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        // 읽지 않은 메시지 수
        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .eq('is_read', false)
          .neq('sender_id', user.id)

        return {
          ...room,
          otherUser,
          service,
          lastMessage,
          unreadCount: unreadCount || 0
        }
      })
    )

    return NextResponse.json({ rooms: roomsWithMessages })
  } catch (error) {
    logger.error('Chat rooms API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 채팅방 생성 또는 기존 채팅방 반환
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { seller_id, service_id, other_user_id } = body

    // seller_id 또는 other_user_id 중 하나는 필수
    const targetUserId = other_user_id || seller_id

    if (!targetUserId) {
      return NextResponse.json({ error: 'seller_id or other_user_id is required' }, { status: 400 })
    }

    // seller_id가 제공된 경우, seller의 user_id로 변환
    let otherUserId = targetUserId
    if (seller_id && !other_user_id) {
      const { data: seller } = await supabase
        .from('sellers')
        .select('user_id')
        .eq('id', seller_id)
        .single()

      if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
      }
      otherUserId = seller.user_id
    }

    // user1_id와 user2_id 정렬 (user1_id <= user2_id)
    const user1_id = user.id < otherUserId ? user.id : otherUserId
    const user2_id = user.id < otherUserId ? otherUserId : user.id

    // 기존 채팅방 확인
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('user1_id', user1_id)
      .eq('user2_id', user2_id)
      .maybeSingle()

    if (existingRoom) {
      return NextResponse.json({ room_id: existingRoom.id })
    }

    // 새 채팅방 생성
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert({
        user1_id,
        user2_id,
        service_id: service_id || null
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Chat room creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room_id: newRoom.id })
  } catch (error) {
    logger.error('Chat room creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
