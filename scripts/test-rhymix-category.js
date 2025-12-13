/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testRhymixCategory() {
  console.log('=== 라이믹스 카테고리 테스트 ===\n');

  // 1. Get category
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, level, parent_id')
    .eq('slug', 'rhymix')
    .single();

  console.log('카테고리:', category.name);
  console.log('Level:', category.level);
  console.log('ID:', category.id);

  // 2. Get active ads
  const { data: ads } = await supabase
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  const advertisedServiceIds = ads?.map((ad) => ad.service_id) || [];
  console.log('\n활성 광고 서비스 ID:', advertisedServiceIds.length, '개');

  // 3. Get service links
  const { data: serviceLinks } = await supabase
    .from('service_categories')
    .select('service_id')
    .eq('category_id', category.id);

  const serviceIds = serviceLinks?.map((sl) => sl.service_id) || [];
  console.log('라이믹스 카테고리 서비스 링크:', serviceIds.length, '개');

  // 4. Get actual services
  const { data: services } = await supabase
    .from('services')
    .select('id, title, status')
    .in('id', serviceIds)
    .eq('status', 'active');

  console.log('활성 서비스:', services?.length || 0, '개\n');

  // 5. Add is_advertised field
  services?.forEach((service) => {
    service.is_advertised = advertisedServiceIds.includes(service.id);
  });

  const advertisedCount = services?.filter((s) => s.is_advertised).length || 0;
  const regularCount = services?.filter((s) => !s.is_advertised).length || 0;

  console.log('🎯 is_advertised 필드 추가 후:');
  console.log(`  - 광고 서비스: ${advertisedCount}개`);
  console.log(`  - 일반 서비스: ${regularCount}개\n`);

  // 6. Show services
  console.log('서비스 목록:');
  services?.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.title} ${s.is_advertised ? '[광고]' : ''}`);
  });

  // 7. Simulate sorting
  const advertised = services?.filter((s) => s.is_advertised) || [];
  const regular = services?.filter((s) => !s.is_advertised) || [];
  const combined = [...advertised, ...regular];

  console.log('\n✅ 최종 정렬 (광고 우선):');
  combined.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.title} ${s.is_advertised ? '[광고]' : ''}`);
  });
}

testRhymixCategory().catch(console.error);
