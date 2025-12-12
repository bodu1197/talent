require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('========================================');
  console.log('광고 통계 확인');
  console.log('========================================\n');

  // 1. 광고 구독 통계
  const { data: subscriptions } = await supabase
    .from('advertising_subscriptions')
    .select('id, service_id, total_impressions, total_clicks, status')
    .eq('status', 'active');

  console.log('📊 활성 광고 구독 통계:\n');

  let totalImpressions = 0;
  let totalClicks = 0;

  for (const sub of subscriptions || []) {
    // 서비스 정보 가져오기
    const { data: service } = await supabase
      .from('services')
      .select('title')
      .eq('id', sub.service_id)
      .single();

    const ctr = sub.total_impressions > 0
      ? ((sub.total_clicks / sub.total_impressions) * 100).toFixed(2)
      : '0.00';

    console.log(`서비스: ${service?.title || 'Unknown'}`);
    console.log(`  - 노출수: ${sub.total_impressions}`);
    console.log(`  - 클릭수: ${sub.total_clicks}`);
    console.log(`  - CTR: ${ctr}%`);
    console.log('');

    totalImpressions += sub.total_impressions;
    totalClicks += sub.total_clicks;
  }

  const totalCtr = totalImpressions > 0
    ? ((totalClicks / totalImpressions) * 100).toFixed(2)
    : '0.00';

  console.log('========================================');
  console.log('📈 전체 통계:');
  console.log(`  - 총 노출수: ${totalImpressions}`);
  console.log(`  - 총 클릭수: ${totalClicks}`);
  console.log(`  - 평균 CTR: ${totalCtr}%`);
  console.log('========================================\n');

  // 2. 노출 기록 수
  const { count: impressionCount } = await supabase
    .from('advertising_impressions')
    .select('*', { count: 'exact', head: true });

  console.log(`💡 총 노출 기록 수: ${impressionCount || 0}`);

  // 3. 클릭 기록 수
  const { count: clickCount } = await supabase
    .from('advertising_impressions')
    .select('*', { count: 'exact', head: true })
    .eq('clicked', true);

  console.log(`👆 총 클릭 기록 수: ${clickCount || 0}\n`);

  // 4. 가장 최근 노출 기록
  const { data: recentImpressions } = await supabase
    .from('advertising_impressions')
    .select('created_at, clicked')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentImpressions && recentImpressions.length > 0) {
    console.log('🕐 최근 노출 기록 (최근 5개):');
    recentImpressions.forEach((imp, index) => {
      const status = imp.clicked ? '✅ 클릭됨' : '👁️  노출만';
      const time = new Date(imp.created_at).toLocaleString('ko-KR');
      console.log(`  ${index + 1}. ${time} - ${status}`);
    });
  } else {
    console.log('⚠️  노출 기록이 아직 없습니다.');
    console.log('   카테고리 페이지를 방문하면 노출이 기록됩니다.');
  }

  console.log('\n========================================');
  console.log('테스트 방법:');
  console.log('1. http://localhost:3000/categories/technical-seo 방문');
  console.log('2. "추천" 배지가 있는 서비스 카드 확인');
  console.log('3. 해당 서비스 클릭');
  console.log('4. 이 스크립트 다시 실행하여 통계 확인');
  console.log('========================================');
})();
