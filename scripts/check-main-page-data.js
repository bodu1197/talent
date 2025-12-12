/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 메인 페이지 서비스 데이터 확인');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 전체 active 서비스 수
  const { count: totalCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log(`전체 활성 서비스: ${totalCount}개\n`);

  // 서비스 목록 확인
  const { data: services } = await supabase
    .from('services')
    .select('id, title, status')
    .eq('status', 'active')
    .limit(10);

  console.log('활성 서비스 목록 (최대 10개):');
  services?.forEach(s => console.log(`  - ${s.title} (${s.id})`));

  // AI 카테고리 조회
  const { data: aiCategories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_ai', true);

  console.log('\nAI 카테고리:', aiCategories?.length || 0, '개');
  aiCategories?.forEach(cat => console.log(`  - ${cat.name} (${cat.id})`));

  if (aiCategories && aiCategories.length > 0) {
    const aiCategoryIds = aiCategories.map(c => c.id);

    // AI 카테고리의 서비스 수
    const { data: aiServiceLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .in('category_id', aiCategoryIds);

    console.log(`\nAI 카테고리 서비스: ${aiServiceLinks?.length || 0}개\n`);
  }

  // 광고 구독 확인
  const { data: ads, count: adsCount } = await supabase
    .from('advertising_subscriptions')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  console.log(`활성 광고 구독: ${adsCount || 0}개`);
  if (ads && ads.length > 0) {
    console.log('광고 서비스 ID:');
    ads.forEach(ad => console.log(`  - ${ad.service_id}`));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

check();
