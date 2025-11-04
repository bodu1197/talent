require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkErrandsIcon() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, level, parent_id')
    .eq('slug', 'errands')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('심부름 카테고리:');
    console.log(JSON.stringify(data, null, 2));
  }

  // 모든 1단계 카테고리 확인
  console.log('\n\n모든 1단계 카테고리:');
  const { data: allCategories, error: error2 } = await supabase
    .from('categories')
    .select('id, name, slug, icon, level')
    .eq('level', 1)
    .eq('is_active', true)
    .order('name');

  if (error2) {
    console.error('Error:', error2);
  } else {
    allCategories.forEach(cat => {
      console.log(`${cat.name.padEnd(20)} | icon: ${cat.icon || '없음'} | slug: ${cat.slug}`);
    });
  }
}

checkErrandsIcon();
