require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

async function fixErrandsIcon() {
  console.log('심부름 카테고리 아이콘을 motorcycle로 변경합니다...\n');

  // PATCH 요청으로 업데이트
  const response = await fetch(`${supabaseUrl}/rest/v1/categories?slug=eq.errands`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ icon: 'motorcycle' })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error:', error);
    return;
  }

  const data = await response.json();
  console.log('✅ 업데이트 완료:');
  console.log(JSON.stringify(data, null, 2));

  // 확인
  console.log('\n확인 중...');
  const checkResponse = await fetch(`${supabaseUrl}/rest/v1/categories?slug=eq.errands`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const checkData = await checkResponse.json();
  console.log('현재 상태:');
  console.log(JSON.stringify(checkData, null, 2));
}

fixErrandsIcon();
