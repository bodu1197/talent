import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 사용자의 모든 읽지 않은 메시지를 읽음 처리
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 모든 읽지 않은 메시지를 읽음 처리 (내가 받은 메시지만)
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('is_read', false)
      .neq('sender_id', user.id)
      .select();

    if (error) {
      logger.error('Mark all messages as read error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    logger.error('Mark all messages as read API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
