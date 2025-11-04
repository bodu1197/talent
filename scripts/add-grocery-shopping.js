require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  // 1. 배달 서비스 카테고리 찾기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('name', '배달 서비스');

  if (!categories || categories.length === 0) {
    console.log('배달 서비스 카테고리를 찾을 수 없습니다.');
    return;
  }

  const deliveryService = categories[0];
  console.log(`부모 카테고리: ${deliveryService.name} (id: ${deliveryService.id})`);

  // 2. 장보기 카테고리 추가
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name: '장보기',
      slug: 'grocery-shopping',
      parent_id: deliveryService.id,
      level: 3,
      icon: 'shopping-cart',
      service_count: 0,
      description: '장보기 및 식료품 구매 대행',
      is_ai: false,
      is_featured: false,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('\n추가 실패:', error);
    return;
  }

  console.log(`✓ "장보기" 카테고리 추가 완료 (id: ${newCategory.id})\n`);
})();
