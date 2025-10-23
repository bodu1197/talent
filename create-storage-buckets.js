const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// 서비스 키가 필요한 경우 Supabase 대시보드에서 설정 필요
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBuckets() {
  console.log('🗂️ Storage 버킷 생성 시작...\n');

  // 생성할 버킷 목록
  const buckets = [
    {
      name: 'profiles',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      description: '사용자 프로필 이미지'
    },
    {
      name: 'services',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'],
      description: '서비스 썸네일 및 포트폴리오'
    },
    {
      name: 'portfolios',
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm',
        'application/pdf'
      ],
      description: 'AI 작품 포트폴리오'
    },
    {
      name: 'orders',
      public: false,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: null, // 모든 파일 타입 허용
      description: '주문 관련 파일 (비공개)'
    },
    {
      name: 'messages',
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: null,
      description: '메시지 첨부 파일 (비공개)'
    },
    {
      name: 'reviews',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      description: '리뷰 이미지'
    },
    {
      name: 'disputes',
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: null,
      description: '분쟁 증거 자료 (비공개)'
    }
  ];

  console.log('📋 생성할 버킷 목록:\n');
  buckets.forEach(bucket => {
    console.log(`  - ${bucket.name} (${bucket.public ? '공개' : '비공개'})`);
  });

  console.log('\n⚠️  주의: Storage 버킷은 Supabase 대시보드에서 직접 생성해야 합니다.\n');
  console.log('생성 방법:');
  console.log('1. Supabase 대시보드로 이동: https://app.supabase.com');
  console.log('2. 프로젝트 선택 > Storage 메뉴 클릭');
  console.log('3. "New bucket" 버튼 클릭');
  console.log('4. 아래 설정으로 각 버킷 생성:\n');

  buckets.forEach((bucket, index) => {
    console.log(`${index + 1}. ${bucket.name} 버킷:`);
    console.log(`   - Name: ${bucket.name}`);
    console.log(`   - Public: ${bucket.public ? 'Yes' : 'No'}`);
    console.log(`   - File size limit: ${bucket.fileSizeLimit / 1048576}MB`);
    if (bucket.allowedMimeTypes) {
      console.log(`   - Allowed MIME types: ${bucket.allowedMimeTypes.join(', ')}`);
    }
    console.log(`   - 용도: ${bucket.description}\n`);
  });

  // 버킷 정책 SQL 생성
  console.log('----------------------------------------');
  console.log('📝 버킷 생성 후 실행할 Storage 정책 SQL:\n');

  generateStoragePolicies();
}

function generateStoragePolicies() {
  const policiesSQL = `
-- ============================================
-- Storage 버킷 정책 설정
-- ============================================

-- 1. profiles 버킷 정책
-- 모든 사용자가 프로필 이미지 조회 가능
CREATE POLICY "Public profiles are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- 본인 프로필 이미지만 업로드 가능
CREATE POLICY "Users can upload own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 본인 프로필 이미지만 수정 가능
CREATE POLICY "Users can update own profile image"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 본인 프로필 이미지만 삭제 가능
CREATE POLICY "Users can delete own profile image"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. services 버킷 정책
-- 모든 사용자가 서비스 이미지 조회 가능
CREATE POLICY "Service images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'services');

-- 판매자만 서비스 이미지 업로드 가능
CREATE POLICY "Sellers can upload service images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'services'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type IN ('seller', 'both')
  )
);

-- 본인 서비스 이미지만 수정 가능
CREATE POLICY "Sellers can update own service images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'services'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. portfolios 버킷 정책
-- 모든 사용자가 포트폴리오 조회 가능
CREATE POLICY "Portfolios are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

-- 판매자만 포트폴리오 업로드 가능
CREATE POLICY "Sellers can upload portfolios"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolios'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type IN ('seller', 'both')
  )
);

-- 4. orders 버킷 정책 (비공개)
-- 주문 관련자만 파일 조회 가능
CREATE POLICY "Order files viewable by participants"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'orders'
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE id::text = (storage.foldername(name))[1]
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- 주문 관련자만 파일 업로드 가능
CREATE POLICY "Order participants can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'orders'
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE id::text = (storage.foldername(name))[1]
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- 5. messages 버킷 정책 (비공개)
-- 대화 참여자만 파일 조회 가능
CREATE POLICY "Message files viewable by participants"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'messages'
  AND EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id::text = (storage.foldername(name))[1]
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  )
);

-- 대화 참여자만 파일 업로드 가능
CREATE POLICY "Conversation participants can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'messages'
  AND EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id::text = (storage.foldername(name))[1]
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  )
);

-- 6. reviews 버킷 정책
-- 모든 사용자가 리뷰 이미지 조회 가능
CREATE POLICY "Review images are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'reviews');

-- 구매자만 리뷰 이미지 업로드 가능
CREATE POLICY "Buyers can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reviews'
  AND EXISTS (
    SELECT 1 FROM public.reviews
    WHERE id::text = (storage.foldername(name))[1]
    AND buyer_id = auth.uid()
  )
);

-- 7. disputes 버킷 정책 (비공개)
-- 분쟁 관련자와 관리자만 조회 가능
CREATE POLICY "Dispute files viewable by participants and admins"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'disputes'
  AND (
    EXISTS (
      SELECT 1 FROM public.disputes
      WHERE id::text = (storage.foldername(name))[1]
      AND initiated_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  )
);

-- 분쟁 신청자만 파일 업로드 가능
CREATE POLICY "Dispute initiators can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'disputes'
  AND EXISTS (
    SELECT 1 FROM public.disputes
    WHERE id::text = (storage.foldername(name))[1]
    AND initiated_by = auth.uid()
  )
);
`;

  console.log(policiesSQL);

  // SQL 파일로 저장
  const fs = require('fs');
  const path = require('path');

  const filePath = path.join(__dirname, 'supabase', 'migrations', '004_storage_policies.sql');
  fs.writeFileSync(filePath, policiesSQL);

  console.log(`\n✅ Storage 정책 SQL이 저장되었습니다: ${filePath}`);
}

// 현재 버킷 상태 확인
async function checkBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log('\n⚠️  버킷 목록을 가져올 수 없습니다 (관리자 권한 필요)');
      return;
    }

    if (buckets && buckets.length > 0) {
      console.log('\n📦 현재 존재하는 버킷:');
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? '공개' : '비공개'})`);
      });
    } else {
      console.log('\n📦 현재 생성된 버킷이 없습니다.');
    }
  } catch (error) {
    console.log('\n⚠️  버킷 확인 중 오류:', error.message);
  }
}

// 메인 실행
async function main() {
  await checkBuckets();
  console.log('\n========================================\n');
  await createStorageBuckets();
}

main().catch(console.error);