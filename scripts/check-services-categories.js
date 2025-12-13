/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // 제외할 slug
  const excluded = [
    'life-service',
    'event',
    'beauty-fashion',
    'custom-order',
    'counseling-coaching',
    'hobby-handmade',
    'errands',
  ];

  // 1단계 카테고리 목록
  const { data: cats } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .eq('is_active', true);

  const remainingCats = cats?.filter((c) => !excluded.includes(c.slug) && c.slug !== 'ai-services');
  const remainingIds = remainingCats?.map((c) => c.id) || [];

  console.log('남은 카테고리:', remainingCats?.map((c) => c.name).join(', '));

  // 2단계 카테고리
  const { data: subCats } = await supabase
    .from('categories')
    .select('id, parent_id')
    .in('parent_id', remainingIds);

  const allCatIds = [...remainingIds, ...(subCats?.map((c) => c.id) || [])];

  // 서비스-카테고리 연결
  const { data: links } = await supabase
    .from('service_categories')
    .select('service_id, category_id')
    .in('category_id', allCatIds);

  console.log('\n남은 카테고리 ID:', remainingIds.length);
  console.log('하위 카테고리 ID:', subCats?.length || 0);
  console.log('서비스-카테고리 연결:', links?.length || 0);

  const serviceIds = [...new Set(links?.map((l) => l.service_id) || [])];
  console.log('해당 카테고리의 서비스 수:', serviceIds.length);

  // 실제 활성 서비스
  if (serviceIds.length > 0) {
    const { data: services } = await supabase
      .from('services')
      .select('id, title')
      .in('id', serviceIds)
      .eq('status', 'active');
    console.log('\n활성 서비스:', services?.length || 0);
    services?.forEach((s) => console.log('-', s.title));
  }

  // 전체 서비스 카테고리 분포 확인
  console.log('\n\n=== 전체 서비스 카테고리 분포 ===');
  for (const cat of cats || []) {
    const { data: subC } = await supabase.from('categories').select('id').eq('parent_id', cat.id);

    const catIds = [cat.id, ...(subC?.map((c) => c.id) || [])];

    const { data: catLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .in('category_id', catIds);

    const uniqueServices = [...new Set(catLinks?.map((l) => l.service_id) || [])];

    if (uniqueServices.length > 0) {
      const { data: activeServices } = await supabase
        .from('services')
        .select('id')
        .in('id', uniqueServices)
        .eq('status', 'active');

      const isExcluded = excluded.includes(cat.slug) ? '[제외됨]' : '';
      console.log(`${cat.name}: ${activeServices?.length || 0}개 ${isExcluded}`);
    }
  }
}
check();
