const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDuplicates() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No user logged in');
    return;
  }

  console.log('User ID:', user.id);
  console.log('');

  // 최근 30일 방문 기록 조회
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('category_visits')
    .select('category_id, category_name, category_slug, visited_at')
    .eq('user_id', user.id)
    .gte('visited_at', thirtyDaysAgo.toISOString())
    .order('visited_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total visits in last 30 days:', data.length);
  console.log('');

  // 카테고리별로 그룹화
  const categoryGroups = {};
  data.forEach(visit => {
    if (!categoryGroups[visit.category_id]) {
      categoryGroups[visit.category_id] = [];
    }
    categoryGroups[visit.category_id].push(visit);
  });

  console.log('Unique category IDs:', Object.keys(categoryGroups).length);
  console.log('');

  // 중복된 이름이나 슬러그가 있는지 확인
  console.log('Categories with visits:');
  console.log('='.repeat(80));
  Object.entries(categoryGroups).forEach(([catId, visits]) => {
    const names = [...new Set(visits.map(v => v.category_name))];
    const slugs = [...new Set(visits.map(v => v.category_slug))];

    console.log(`[${catId}]`);
    console.log(`  Names: ${names.join(', ')}`);
    console.log(`  Slugs: ${slugs.join(', ')}`);
    console.log(`  Visit count: ${visits.length}`);

    if (names.length > 1 || slugs.length > 1) {
      console.log('  ⚠️  WARNING: Multiple names or slugs for same category_id!');
    }
    console.log('');
  });
}

checkDuplicates();
