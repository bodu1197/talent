-- CHECK CONSTRAINT 먼저 수정
ALTER TABLE public.services
DROP CONSTRAINT IF EXISTS services_status_check;

ALTER TABLE public.services
ADD CONSTRAINT services_status_check
CHECK (status IN ('draft', 'pending', 'active', 'inactive', 'rejected', 'suspended'));

-- 기존 draft 상태의 서비스를 pending으로 변경
UPDATE public.services
SET status = 'pending'
WHERE status = 'draft';

-- 서비스 테이블의 status 기본값을 pending으로 변경
ALTER TABLE public.services
ALTER COLUMN status SET DEFAULT 'pending';

COMMENT ON COLUMN public.services.status IS '서비스 상태: draft(임시저장), pending(승인대기), active(활성), inactive(비활성), rejected(반려됨), suspended(정지)';
