require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('='.repeat(80));
  console.log('데이터베이스 테이블 구조 분석');
  console.log('='.repeat(80));

  // 1. categories 테이블 구조
  console.log('\n1. categories 테이블 샘플:');
  const { data: categorySample } = await supabase
    .from('categories')
    .select('*')
    .limit(1);

  if (categorySample && categorySample.length > 0) {
    console.log('컬럼:', Object.keys(categorySample[0]).join(', '));
  }

  // 2. services 테이블 구조
  console.log('\n2. services 테이블 샘플:');
  const { data: serviceSample } = await supabase
    .from('services')
    .select('*')
    .limit(1);

  if (serviceSample && serviceSample.length > 0) {
    console.log('컬럼:', Object.keys(serviceSample[0]).join(', '));
  }

  // 3. service_categories 테이블 확인
  console.log('\n3. service_categories 테이블:');
  const { data: serviceCategoriesSample, error: scError } = await supabase
    .from('service_categories')
    .select('*')
    .limit(5);

  if (scError) {
    console.log('Error:', scError.message);
  } else if (serviceCategoriesSample) {
    console.log('컬럼:', serviceCategoriesSample.length > 0 ? Object.keys(serviceCategoriesSample[0]).join(', ') : 'No data');
    console.log('샘플 데이터:');
    serviceCategoriesSample.forEach(sc => {
      console.log('  -', JSON.stringify(sc));
    });
  }

  // 4. AI 카테고리를 사용하는 서비스 개수 확인
  console.log('\n4. AI 카테고리를 사용하는 서비스 확인:');

  // AI 서비스 ID 가져오기
  const { data: aiServices } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'ai-services')
    .single();

  if (aiServices) {
    // AI 서비스의 모든 하위 카테고리 ID 가져오기
    const { data: aiChildCategories } = await supabase
      .from('categories')
      .select('id, name, slug, level')
      .or(`parent_id.eq.${aiServices.id},id.eq.${aiServices.id}`);

    console.log(`AI 관련 카테고리: ${aiChildCategories?.length}개`);

    // 2단계 카테고리들의 ID 가져오기
    const level2Ids = aiChildCategories?.filter(c => c.level === 2).map(c => c.id) || [];

    if (level2Ids.length > 0) {
      // 3단계 카테고리들의 ID 가져오기
      const { data: level3Categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .in('parent_id', level2Ids);

      const allAiCategoryIds = [
        aiServices.id,
        ...level2Ids,
        ...(level3Categories?.map(c => c.id) || [])
      ];

      console.log(`전체 AI 카테고리 ID 개수: ${allAiCategoryIds.length}개`);

      // service_categories 테이블에서 AI 카테고리를 사용하는 서비스 확인
      const { data: relatedServices, count } = await supabase
        .from('service_categories')
        .select('service_id, category_id', { count: 'exact' })
        .in('category_id', allAiCategoryIds);

      console.log(`AI 카테고리를 사용하는 서비스-카테고리 연결: ${count}개`);

      if (relatedServices && relatedServices.length > 0) {
        console.log('샘플 5개:');
        relatedServices.slice(0, 5).forEach(rs => {
          console.log(`  - service_id: ${rs.service_id}, category_id: ${rs.category_id}`);
        });
      }
    }
  }

  // 5. services 테이블의 category_id 확인 (만약 있다면)
  console.log('\n5. services 테이블에 category 관련 컬럼 확인:');
  const { data: serviceWithCategory } = await supabase
    .from('services')
    .select('id, title, category_id')
    .not('category_id', 'is', null)
    .limit(3);

  if (serviceWithCategory && serviceWithCategory.length > 0) {
    console.log('services 테이블에 category_id 컬럼 존재:');
    serviceWithCategory.forEach(s => {
      console.log(`  - ${s.title}: category_id = ${s.category_id}`);
    });
  } else {
    console.log('services 테이블에 category_id 없거나 모두 null');
  }

  console.log('\n' + '='.repeat(80));
}

checkTableStructure();
