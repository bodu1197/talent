-- ============================================
-- Rollback: 잘못된 buyers/sellers 분리를 원복
-- users 테이블은 기본 회원 정보 테이블로 유지
-- buyers/sellers 테이블만 삭제
-- ============================================

-- ============================================
-- 1. buyers/sellers 테이블 삭제
-- ============================================

DROP TABLE IF EXISTS public.buyers CASCADE;
DROP TABLE IF EXISTS public.sellers CASCADE;

-- ============================================
-- 2. 삭제된 RLS 정책 함수들 제거
-- ============================================

DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_buyer() CASCADE;
DROP FUNCTION IF EXISTS is_seller() CASCADE;

-- ============================================
-- 3. Comments
-- ============================================

COMMENT ON TABLE users IS '회원 기본 정보 테이블 (buyer/seller 정보는 seller_profiles 등 별도 테이블에서 관리)';
COMMENT ON COLUMN users.user_type IS '회원 유형: buyer(구매자), seller(판매자), both(둘다), admin(관리자)';
COMMENT ON COLUMN users.last_mode IS '마지막 방문 페이지 모드 (buyer/seller)';
