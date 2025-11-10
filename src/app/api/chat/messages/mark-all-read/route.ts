import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 사용자의 모든 읽지 않은 메시지를 읽음 처리
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[mark-all-read] Marking all messages as read for user:', user.id)

    // 먼저 읽지 않은 메시지 개수 확인
    const { count: beforeCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', user.id)

    console.log(`[mark-all-read] Found ${beforeCount} unread messages before update`)

    // 모든 읽지 않은 메시지를 읽음 처리 (내가 받은 메시지만)
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('is_read', false)
      .neq('sender_id', user.id)
      .select()

    if (error) {
      console.error('Mark all messages as read error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[mark-all-read] Successfully marked ${data?.length || 0} messages as read`)

    return NextResponse.json({ success: true, count: data?.length || 0 })
  } catch (error) {
    console.error('Mark all messages as read API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
