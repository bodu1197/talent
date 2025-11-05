require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, level, is_active, display_order')
    .order('level')
    .order('display_order');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== 전체 카테고리 구조 ===\n');

  // 1단계 카테고리들
  const level1 = categories.filter(c => c.level === 1);

  level1.forEach(cat1 => {
    console.log(`\n1단계: ${cat1.name} (slug: ${cat1.slug}, active: ${cat1.is_active})`);

    // 2단계 카테고리
    const level2 = categories.filter(c => c.parent_id === cat1.id);

    level2.forEach(cat2 => {
      console.log(`  └─ 2단계: ${cat2.name} (slug: ${cat2.slug}, active: ${cat2.is_active})`);

      // 3단계 카테고리
      const level3 = categories.filter(c => c.parent_id === cat2.id);

      level3.forEach(cat3 => {
        console.log(`      └─ 3단계: ${cat3.name} (slug: ${cat3.slug}, active: ${cat3.is_active})`);
      });
    });
  });

  console.log(`\n\n총 ${categories.length}개 카테고리`);
})();
