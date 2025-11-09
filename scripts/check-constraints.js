const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkConstraints() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // RPC로 제약조건 확인 쿼리 실행
  const query = `
    SELECT conname, pg_get_constraintdef(oid) as definition
    FROM pg_constraint
    WHERE conrelid = 'chat_rooms'::regclass
    AND contype = 'u';
  `;

  console.log('🔍 chat_rooms 테이블의 UNIQUE 제약조건:\n');

  // 직접 supabase에서 데이터 조회 시도
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: query
  });

  if (error) {
    console.error('❌ 제약조건 조회 실패:', error.message);
    console.log('\n💡 Supabase Dashboard에서 확인이 필요합니다.');
  } else {
    console.log('✅ 제약조건:', data);
  }
}

checkConstraints();
