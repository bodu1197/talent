const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testUnread() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('🔍 채팅방별 읽지 않은 메시지 수 확인:\n');

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('*')
    .order('created_at', { ascending: false });

  for (const room of rooms || []) {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .eq('is_read', false);

    console.log('방 ID:', room.id.substring(0, 8) + '...');
    console.log('  읽지 않은 메시지:', count || 0, '개');

    // 해당 방의 모든 메시지
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('id, is_read, sender_id')
      .eq('room_id', room.id);

    console.log('  전체 메시지:', messages?.length || 0, '개');
    console.log('  읽음:', messages?.filter(m => m.is_read).length || 0, '개');
    console.log('  안읽음:', messages?.filter(m => !m.is_read).length || 0, '개\n');
  }
}

testUnread();
