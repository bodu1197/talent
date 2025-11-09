const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function applyMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  console.log('🔄 즐겨찾기 테이블 생성 중...\n');

  // chat_favorites 테이블 생성
  const { error: createTableError } = await supabase.rpc('exec_sql', {
    sql: `
      -- 채팅방 즐겨찾기 테이블 생성
      CREATE TABLE IF NOT EXISTS chat_favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, room_id)
      );

      -- 인덱스 추가
      CREATE INDEX IF NOT EXISTS idx_chat_favorites_user_id ON chat_favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_favorites_room_id ON chat_favorites(room_id);
    `
  });

  if (createTableError) {
    console.error('❌ 테이블 생성 실패:', createTableError.message);

    // 직접 쿼리 시도
    console.log('\n📝 직접 SQL 실행 시도...\n');

    const { error: directError } = await supabase
      .from('chat_favorites')
      .select('count')
      .limit(0);

    if (directError && directError.code === '42P01') {
      console.error('❌ chat_favorites 테이블이 존재하지 않습니다.');
      console.log('\n💡 Supabase Dashboard의 SQL Editor에서 다음 SQL을 직접 실행해주세요:');
      console.log(`
-- 채팅방 즐겨찾기 테이블 생성
CREATE TABLE IF NOT EXISTS chat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_chat_favorites_user_id ON chat_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_favorites_room_id ON chat_favorites(room_id);

-- RLS 정책
ALTER TABLE chat_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON chat_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON chat_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON chat_favorites FOR DELETE
  USING (auth.uid() = user_id);
      `);
    } else {
      console.log('✅ chat_favorites 테이블이 이미 존재합니다.');
    }
  } else {
    console.log('✅ 테이블 생성 완료');

    // RLS 정책 추가
    console.log('\n🔒 RLS 정책 설정 중...');

    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE chat_favorites ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view their own favorites" ON chat_favorites;
        DROP POLICY IF EXISTS "Users can insert their own favorites" ON chat_favorites;
        DROP POLICY IF EXISTS "Users can delete their own favorites" ON chat_favorites;

        CREATE POLICY "Users can view their own favorites"
          ON chat_favorites FOR SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own favorites"
          ON chat_favorites FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own favorites"
          ON chat_favorites FOR DELETE
          USING (auth.uid() = user_id);
      `
    });

    if (rlsError) {
      console.log('⚠️  RLS 정책 설정 실패:', rlsError.message);
      console.log('💡 수동으로 설정이 필요할 수 있습니다.');
    } else {
      console.log('✅ RLS 정책 설정 완료');
    }
  }

  console.log('\n✅ 마이그레이션 완료!');
}

applyMigration();
