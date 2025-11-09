-- RLS 성능 최적화: service_revisions 테이블의 auth.uid() 호출 및 is_admin() 함수 사용

-- ============================================
-- SERVICE_REVISIONS 테이블
-- ============================================

-- 기존 정책 제거
DROP POLICY IF EXISTS "Admins can view all service revisions" ON public.service_revisions;
DROP POLICY IF EXISTS "Sellers can view their own service revisions" ON public.service_revisions;
DROP POLICY IF EXISTS "Sellers can create their own service revisions" ON public.service_revisions;
DROP POLICY IF EXISTS "Admins can update service revisions" ON public.service_revisions;

-- 최적화된 정책 생성
CREATE POLICY "service_revisions_select_policy"
    ON public.service_revisions
    FOR SELECT
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.id = service_revisions.seller_id
            AND sellers.user_id = (select auth.uid())
        )
    );

CREATE POLICY "service_revisions_insert_policy"
    ON public.service_revisions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.id = seller_id
            AND sellers.user_id = (select auth.uid())
        )
    );

CREATE POLICY "service_revisions_update_policy"
    ON public.service_revisions
    FOR UPDATE
    USING (public.is_admin());

-- ============================================
-- SERVICE_REVISION_CATEGORIES 테이블
-- ============================================

DROP POLICY IF EXISTS "Service revision categories are viewable by revision viewers" ON public.service_revision_categories;
DROP POLICY IF EXISTS "Sellers can insert revision categories" ON public.service_revision_categories;

CREATE POLICY "service_revision_categories_select_policy"
    ON public.service_revision_categories
    FOR SELECT
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.service_revisions
            JOIN public.sellers ON sellers.id = service_revisions.seller_id
            WHERE service_revisions.id = revision_id
            AND sellers.user_id = (select auth.uid())
        )
    );

CREATE POLICY "service_revision_categories_insert_policy"
    ON public.service_revision_categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            JOIN public.sellers ON sellers.id = service_revisions.seller_id
            WHERE service_revisions.id = revision_id
            AND sellers.user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICE_REVISION_PACKAGES 테이블
-- ============================================

DROP POLICY IF EXISTS "Service revision packages are viewable by revision viewers" ON public.service_revision_packages;
DROP POLICY IF EXISTS "Sellers can insert revision packages" ON public.service_revision_packages;

CREATE POLICY "service_revision_packages_select_policy"
    ON public.service_revision_packages
    FOR SELECT
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.service_revisions
            JOIN public.sellers ON sellers.id = service_revisions.seller_id
            WHERE service_revisions.id = revision_id
            AND sellers.user_id = (select auth.uid())
        )
    );

CREATE POLICY "service_revision_packages_insert_policy"
    ON public.service_revision_packages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            JOIN public.sellers ON sellers.id = service_revisions.seller_id
            WHERE service_revisions.id = revision_id
            AND sellers.user_id = (select auth.uid())
        )
    );
