/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  새로 생성된 서비스 삭제 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. 새로 생성한 판매자 ID 가져오기 (기존 27명 제외)
    console.log('📂 새로 생성된 판매자 조회 중...\n');

    const { data: allSellers } = await supabase
      .from('sellers')
      .select('id, business_name, created_at')
      .order('created_at', { ascending: true });

    // 처음 27명 제외하고 나머지 삭제 대상
    const newSellers = allSellers.slice(27);

    console.log(`✓ 총 판매자: ${allSellers.length}명`);
    console.log(`✓ 기존 판매자: 27명`);
    console.log(`✓ 삭제 대상 판매자: ${newSellers.length}명\n`);

    if (newSellers.length === 0) {
      console.log('삭제할 판매자가 없습니다.\n');
      return;
    }

    const newSellerIds = newSellers.map(s => s.id);

    // 2. 해당 판매자의 서비스 삭제
    console.log('🗑️  서비스 삭제 중...\n');

    const { data: deletedServices, error: serviceError } = await supabase
      .from('services')
      .delete()
      .in('seller_id', newSellerIds)
      .select();

    if (serviceError) throw serviceError;

    console.log(`✓ ${deletedServices?.length || 0}개의 서비스 삭제 완료\n`);

    // 3. 판매자 삭제
    console.log('🗑️  판매자 삭제 중...\n');

    const { data: deletedSellers, error: sellerError } = await supabase
      .from('sellers')
      .delete()
      .in('id', newSellerIds)
      .select();

    if (sellerError) throw sellerError;

    console.log(`✓ ${deletedSellers?.length || 0}명의 판매자 삭제 완료\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 삭제 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 에러:', error);
    process.exit(1);
  }
}

main();
