require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAICategories() {
  // 1. AI 서비스 최상위 카테고리 찾기
  const { data: aiService, error: error1 } = await supabase
    .from('categories')
    .select('id, name, slug, icon, display_order, level')
    .eq('slug', 'ai-services')
    .single();

  if (error1) {
    console.error('Error:', error1);
    return;
  }

  console.log('='.repeat(80));
  console.log('AI 서비스 카테고리 구조');
  console.log('='.repeat(80));
  console.log(`\n[1단계] ${aiService.name} (${aiService.slug})`);
  console.log(`  - display_order: ${aiService.display_order}`);

  // 2. 2단계 카테고리들 (AI 서비스의 자식)
  const { data: level2Categories, error: error2 } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, display_order, level')
    .eq('parent_id', aiService.id)
    .eq('is_active', true)
    .order('display_order')
    .order('name');

  if (error2) {
    console.error('Error:', error2);
    return;
  }

  console.log(`\n[2단계 카테고리] 총 ${level2Categories.length}개:`);

  for (const level2 of level2Categories) {
    console.log(`\n  ├─ ${level2.name} (${level2.slug})`);
    console.log(`  │   display_order: ${level2.display_order}`);

    // 3. 3단계 카테고리들 (2단계의 자식)
    const { data: level3Categories } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id, display_order, level')
      .eq('parent_id', level2.id)
      .eq('is_active', true)
      .order('display_order')
      .order('name');

    if (level3Categories && level3Categories.length > 0) {
      console.log(`  │   [3단계] ${level3Categories.length}개:`);
      level3Categories.forEach((level3, index) => {
        const isLast = index === level3Categories.length - 1;
        const prefix = isLast ? '  │   └─' : '  │   ├─';
        console.log(`${prefix} ${level3.name} (${level3.slug})`);
        console.log(`  │   ${isLast ? ' ' : '│'}   display_order: ${level3.display_order}`);
      });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('정렬 방법:');
  console.log('각 레벨별로 display_order 값을 설정하면 원하는 순서로 정렬됩니다.');
  console.log('예: UPDATE categories SET display_order = 1 WHERE slug = \'원하는슬러그\';');
  console.log('='.repeat(80));
}

getAICategories();
