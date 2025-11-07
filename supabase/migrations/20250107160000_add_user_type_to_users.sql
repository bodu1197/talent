-- users 테이블에 user_type 컬럼 추가
-- RLS 정책이나 트리거에서 참조하는 user_type 필드 추가

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'buyer';

-- 컬럼에 대한 주석
COMMENT ON COLUMN public.users.user_type IS '사용자 유형 (buyer, seller 등)';

-- 기존 사용자들의 user_type 설정
-- sellers 테이블에 있는 사용자는 'seller'로, 없으면 'buyer'로 설정
UPDATE public.users
SET user_type = CASE
  WHEN EXISTS (SELECT 1 FROM public.sellers WHERE sellers.user_id = users.id) THEN 'seller'
  ELSE 'buyer'
END
WHERE user_type IS NULL OR user_type = 'buyer';
