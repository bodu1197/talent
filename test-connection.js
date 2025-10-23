const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔄 Supabase 연결 테스트 시작...');
console.log('URL:', supabaseUrl);
console.log('Project Ref:', supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1]);

async function testConnection() {
  try {
    // 1. 기본 연결 테스트
    console.log('\n1️⃣ 기본 연결 테스트...');

    // auth.users 테이블로 연결 테스트 (기본 테이블)
    const { data, error } = await supabase.auth.getSession();

    if (!error) {
      console.log('✅ 데이터베이스 연결 성공!');
    } else {
      console.error('❌ 연결 실패:', error.message);
      return;
    }

    // 2. 인증 테스트
    console.log('\n2️⃣ 인증 시스템 테스트...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ 인증 시스템 오류:', authError.message);
    } else {
      console.log('✅ 인증 시스템 정상!');
    }

    // 3. 테이블 존재 여부 확인
    console.log('\n3️⃣ 기존 테이블 확인...');
    const tables = ['users', 'categories', 'services', 'orders'];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error && error.code === 'PGRST116') {
        console.log(`⚠️  테이블 '${table}' 없음 - 생성 필요`);
      } else if (error) {
        console.log(`❌ 테이블 '${table}' 접근 오류:`, error.message);
      } else {
        console.log(`✅ 테이블 '${table}' 존재 (${count || 0}개 레코드)`);
      }
    }

    // 4. Storage 버킷 확인
    console.log('\n4️⃣ Storage 버킷 확인...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('⚠️  Storage 접근 권한 없음 (관리자 권한 필요)');
    } else if (buckets) {
      console.log(`✅ Storage 버킷 ${buckets.length}개 발견`);
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
    }

    console.log('\n🎉 Supabase 연결 테스트 완료!');
    console.log('-----------------------------------');
    console.log('다음 단계:');
    console.log('1. 데이터베이스 스키마 생성');
    console.log('2. RLS (Row Level Security) 정책 설정');
    console.log('3. Storage 버킷 생성');
    console.log('4. Edge Functions 설정 (필요시)');

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
  }
}

testConnection();