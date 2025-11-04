require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  // 1. 심부름 카테고리 찾기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, level')
    .order('level');

  const errandCategory = categories.find(c => c.slug === 'errands');

  if (!errandCategory) {
    console.log('심부름 카테고리를 찾을 수 없습니다.');
    return;
  }

  // 2. "심부름 대행" 카테고리 찾기
  const errandProxyCategory = categories.find(
    c => c.parent_id === errandCategory.id && c.name === '심부름 대행'
  );

  if (!errandProxyCategory) {
    console.log('심부름 대행 카테고리를 찾을 수 없습니다.');
    return;
  }

  console.log(`삭제할 카테고리: ${errandProxyCategory.name} (id: ${errandProxyCategory.id})`);

  // 3. 하위 카테고리 찾기
  const subCategories = categories.filter(c => c.parent_id === errandProxyCategory.id);

  console.log(`\n하위 카테고리 ${subCategories.length}개:`);
  subCategories.forEach(c => console.log(`  - ${c.name}`));

  // 4. 하위 카테고리 삭제
  if (subCategories.length > 0) {
    const subIds = subCategories.map(c => c.id);
    const { error: subError } = await supabase
      .from('categories')
      .delete()
      .in('id', subIds);

    if (subError) {
      console.error('\n하위 카테고리 삭제 실패:', subError);
      return;
    }
    console.log(`\n✓ 하위 카테고리 ${subCategories.length}개 삭제 완료`);
  }

  // 5. "심부름 대행" 카테고리 삭제
  const { error: parentError } = await supabase
    .from('categories')
    .delete()
    .eq('id', errandProxyCategory.id);

  if (parentError) {
    console.error('\n심부름 대행 카테고리 삭제 실패:', parentError);
    return;
  }

  console.log('✓ "심부름 대행" 카테고리 삭제 완료\n');
  console.log('=== 삭제 완료 ===');
})();
