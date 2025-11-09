-- Add seller profile fields
ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS profile_image text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS show_phone boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kakao_id text,
ADD COLUMN IF NOT EXISTS kakao_openchat text,
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS preferred_contact text[],
ADD COLUMN IF NOT EXISTS certificates text,
ADD COLUMN IF NOT EXISTS experience text,
ADD COLUMN IF NOT EXISTS is_business boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_review';

-- Add constraint for status
ALTER TABLE sellers
DROP CONSTRAINT IF EXISTS sellers_status_check;

ALTER TABLE sellers
ADD CONSTRAINT sellers_status_check
CHECK (status IN ('pending_review', 'active', 'suspended', 'rejected'));

-- Update verification_status to align with new status field
COMMENT ON COLUMN sellers.status IS '판매자 상태: pending_review(승인대기), active(활동중), suspended(정지), rejected(거부)';
COMMENT ON COLUMN sellers.display_name IS '판매자 활동명 (공개)';
COMMENT ON COLUMN sellers.bio IS '판매자 소개';
COMMENT ON COLUMN sellers.phone IS '연락처 (내부용, RLS로 보호)';
COMMENT ON COLUMN sellers.show_phone IS '연락처 공개 여부';
COMMENT ON COLUMN sellers.preferred_contact IS '선호 연락 방법 배열';
