const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkCategoryLevels() {
  console.log('='.repeat(80));
  console.log('카테고리 레벨 확인');
  console.log('='.repeat(80));

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 방문한 카테고리 목록
  const visitedSlugs = [
    'ai-services',
    'aircon-cleaning',
    'keyword-search-ads',
    'marketing',
    'subtitle-translation',
    'dubbing',
    'errands',
    'deep-cleaning',
    'office-cleaning',
    'design'
  ];

  console.log('\n방문한 카테고리들의 레벨 정보:\n');

  for (const slug of visitedSlugs) {
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id, level')
      .eq('slug', slug)
      .single();

    if (!category) {
      console.log(`❌ ${slug}: 카테고리 없음`);
      continue;
    }

    let actualLevel = category.level || 'level 필드 없음';

    // level 필드가 없으면 parent_id로 판단
    if (!category.level) {
      if (!category.parent_id) {
        actualLevel = '1차 (parent 없음)';
      } else {
        const { data: parent } = await supabase
          .from('categories')
          .select('parent_id')
          .eq('id', category.parent_id)
          .single();

        if (!parent?.parent_id) {
          actualLevel = '2차 (parent의 parent 없음)';
        } else {
          actualLevel = '3차 (parent의 parent 있음)';
        }
      }
    }

    console.log(`${category.name.padEnd(20)} | slug: ${slug.padEnd(25)} | level: ${actualLevel}`);
  }

  console.log('\n' + '='.repeat(80));
}

checkCategoryLevels().catch(console.error);
