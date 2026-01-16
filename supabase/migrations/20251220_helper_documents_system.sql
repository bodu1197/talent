-- ============================================
-- 헬퍼 문서 관리 시스템
-- 작성일: 2025-12-20
-- 신분증, 셀카, 범죄경력회보서 업로드 및 검증
-- ============================================

-- ============================================
-- 1. helper_profiles 테이블에 문서 관련 컬럼 추가
-- ============================================

-- 문서 URL 컬럼 추가
ALTER TABLE helper_profiles
ADD COLUMN IF NOT EXISTS id_card_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS criminal_record_url TEXT,
ADD COLUMN IF NOT EXISTS documents_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS documents_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS documents_rejected_reason TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
  CHECK (verification_status IN ('pending', 'submitted', 'verified', 'rejected'));

-- 컬럼 코멘트
COMMENT ON COLUMN helper_profiles.id_card_url IS '신분증 이미지 URL';
COMMENT ON COLUMN helper_profiles.selfie_url IS '본인 얼굴 사진 URL';
COMMENT ON COLUMN helper_profiles.criminal_record_url IS '범죄경력회보서 URL';
COMMENT ON COLUMN helper_profiles.documents_submitted_at IS '서류 제출 시간';
COMMENT ON COLUMN helper_profiles.documents_verified_at IS '서류 검증 완료 시간';
COMMENT ON COLUMN helper_profiles.documents_rejected_reason IS '서류 거부 사유';
COMMENT ON COLUMN helper_profiles.verification_status IS '서류 검증 상태: pending, submitted, verified, rejected';

-- ============================================
-- 2. helper-documents 스토리지 버킷 생성
-- ============================================

-- 버킷 생성 (비공개, 10MB 제한)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'helper-documents',
  'helper-documents',
  false,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- ============================================
-- 3. 스토리지 RLS 정책
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Helper documents upload by owner" ON storage.objects;
DROP POLICY IF EXISTS "Helper documents view by owner and admin" ON storage.objects;
DROP POLICY IF EXISTS "Helper documents delete by owner" ON storage.objects;

-- 업로드 정책: 본인만 자신의 폴더에 업로드 가능
CREATE POLICY "Helper documents upload by owner" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'helper-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 조회 정책: 본인 또는 관리자만 조회 가능
CREATE POLICY "Helper documents view by owner and admin" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'helper-documents' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    )
  );

-- 삭제 정책: 본인만 삭제 가능 (검증 전까지)
CREATE POLICY "Helper documents delete by owner" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'helper-documents' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    NOT EXISTS (
      SELECT 1 FROM helper_profiles
      WHERE user_id = auth.uid()
      AND verification_status = 'verified'
    )
  );

-- ============================================
-- 4. 문서 검증 알림 함수
-- ============================================

-- 헬퍼 문서 제출 시 관리자에게 알림
CREATE OR REPLACE FUNCTION notify_helper_documents_submitted()
RETURNS TRIGGER AS $$
BEGIN
  -- 문서가 제출되었을 때만 (status가 submitted로 변경)
  IF NEW.verification_status = 'submitted' AND
     (OLD.verification_status IS NULL OR OLD.verification_status != 'submitted') THEN

    -- 관리자들에게 알림
    INSERT INTO notifications (user_id, type, title, body, data, is_read, created_at)
    SELECT
      p.user_id,
      'helper_verification',
      '[관리자] 헬퍼 서류 검토 요청',
      '새로운 헬퍼 등록 서류가 제출되었습니다. 검토가 필요합니다.',
      jsonb_build_object(
        'helper_profile_id', NEW.id,
        'helper_user_id', NEW.user_id,
        'link', '/admin/helpers/' || NEW.id
      ),
      false,
      NOW()
    FROM profiles p
    WHERE p.role = 'admin';
  END IF;

  -- 문서가 검증/거부되었을 때 헬퍼에게 알림
  IF NEW.verification_status IN ('verified', 'rejected') AND
     OLD.verification_status != NEW.verification_status THEN

    INSERT INTO notifications (user_id, type, title, body, data, is_read, created_at)
    VALUES (
      NEW.user_id,
      'helper_verification',
      CASE NEW.verification_status
        WHEN 'verified' THEN '헬퍼 등록이 승인되었습니다'
        WHEN 'rejected' THEN '헬퍼 등록이 반려되었습니다'
      END,
      CASE NEW.verification_status
        WHEN 'verified' THEN '축하합니다! 이제 심부름 수행이 가능합니다.'
        WHEN 'rejected' THEN COALESCE(NEW.documents_rejected_reason, '서류를 다시 제출해주세요.')
      END,
      jsonb_build_object('link', '/errands/mypage/helper'),
      false,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_helper_documents_status_change ON helper_profiles;
CREATE TRIGGER on_helper_documents_status_change
  AFTER UPDATE ON helper_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_helper_documents_submitted();

-- ============================================
-- 완료
-- ============================================
