/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('advertising_impressions 테이블 수정 중...\n');

  // 외래 키 제약 조건 제거
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE advertising_impressions
        DROP CONSTRAINT IF EXISTS advertising_impressions_category_id_fkey;

      COMMENT ON COLUMN advertising_impressions.category_id IS '카테고리 ID (통계용, 외래 키 없음)';
    `,
  });

  if (error) {
    console.error('❌ 오류:', error);

    console.log('\n수동 실행이 필요합니다:');
    console.log('Supabase 대시보드 → SQL Editor에서 다음 SQL 실행:\n');
    console.log('ALTER TABLE advertising_impressions');
    console.log('  DROP CONSTRAINT IF EXISTS advertising_impressions_category_id_fkey;');
  } else {
    console.log('✅ 외래 키 제약 조건 제거 완료!');
  }
})();
