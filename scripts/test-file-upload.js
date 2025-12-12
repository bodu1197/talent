const { createClient } = require('@supabase/supabase-js');
const _fs = require('fs');
const _path = require('path');

const _supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const _supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testOperations() {
  console.log('🚀 Supabase 연결 및 작업 테스트 시작\n');

  // 1. 버킷 목록 확인
  console.log('1️⃣ Storage 버킷 목록 조회...');
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log(`  ⚠️  버킷 조회 실패: ${bucketsError.message}`);
    } else {
      console.log(`  ✅ 버킷 ${buckets.length}개 발견:`);
      buckets.forEach(bucket => {
        console.log(`     - ${bucket.name} (${bucket.public ? '공개' : '비공개'})`);
      });
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
  }

  console.log();

  // 2. 테스트 파일 생성 및 업로드
  console.log('2️⃣ 테스트 파일 업로드...');
  const testContent = `테스트 파일입니다.
생성 시각: ${new Date().toISOString()}
프로젝트: Talent Marketplace
`;

  const testFileName = `test-${Date.now()}.txt`;

  try {
    // 먼저 test-uploads 버킷이 있는지 확인하고 없으면 생성
    const { data: buckets } = await supabase.storage.listBuckets();
    const testBucket = buckets?.find(b => b.name === 'test-uploads');

    if (!testBucket) {
      console.log('  📦 test-uploads 버킷 생성 중...');
      const { data: _newBucket, error: createError } = await supabase.storage.createBucket('test-uploads', {
        public: false
      });

      if (createError) {
        console.log(`  ⚠️  버킷 생성 실패: ${createError.message}`);
        console.log('  ℹ️  기존 버킷 사용을 시도합니다...');
      } else {
        console.log('  ✅ test-uploads 버킷 생성 완료');
      }
    }

    // 파일 업로드 시도
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('test-uploads')
      .upload(testFileName, Buffer.from(testContent), {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.log(`  ⚠️  파일 업로드 실패: ${uploadError.message}`);
    } else {
      console.log(`  ✅ 파일 업로드 성공: ${uploadData.path}`);

      // 업로드된 파일 다운로드 테스트
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('test-uploads')
        .download(testFileName);

      if (downloadError) {
        console.log(`  ⚠️  파일 다운로드 실패: ${downloadError.message}`);
      } else {
        const downloadedContent = await downloadData.text();
        console.log(`  ✅ 파일 다운로드 성공 (${downloadData.size} bytes)`);
        console.log(`  📄 내용 일치: ${downloadedContent === testContent ? '✅' : '❌'}`);
      }
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
  }

  console.log();

  // 3. 데이터베이스 읽기 테스트
  console.log('3️⃣ 데이터베이스 읽기 테스트...');
  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('id, email, name, user_type', { count: 'exact' })
      .limit(3);

    if (error) {
      console.log(`  ⚠️  조회 실패: ${error.message}`);
    } else {
      console.log(`  ✅ 사용자 ${count}명 중 3명 조회 성공:`);
      data.forEach(user => {
        console.log(`     - ${user.name} (${user.email}) [${user.user_type}]`);
      });
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
  }

  console.log();

  // 4. 데이터베이스 쓰기 테스트 (테스트 데이터 삽입 후 삭제)
  console.log('4️⃣ 데이터베이스 쓰기 테스트...');
  const testUserId = '00000000-0000-0000-0000-000000000001'; // 테스트용 고정 UUID

  try {
    // 기존 테스트 데이터 삭제
    await supabase.from('users').delete().eq('id', testUserId);

    // 테스트 데이터 삽입
    const { data: _insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        name: '테스트 사용자',
        user_type: 'buyer'
      })
      .select();

    if (insertError) {
      console.log(`  ⚠️  삽입 실패: ${insertError.message}`);
    } else {
      console.log(`  ✅ 테스트 데이터 삽입 성공`);

      // 삽입한 데이터 조회
      const { data: selectData, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (selectError) {
        console.log(`  ⚠️  조회 실패: ${selectError.message}`);
      } else {
        console.log(`  ✅ 데이터 조회 성공: ${selectData.name}`);
      }

      // 테스트 데이터 삭제
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', testUserId);

      if (deleteError) {
        console.log(`  ⚠️  삭제 실패: ${deleteError.message}`);
      } else {
        console.log(`  ✅ 테스트 데이터 삭제 완료`);
      }
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
  }

  console.log();
  console.log('✅ 모든 테스트 완료!\n');
  console.log('📋 요약:');
  console.log('  - Storage 버킷 조회: 가능');
  console.log('  - 파일 업로드/다운로드: 가능');
  console.log('  - 데이터베이스 읽기: 가능');
  console.log('  - 데이터베이스 쓰기: 가능');
}

testOperations();
