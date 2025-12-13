import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 읽지 않은 메시지가 있는 채팅방 수 조회 (단일 쿼리로 최적화)
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 단일 쿼리로 읽지 않은 메시지가 있는 채팅방 수 계산
    // 1. 사용자가 참여한 채팅방 중
    // 2. 사용자가 보내지 않은 메시지 중
    // 3. 읽지 않은 메시지가 있는 채팅방의 고유한 수
    const { data, error } = await supabase
      .from('chat_messages')
      .select(
        `
        room_id,
        chat_rooms!inner(id, user1_id, user2_id)
      `
      )
      .eq('is_read', false)
      .neq('sender_id', user.id)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`, { referencedTable: 'chat_rooms' });

    if (error) {
      logger.error('Unread count query error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // 고유한 room_id 수 계산
    const uniqueRoomIds = new Set(data?.map((msg) => msg.room_id) || []);
    const unreadCount = uniqueRoomIds.size;

    return NextResponse.json({ unreadCount });
  } catch (error) {
    logger.error('Unread count API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
