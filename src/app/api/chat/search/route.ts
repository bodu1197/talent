import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase();

    if (!query) {
      return NextResponse.json({ roomIds: [] });
    }

    // 1. 사용자가 참여한 채팅방 조회
    const { data: userRooms } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (!userRooms || userRooms.length === 0) {
      return NextResponse.json({ roomIds: [] });
    }

    const roomIds = userRooms.map((r) => r.id);

    // 2. 해당 채팅방들의 메시지에서 검색어 포함된 것 찾기
    const { data: matchingMessages } = await supabase
      .from('chat_messages')
      .select('room_id')
      .in('room_id', roomIds)
      .ilike('message', `%${query}%`);

    // 중복 제거한 room_id 목록
    const matchingRoomIds = [...new Set(matchingMessages?.map((m) => m.room_id) || [])];

    return NextResponse.json({ roomIds: matchingRoomIds });
  } catch (error) {
    console.error('Chat search error:', error);
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다' }, { status: 500 });
  }
}
