const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function apply1stReorder() {
  console.log('='.repeat(60));
  console.log('1차 카테고리 재정렬 실행 중...');
  console.log('='.repeat(60));
  console.log('');

  const updates = [
    { slug: 'ai-services', order: 1 },           // AI 서비스 (최신 트렌드)
    { slug: 'it-programming', order: 2 },        // IT/프로그래밍 (높은 수요)
    { slug: 'design', order: 3 },                // 디자인 (높은 수요)
    { slug: 'video-photo', order: 4 },           // 영상/사진 (인기)
    { slug: 'marketing', order: 5 },             // 마케팅 (비즈니스 필수)
    { slug: 'writing', order: 6 },               // 문서/글쓰기 (수요 많음)
    { slug: 'translation', order: 7 },           // 번역/통역 (전문 분야)
    { slug: 'music-audio', order: 8 },           // 음악/오디오 (크리에이티브)
    { slug: 'business', order: 9 },              // 비즈니스 (기업 대상)
    { slug: 'tax-legal-labor', order: 10 },      // 세무/법무/노무 (전문 서비스)
    { slug: 'counseling-coaching', order: 11 },  // 상담/코칭 (개인 성장)
    { slug: 'career-admission', order: 12 },     // 취업/입시 (교육)
    { slug: 'job-skills', order: 13 },           // 직무역량 (업무 스킬)
    { slug: 'life-service', order: 14 },         // 생활 서비스 (일상)
    { slug: 'errands', order: 15 },              // 심부름 (편의)
    { slug: 'custom-order', order: 16 },         // 주문제작 (맞춤)
    { slug: 'ebook-template', order: 17 },       // 전자책/템플릿 (디지털 상품)
    { slug: 'hobby-handmade', order: 18 },       // 취미/핸드메이드 (취미)
    { slug: 'beauty-fashion', order: 19 },       // 뷰티/패션 (라이프스타일)
    { slug: 'event', order: 20 },                // 이벤트 (행사)
    { slug: 'fortune-tarot', order: 21 },        // 운세/타로 (특수)
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const item of updates) {
    const { data, error } = await supabase
      .from('categories')
      .update({ display_order: item.order })
      .eq('slug', item.slug)
      .eq('level', 1)
      .select();

    if (error) {
      console.error(`❌ Error updating ${item.slug}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ [${item.order}] ${item.slug} → ${data[0]?.display_order}`);
      successCount++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ 완료!');
  console.log(`📊 성공: ${successCount}개`);
  if (errorCount > 0) {
    console.log(`❌ 실패: ${errorCount}개`);
  }
  console.log('='.repeat(60));

  // 확인
  console.log('');
  console.log('재정렬된 1차 카테고리:');
  console.log('-'.repeat(60));

  const { data } = await supabase
    .from('categories')
    .select('name, slug, display_order')
    .eq('level', 1)
    .order('display_order');

  data.forEach(c => {
    console.log(`[${c.display_order}] ${c.name}`);
  });
}

apply1stReorder();
