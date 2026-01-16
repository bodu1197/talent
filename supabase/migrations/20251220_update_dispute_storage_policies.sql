-- 분쟁 시스템: 스토리지 정책 업데이트
-- 작성일: 2025-12-20
-- 기존 initiated_by 기반 정책을 plaintiff_id/defendant_id 기반으로 변경

-- ============================================
-- 1. 기존 분쟁 스토리지 정책 삭제
-- ============================================

DROP POLICY IF EXISTS "Dispute files viewable by participants and admins" ON storage.objects;
DROP POLICY IF EXISTS "Dispute initiators can upload files" ON storage.objects;

-- ============================================
-- 2. 새 분쟁 스토리지 정책 생성
-- ============================================

-- 분쟁 파일 조회: 원고/피고 + 관리자
CREATE POLICY "Dispute files viewable by parties and admins" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'disputes' AND (
      -- 원고 또는 피고인 경우
      EXISTS (
        SELECT 1 FROM disputes
        WHERE id::text = (storage.foldername(objects.name))[1]
        AND (plaintiff_id = auth.uid() OR defendant_id = auth.uid())
      )
      OR
      -- 관리자인 경우
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- 분쟁 파일 업로드: 원고/피고만 (자신의 증거 폴더에)
CREATE POLICY "Dispute parties can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'disputes' AND (
      -- 원고 또는 피고인 경우
      EXISTS (
        SELECT 1 FROM disputes
        WHERE id::text = (storage.foldername(objects.name))[1]
        AND (plaintiff_id = auth.uid() OR defendant_id = auth.uid())
      )
    )
  );

-- 분쟁 파일 삭제: 본인이 올린 파일만
CREATE POLICY "Dispute parties can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'disputes' AND (
      -- 원고 또는 피고이면서 본인이 올린 파일인 경우
      EXISTS (
        SELECT 1 FROM dispute_evidences de
        JOIN disputes d ON de.dispute_id = d.id
        WHERE de.file_url LIKE '%' || objects.name || '%'
        AND de.submitted_by = auth.uid()
        AND (d.plaintiff_id = auth.uid() OR d.defendant_id = auth.uid())
      )
    )
  );

-- ============================================
-- 3. disputes 버킷 생성 (없는 경우)
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'disputes',
  'disputes',
  false,  -- 비공개 버킷
  10485760,  -- 10MB 제한
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4'];
