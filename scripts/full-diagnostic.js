const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fullDiagnostic() {
  console.log('='.repeat(80));
  console.log('전체 진단 시작');
  console.log('='.repeat(80));
  console.log('');

  // 1. 환경 변수 확인
  console.log('1. 환경 변수:');
  console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) + '...');
  console.log('   ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 40) + '...');
  console.log('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 2. 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  console.log('2. 인증 상태:');
  if (authError) {
    console.log('   ❌ 인증 에러:', authError.message);
    return;
  }

  if (!user) {
    console.log('   ❌ 로그인 안 됨');
    console.log('   → 브라우저에서 로그인 후 다시 실행');
    return;
  }

  console.log('   ✅ User ID:', user.id);
  console.log('   ✅ Email:', user.email);
  console.log('');

  // 3. category_visits 테이블 확인
  console.log('3. category_visits 테이블:');
  const { data: visits, error: visitsError } = await supabase
    .from('category_visits')
    .select('*')
    .eq('user_id', user.id)
    .order('visited_at', { ascending: false })
    .limit(10);

  if (visitsError) {
    console.log('   ❌ 조회 에러:', visitsError.message);
    console.log('   → RLS 정책 문제일 수 있음');
  } else {
    console.log('   ✅ 방문 기록 개수:', visits.length);
    if (visits.length > 0) {
      console.log('   최근 방문:');
      visits.forEach(v => {
        console.log(`     - ${v.category_name} (${v.visited_at})`);
      });
    } else {
      console.log('   ⚠️  방문 기록 없음');
    }
  }
  console.log('');

  // 4. INSERT 테스트
  console.log('4. INSERT 테스트:');
  const testData = {
    user_id: user.id,
    category_id: 'test-id-' + Date.now(),
    category_name: '테스트 카테고리',
    category_slug: 'test-category',
    visited_at: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase
    .from('category_visits')
    .insert(testData)
    .select()
    .single();

  if (insertError) {
    console.log('   ❌ INSERT 실패:', insertError.message);
    console.log('   → RLS 정책:', insertError.code);
  } else {
    console.log('   ✅ INSERT 성공, ID:', insertData.id);

    // 삭제
    await supabase
      .from('category_visits')
      .delete()
      .eq('id', insertData.id);
    console.log('   ✅ 테스트 데이터 삭제 완료');
  }
  console.log('');

  // 5. RPC 함수 테스트
  console.log('5. RPC 함수 테스트:');
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_recent_category_visits', {
      p_user_id: user.id,
      p_days: 30,
      p_limit: 10
    });

  if (rpcError) {
    console.log('   ❌ RPC 에러:', rpcError.message);
  } else {
    console.log('   ✅ RPC 성공, 카테고리 개수:', rpcData?.length || 0);
    if (rpcData && rpcData.length > 0) {
      rpcData.forEach(c => {
        console.log(`     - ${c.category_name} (방문 ${c.visit_count}회)`);
      });
    }
  }
  console.log('');

  console.log('='.repeat(80));
  console.log('진단 완료');
  console.log('='.repeat(80));
}

fullDiagnostic().catch(console.error);
