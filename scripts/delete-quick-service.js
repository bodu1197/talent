require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  // 약 배달 카테고리 찾기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('name', '약 배달');

  if (!categories || categories.length === 0) {
    console.log('약 배달 카테고리를 찾을 수 없습니다.');
    return;
  }

  const medicineCat = categories[0];
  console.log(`삭제할 카테고리: ${medicineCat.name} (id: ${medicineCat.id})`);

  // 삭제
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', medicineCat.id);

  if (error) {
    console.error('\n삭제 실패:', error);
    return;
  }

  console.log('✓ "약 배달" 카테고리 삭제 완료\n');
})();
