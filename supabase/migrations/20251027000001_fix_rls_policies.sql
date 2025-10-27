-- ============================================
-- RLS 정책 수정 및 추가
-- ============================================

-- ============================================
-- 1. Buyers 테이블 정책 수정
-- ============================================

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Users can view their own buyer profile" ON public.buyers;
DROP POLICY IF EXISTS "Users can update their own buyer profile" ON public.buyers;
DROP POLICY IF EXISTS "Users can insert their own buyer profile" ON public.buyers;

-- SELECT: 본인 프로필만 조회 가능
CREATE POLICY "Users can view their own buyer profile"
    ON public.buyers FOR SELECT
    USING (auth.uid() = id);

-- UPDATE: 본인 프로필만 수정 가능
CREATE POLICY "Users can update their own buyer profile"
    ON public.buyers FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT: 본인 프로필만 생성 가능
CREATE POLICY "Users can insert their own buyer profile"
    ON public.buyers FOR INSERT
    WITH CHECK (auth.uid() = id);

-- DELETE: 본인 프로필만 삭제 가능
CREATE POLICY "Users can delete their own buyer profile"
    ON public.buyers FOR DELETE
    USING (auth.uid() = id);

-- ============================================
-- 2. Sellers 테이블 정책 수정
-- ============================================

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Users can view their own seller profile" ON public.sellers;
DROP POLICY IF EXISTS "Users can update their own seller profile" ON public.sellers;
DROP POLICY IF EXISTS "Users can insert their own seller profile" ON public.sellers;
DROP POLICY IF EXISTS "Anyone can view active verified sellers" ON public.sellers;

-- SELECT: 본인 프로필은 항상 조회 가능
CREATE POLICY "Users can view their own seller profile"
    ON public.sellers FOR SELECT
    USING (auth.uid() = id);

-- SELECT: 활성화되고 인증된 판매자는 모두가 조회 가능 (마켓플레이스용)
CREATE POLICY "Anyone can view active sellers basic info"
    ON public.sellers FOR SELECT
    USING (
        is_active = true
        AND is_verified = true
    );

-- UPDATE: 본인 프로필만 수정 가능
CREATE POLICY "Users can update their own seller profile"
    ON public.sellers FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT: 본인 프로필만 생성 가능
CREATE POLICY "Users can insert their own seller profile"
    ON public.sellers FOR INSERT
    WITH CHECK (auth.uid() = id);

-- DELETE: 본인 프로필만 삭제 가능
CREATE POLICY "Users can delete their own seller profile"
    ON public.sellers FOR DELETE
    USING (auth.uid() = id);

-- ============================================
-- 3. Admin 사용자를 위한 정책 추가
-- ============================================

-- Admin이 모든 buyers 조회 가능
CREATE POLICY "Admins can view all buyers"
    ON public.buyers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Admin이 모든 buyers 수정 가능
CREATE POLICY "Admins can update all buyers"
    ON public.buyers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Admin이 모든 sellers 조회 가능
CREATE POLICY "Admins can view all sellers"
    ON public.sellers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Admin이 모든 sellers 수정 가능 (인증 상태 변경 등)
CREATE POLICY "Admins can update all sellers"
    ON public.sellers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- ============================================
-- 4. 주문 관련 정책 (판매자/구매자 정보 조회)
-- ============================================

-- 주문이 있는 경우 구매자가 해당 판매자 기본 정보 조회 가능
CREATE POLICY "Buyers can view sellers they ordered from"
    ON public.sellers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.seller_id = sellers.id
            AND orders.buyer_id = auth.uid()
        )
    );

-- 주문이 있는 경우 판매자가 해당 구매자 기본 정보 조회 가능
CREATE POLICY "Sellers can view buyers who ordered from them"
    ON public.buyers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.buyer_id = buyers.id
            AND orders.seller_id = auth.uid()
        )
    );

-- ============================================
-- 5. 권한 확인을 위한 함수 생성
-- ============================================

-- 현재 사용자가 Admin인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 구매자인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_buyer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 판매자인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_seller()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Comments
-- ============================================
COMMENT ON POLICY "Users can view their own buyer profile" ON public.buyers IS '사용자는 자신의 구매자 프로필을 조회할 수 있음';
COMMENT ON POLICY "Admins can view all buyers" ON public.buyers IS '관리자는 모든 구매자 프로필을 조회할 수 있음';
COMMENT ON POLICY "Sellers can view buyers who ordered from them" ON public.buyers IS '판매자는 자신에게 주문한 구매자 정보를 조회할 수 있음';

COMMENT ON POLICY "Users can view their own seller profile" ON public.sellers IS '사용자는 자신의 판매자 프로필을 조회할 수 있음';
COMMENT ON POLICY "Anyone can view active sellers basic info" ON public.sellers IS '활성화되고 인증된 판매자는 누구나 조회 가능 (마켓플레이스)';
COMMENT ON POLICY "Admins can view all sellers" ON public.sellers IS '관리자는 모든 판매자 프로필을 조회할 수 있음';
COMMENT ON POLICY "Buyers can view sellers they ordered from" ON public.sellers IS '구매자는 주문한 판매자 정보를 조회할 수 있음';
