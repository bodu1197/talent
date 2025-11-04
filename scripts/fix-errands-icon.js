require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixErrandsIcon() {
  console.log('심부름 카테고리 아이콘을 running에서 motorcycle로 변경합니다...');

  const { data, error } = await supabase
    .from('categories')
    .update({ icon: 'motorcycle' })
    .eq('slug', 'errands')
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ 업데이트 완료:');
    console.log(JSON.stringify(data, null, 2));
  }
}

fixErrandsIcon();
