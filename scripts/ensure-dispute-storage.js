const { createClient } = require('@supabase/supabase-js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: '.env.local' });

// Supabase 관리자 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBucket() {
  console.log('Checking disputes storage bucket...');

  // 1. 버킷 존재 여부 확인
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const disputesBucket = buckets.find(b => b.name === 'disputes');

  if (disputesBucket) {
    console.log('✅ "disputes" bucket already exists.');
  } else {
    console.log('Creating "disputes" bucket...');
    const { data, error: createError } = await supabase.storage.createBucket('disputes', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      return;
    }
    console.log('✅ "disputes" bucket created successfully.');
  }

  // 2. 스토리지 정책 설정 (SQL 실행)
  // 주의: Supabase Client로는 정책 설정이 제한적일 수 있으므로, 
  // 여기서는 안내 메시지만 출력하고 실제 정책은 마이그레이션 파일 또는 대시보드에서 설정해야 함을 알림.
  // 하지만 postgres function을 통해 실행 가능하다면 시도해볼 수 있음.
  // 여기서는 가장 확실한 방법인 SQL 파일을 생성하여 마이그레이션으로 안내하는 방식을 택함.
  
  console.log('\n⚠️ Storage policies must be set via SQL.');
  console.log('Please insure the following policies are applied (included in recent migrations):');
  console.log(`
    -- 분쟁 증거 스토리지 정책
    INSERT INTO storage.buckets (id, name, public) VALUES ('disputes', 'disputes', true)
    ON CONFLICT (id) DO NOTHING;

    CREATE POLICY "Dispute Public Access" ON storage.objects FOR SELECT
    USING ( bucket_id = 'disputes' );

    CREATE POLICY "Dispute Upload Access" ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'disputes' AND auth.role() = 'authenticated' );
  `);
}

createStorageBucket();
