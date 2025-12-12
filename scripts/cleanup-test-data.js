const { createClient } = require('@supabase/supabase-js');

const _supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const _supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupTestData() {
  console.log('🧹 테스트 데이터 정리 시작\n');

  // 1. test-uploads 버킷 확인
  console.log('1️⃣ test-uploads 버킷 확인 중...');
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log(`  ⚠️  버킷 조회 실패: ${bucketsError.message}`);
      return;
    }

    const testBucket = buckets.find(b => b.name === 'test-uploads');

    if (!testBucket) {
      console.log('  ℹ️  test-uploads 버킷이 존재하지 않습니다.');
    } else {
      console.log('  ✅ test-uploads 버킷 발견');

      // 2. 버킷 내 파일 목록 조회
      console.log('\n2️⃣ 버킷 내 파일 조회 중...');
      const { data: files, error: listError } = await supabase.storage
        .from('test-uploads')
        .list();

      if (listError) {
        console.log(`  ⚠️  파일 목록 조회 실패: ${listError.message}`);
      } else if (files && files.length > 0) {
        console.log(`  ✅ ${files.length}개 파일 발견:`);
        files.forEach(file => {
          console.log(`     - ${file.name} (${file.metadata?.size || 0} bytes)`);
        });

        // 3. 파일 삭제
        console.log('\n3️⃣ 파일 삭제 중...');
        const fileNames = files.map(f => f.name);
        const { data: removeData, error: removeError } = await supabase.storage
          .from('test-uploads')
          .remove(fileNames);

        if (removeError) {
          console.log(`  ⚠️  파일 삭제 실패: ${removeError.message}`);
        } else {
          console.log(`  ✅ ${fileNames.length}개 파일 삭제 완료`);
        }
      } else {
        console.log('  ℹ️  버킷이 비어있습니다.');
      }

      // 4. 버킷 삭제
      console.log('\n4️⃣ test-uploads 버킷 삭제 중...');
      const { data: deleteBucket, error: deleteError } = await supabase.storage
        .deleteBucket('test-uploads');

      if (deleteError) {
        console.log(`  ⚠️  버킷 삭제 실패: ${deleteError.message}`);
      } else {
        console.log('  ✅ test-uploads 버킷 삭제 완료');
      }
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
  }

  // 5. 테스트 사용자 데이터 확인 및 삭제
  console.log('\n5️⃣ 테스트 사용자 데이터 확인 중...');
  const testUserId = '00000000-0000-0000-0000-000000000001';

  try {
    const { data: testUser, error: selectError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', testUserId)
      .maybeSingle();

    if (selectError) {
      console.log(`  ⚠️  조회 실패: ${selectError.message}`);
    } else if (testUser) {
      console.log(`  ✅ 테스트 사용자 발견: ${testUser.name} (${testUser.email})`);

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', testUserId);

      if (deleteError) {
        console.log(`  ⚠️  삭제 실패: ${deleteError.message}`);
      } else {
        console.log('  ✅ 테스트 사용자 삭제 완료');
      }
    } else {
      console.log('  ℹ️  테스트 사용자 데이터가 존재하지 않습니다.');
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
  }

  console.log('\n✅ 정리 완료!\n');
}

cleanupTestData();
