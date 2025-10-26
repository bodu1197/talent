-- ============================================
-- admins 테이블 RLS 정책 추가
-- ============================================

-- RLS 활성화
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Admins can view own admin info" ON public.admins;
DROP POLICY IF EXISTS "Admins are viewable by authenticated users" ON public.admins;

-- 정책 1: 인증된 사용자는 admins 테이블 조회 가능
-- (관리자 체크를 위해 필요)
CREATE POLICY "Admins are viewable by authenticated users"
    ON public.admins FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 정책 2: 관리자만 admins 테이블 수정 가능
CREATE POLICY "Only admins can update admin info"
    ON public.admins FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 정책 3: 관리자만 삭제 가능
CREATE POLICY "Only admins can delete admin info"
    ON public.admins FOR DELETE
    USING (auth.uid() = user_id);

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ admins 테이블 RLS 정책 추가 완료!';
    RAISE NOTICE '이제 로그인 후 관리자 체크가 정상 작동합니다.';
END $$;
