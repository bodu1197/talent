-- service_categories 테이블에 대한 SELECT 권한 정책 추가

-- 기존 정책이 있다면 삭제
DROP POLICY IF EXISTS "Anyone can view service categories" ON public.service_categories;

-- 새로운 SELECT 정책 생성 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view service categories"
ON public.service_categories
FOR SELECT
USING (true);

-- RLS 활성화 확인
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
