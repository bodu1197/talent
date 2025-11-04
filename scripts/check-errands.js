require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, level, is_ai')
    .order('level')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // 심부름 카테고리 찾기
  const errandCategory = categories.find(c => c.slug === 'errands' || c.name.includes('심부름'));

  if (!errandCategory) {
    console.log('심부름 카테고리를 찾을 수 없습니다.');
    console.log('\n전체 1단계 카테고리:');
    categories.filter(c => c.level === 1).forEach(c => {
      console.log(`  ${c.name} (slug: ${c.slug})`);
    });
    return;
  }

  console.log('=== 심부름 카테고리 구조 ===\n');
  console.log(`1단계: ${errandCategory.name}\n`);

  // 2단계 카테고리 (심부름의 자식)
  const level2 = categories.filter(c => c.parent_id === errandCategory.id);

  if (level2.length === 0) {
    console.log('하위 카테고리가 없습니다.');
    return;
  }

  level2.forEach(cat2 => {
    console.log(`\n2단계: ${cat2.name}`);

    // 3단계 카테고리
    const level3 = categories.filter(c => c.parent_id === cat2.id);
    if (level3.length > 0) {
      level3.forEach(cat3 => {
        console.log(`  - ${cat3.name}`);
      });
    }
  });
})();
