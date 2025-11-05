const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  // 모든 1차 카테고리 가져오기
  const { data: level1 } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('level', 1)
    .order('display_order');

  console.log('='.repeat(80));
  console.log('모든 2차 카테고리 display_order 확인');
  console.log('='.repeat(80));
  console.log('');

  for (const cat1 of level1) {
    const { data: level2 } = await supabase
      .from('categories')
      .select('name, slug, display_order')
      .eq('parent_id', cat1.id)
      .eq('level', 2)
      .order('display_order');

    if (level2.length > 0) {
      console.log(`\n📁 ${cat1.name} (${level2.length}개)`);
      console.log('-'.repeat(80));

      level2.forEach((c, idx) => {
        const isEtc = c.slug.includes('etc') || c.name.includes('기타');
        const marker = isEtc ? ' ⚠️  기타!' : '';
        const position = idx === 0 ? ' [첫번째!]' :
                        idx === 1 ? ' [두번째!]' :
                        idx === level2.length - 1 ? ' ✅ [마지막]' : ' [중간]';
        console.log(`  [${c.display_order}] ${c.name}${isEtc ? position : ''}${marker}`);
      });
    }
  }
})();
