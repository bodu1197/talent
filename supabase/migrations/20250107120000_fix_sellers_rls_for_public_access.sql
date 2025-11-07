-- sellers 테이블에 공개 읽기 권한 추가
-- 비로그인 사용자도 판매자 정보(공개 필드만)를 볼 수 있어야 함

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Anyone can view seller public info" ON public.sellers;

-- 새로운 정책: 누구나 판매자 공개 정보 조회 가능
CREATE POLICY "Anyone can view seller public info" ON public.sellers
FOR SELECT
USING (true);

-- 코멘트
COMMENT ON POLICY "Anyone can view seller public info" ON public.sellers
IS 'Anyone can view seller public information (for service listings)';
