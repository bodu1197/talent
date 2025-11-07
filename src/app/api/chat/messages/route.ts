import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// 메시지 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const room_id = searchParams.get('room_id')

    if (!room_id) {
      return NextResponse.json({ error: 'room_id is required' }, { status: 400 })
    }

    // 메시지 조회
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        room_id,
        sender_id,
        message,
        is_read,
        created_at,
        file_url,
        file_name,
        file_size,
        file_type
      `)
      .eq('room_id', room_id)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Messages fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 읽지 않은 메시지를 읽음 처리 (상대방이 보낸 메시지만)
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', room_id)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({ messages })
  } catch (error) {
    logger.error('Messages API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 메시지 전송
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { room_id, message, file_url, file_name, file_size, file_type } = body

    if (!room_id) {
      return NextResponse.json({ error: 'room_id is required' }, { status: 400 })
    }

    // 메시지나 파일 중 하나는 있어야 함
    if (!message && !file_url) {
      return NextResponse.json({ error: 'message or file is required' }, { status: 400 })
    }

    // 메시지 전송
    const insertData: any = {
      room_id,
      sender_id: user.id,
      message: message || ''
    }

    // 파일 정보가 있으면 추가
    if (file_url) {
      insertData.file_url = file_url
      insertData.file_name = file_name
      insertData.file_size = file_size
      insertData.file_type = file_type
    }

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert(insertData)
      .select(`
        id,
        room_id,
        sender_id,
        message,
        is_read,
        created_at,
        file_url,
        file_name,
        file_size,
        file_type
      `)
      .single()

    if (error) {
      logger.error('Message send error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    logger.error('Message send API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
