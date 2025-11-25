import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 읽지 않은 메시지가 있는 채팅방 수 조회 (개별 메시지가 아닌 채팅방 단위)
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자가 참여한 모든 채팅방 조회
    const { data: rooms } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    const roomIds = rooms?.map((room) => room.id) || [];

    if (roomIds.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // 각 채팅방별로 읽지 않은 메시지가 있는지 확인
    let unreadRoomCount = 0;

    for (const roomId of roomIds) {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .eq('is_read', false)
        .neq('sender_id', user.id)
        .limit(1); // 하나만 있어도 그 방은 읽지 않은 메시지가 있는 것

      if (count && count > 0) {
        unreadRoomCount++;
      }
    }

    return NextResponse.json({ unreadCount: unreadRoomCount });
  } catch (error) {
    logger.error('Unread count API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
