/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('📂 뷰티/패션 카테고리 구조 확인\n');

  // 1차 카테고리 조회
  const { data: level1 } = await supabase
    .from('categories')
    .select('id, name, slug, level')
    .eq('level', 1)
    .order('name');

  console.log('=== 1차 카테고리 ===');
  level1?.forEach((c) => console.log(`  ${c.slug}: ${c.name}`));

  // 뷰티/패션 찾기
  const beauty = level1?.find((c) => c.slug === 'beauty-fashion' || c.slug === 'beauty');

  if (!beauty) {
    console.log('\n❌ 뷰티/패션 카테고리를 찾을 수 없습니다.');
    return;
  }

  console.log(`\n✅ 뷰티/패션: ${beauty.id}`);

  // 2차 카테고리
  const { data: level2 } = await supabase
    .from('categories')
    .select('id, name, slug, level')
    .eq('parent_id', beauty.id)
    .order('name');

  console.log('\n=== 2차 카테고리 ===');
  if (!level2 || level2.length === 0) {
    console.log('  (없음)');
  } else {
    level2.forEach((c) => console.log(`  ${c.slug}: ${c.name}`));
  }

  // 3차 카테고리 (있으면)
  if (level2 && level2.length > 0) {
    for (const cat2 of level2) {
      const { data: level3 } = await supabase
        .from('categories')
        .select('id, name, slug, level')
        .eq('parent_id', cat2.id)
        .order('name');

      if (level3 && level3.length > 0) {
        console.log(`\n=== 3차 카테고리 (${cat2.name} 하위) ===`);
        level3.forEach((c) => console.log(`  ${c.slug}: ${c.name}`));
      }
    }
  }

  // 현재 판매자 수
  const { count: sellerCount } = await supabase
    .from('sellers')
    .select('*', { count: 'exact', head: true });

  console.log(`\n👤 현재 판매자 수: ${sellerCount || 0}`);

  // 위치 있는 판매자
  const { count: locSellerCount } = await supabase
    .from('sellers')
    .select('*', { count: 'exact', head: true })
    .not('location_latitude', 'is', null);

  console.log(`📍 위치 정보 있는 판매자: ${locSellerCount || 0}`);
}

main().catch(console.error);
