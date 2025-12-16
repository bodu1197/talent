import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { verifyChatAuth } from '@/lib/api/chat-common';

// 채팅방의 읽지 않은 메시지를 모두 읽음 처리
export async function POST(request: NextRequest) {
  try {
    // 인증 및 room_id 검증
    const authResult = await verifyChatAuth(request);
    if (!authResult.success) {
      return authResult.error;
    }

    const { user, supabase, room_id } = authResult;

    logger.info(`[mark-read] User ${user.id} marking messages as read in room ${room_id}`);

    // 먼저 읽지 않은 메시지 개수 확인
    const { count: beforeCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room_id)
      .eq('is_read', false)
      .neq('sender_id', user.id);

    logger.info(`[mark-read] Found ${beforeCount} unread messages in room before update`);

    // 해당 채팅방의 읽지 않은 메시지를 모두 읽음 처리 (내가 보내지 않은 메시지만)
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', room_id)
      .eq('is_read', false)
      .neq('sender_id', user.id)
      .select();

    if (error) {
      logger.error('Mark messages as read error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info(
      `[mark-read] Successfully marked ${data?.length || 0} messages as read in room ${room_id}`
    );

    return NextResponse.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    logger.error('Mark messages as read API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
