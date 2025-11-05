const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data } = await supabase
    .from('categories')
    .select('name, slug, display_order')
    .eq('level', 1)
    .order('display_order');

  console.log('='.repeat(60));
  console.log('1차 카테고리 순서 (display_order):');
  console.log('='.repeat(60));
  data.forEach((c, idx) => {
    console.log(`[${c.display_order}] ${c.name} (${c.slug})`);
  });
  console.log('');
  console.log(`총 ${data.length}개`);
})();
