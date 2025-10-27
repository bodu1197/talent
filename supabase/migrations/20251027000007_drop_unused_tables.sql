-- ============================================
-- 사용하지 않는 테이블들 삭제
-- ============================================

-- seller_profiles 테이블 삭제
DROP TABLE IF EXISTS public.seller_profiles CASCADE;

-- 기타 불필요한 테이블들 삭제
DROP TABLE IF EXISTS public.buyer_profiles CASCADE;

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 불필요한 테이블 삭제 완료';
END $$;
