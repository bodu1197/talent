/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log('1. 활성 광고 서비스 확인:');
  const { data: ads } = await supabase
    .from('advertising_subscriptions')
    .select('service_id, services(title)')
    .eq('status', 'active');

  console.log(`   총 ${ads?.length || 0}개의 활성 광고`);
  ads?.slice(0, 3).forEach((ad) => {
    console.log(`   - 서비스: ${ad.services?.title}`);
  });

  console.log('\n2. IT·프로그래밍 카테고리의 서비스:');
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', 'it-programming')
    .single();

  console.log('   Category query result:', category, catError);

  if (category) {
    // Get all descendant categories
    const { data: level2 } = await supabase
      .from('categories')
      .select('id, name')
      .eq('parent_id', category.id);

    const level2Ids = level2?.map((c) => c.id) || [];
    console.log(`   하위 카테고리: ${level2Ids.length}개`);

    const { data: level3 } = await supabase
      .from('categories')
      .select('id')
      .in('parent_id', level2Ids.length > 0 ? level2Ids : ['none']);

    const level3Ids = level3?.map((c) => c.id) || [];
    const allCategoryIds = [category.id, ...level2Ids, ...level3Ids];

    console.log(`   전체 카테고리 IDs: ${allCategoryIds.length}개`);

    const { data: serviceLinks } = await supabase
      .from('service_categories')
      .select('service_id, services(title)')
      .in('category_id', allCategoryIds)
      .limit(10);

    console.log(`   서비스 수: ${serviceLinks?.length || 0}개`);

    const advertisedServiceIds = ads?.map((a) => a.service_id) || [];
    serviceLinks?.forEach((link) => {
      const isAd = advertisedServiceIds.includes(link.service_id);
      console.log(`   - ${link.services?.title} ${isAd ? '[광고중]' : ''}`);
    });
  }
}

checkData();
