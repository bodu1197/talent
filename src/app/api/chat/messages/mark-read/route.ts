import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// 채팅방의 읽지 않은 메시지를 모두 읽음 처리
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { room_id } = body

    if (!room_id) {
      return NextResponse.json({ error: 'room_id is required' }, { status: 400 })
    }

    logger.info(`[mark-read] User ${user.id} marking messages as read in room ${room_id}`)

    // 해당 채팅방의 읽지 않은 메시지를 모두 읽음 처리 (내가 보내지 않은 메시지만)
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', room_id)
      .eq('is_read', false)
      .neq('sender_id', user.id)
      .select()

    if (error) {
      logger.error('Mark messages as read error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info(`[mark-read] Marked ${data?.length || 0} messages as read`)

    return NextResponse.json({ success: true, count: data?.length || 0 })
  } catch (error) {
    logger.error('Mark messages as read API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
