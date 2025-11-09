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

    // 사용자가 구매자인지 판매자인지 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    // 채팅방 목록 조회 (구매자 또는 판매자로 참여한 채팅방)
    let query = supabase
      .from('chat_rooms')
      .select(`
        id,
        buyer_id,
        seller_id,
        service_id,
        last_message_at,
        created_at
      `)
      .order('last_message_at', { ascending: false })

    if (seller) {
      // 판매자인 경우
      query = query.eq('seller_id', seller.id)
    } else {
      // 구매자인 경우
      query = query.eq('buyer_id', user.id)
    }

    const { data: rooms, error } = await query

    if (error) {
      logger.error('Chat rooms fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 각 채팅방의 마지막 메시지, 읽지 않은 메시지 수, 그리고 관련 정보 조회
    const roomsWithMessages = await Promise.all(
      (rooms || []).map(async (room) => {
        // 구매자 정보
        const { data: buyer } = await supabase
          .from('users')
          .select('id, name, profile_image')
          .eq('id', room.buyer_id)
          .single()

        // 판매자 정보
        const { data: seller } = await supabase
          .from('sellers')
          .select('id, business_name, display_name, profile_image')
          .eq('id', room.seller_id)
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
          buyer,
          seller,
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
    const { seller_id, service_id } = body

    if (!seller_id) {
      return NextResponse.json({ error: 'seller_id is required' }, { status: 400 })
    }

    // 기존 채팅방 확인
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', seller_id)
      .maybeSingle()

    if (existingRoom) {
      return NextResponse.json({ room: existingRoom })
    }

    // 새 채팅방 생성
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert({
        buyer_id: user.id,
        seller_id,
        service_id: service_id || null
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Chat room creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room: newRoom })
  } catch (error) {
    logger.error('Chat room creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
