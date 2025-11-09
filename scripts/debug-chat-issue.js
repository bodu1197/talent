const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function debug() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('🔍 현재 chat_rooms 테이블 데이터:\n');

  const { data: rooms, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('총', rooms.length, '개의 채팅방:');
  rooms.forEach((room, i) => {
    console.log(`\n${i + 1}. 채팅방 ID: ${room.id}`);
    console.log(`   user1_id: ${room.user1_id}`);
    console.log(`   user2_id: ${room.user2_id}`);
    console.log(`   service_id: ${room.service_id || 'NULL'}`);
    console.log(`   생성일: ${room.created_at}`);
  });

  // 동일한 user pair 확인
  console.log('\n\n⚠️  동일한 user1_id, user2_id를 가진 채팅방:');
  const pairs = {};
  rooms.forEach(room => {
    const key = `${room.user1_id}-${room.user2_id}`;
    if (!pairs[key]) pairs[key] = [];
    pairs[key].push(room);
  });

  for (const [pair, roomList] of Object.entries(pairs)) {
    if (roomList.length > 1) {
      console.log(`\n👥 User Pair: ${pair}`);
      roomList.forEach(r => {
        console.log(`   - Room ${r.id}: service_id=${r.service_id || 'NULL'}`);
      });
    }
  }

  // Services 테이블에서 서비스 정보 가져오기
  console.log('\n\n📋 각 채팅방의 서비스 정보:');
  for (const room of rooms.slice(0, 5)) {
    if (room.service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('id, title')
        .eq('id', room.service_id)
        .single();

      console.log(`\n채팅방 ${room.id.substring(0, 8)}...`);
      console.log(`  서비스: ${service?.title || '알 수 없음'}`);
    }
  }
}

debug();
