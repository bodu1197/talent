import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 읽지 않은 메시지가 있는 채팅방 수 조회 (2개 쿼리로 최적화 - N+1 대신)
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. 사용자가 참여한 모든 채팅방 ID 조회
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (roomsError) {
      logger.error('Chat rooms query error:', roomsError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const roomIds = rooms?.map((room) => room.id) || [];

    if (roomIds.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // 2. 해당 채팅방들에서 읽지 않은 메시지가 있는 고유 room_id 조회 (단일 쿼리)
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('room_id')
      .in('room_id', roomIds)
      .eq('is_read', false)
      .neq('sender_id', user.id);

    if (messagesError) {
      logger.error('Unread messages query error:', messagesError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // 고유한 room_id 수 계산
    const uniqueRoomIds = new Set(unreadMessages?.map((msg) => msg.room_id) || []);
    const unreadCount = uniqueRoomIds.size;

    return NextResponse.json({ unreadCount });
  } catch (error) {
    logger.error('Unread count API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
