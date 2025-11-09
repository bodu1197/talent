-- Performance optimization: Fix Auth RLS Initialization Plan warnings
-- Replace auth.uid() with (select auth.uid()) in RLS policies for better performance

-- ============================================
-- 1. category_visits 테이블 RLS 정책 최적화
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can view own visits" ON public.category_visits;
DROP POLICY IF EXISTS "Authenticated users can insert own visits" ON public.category_visits;

-- 최적화된 정책 생성
CREATE POLICY "Authenticated users can view own visits"
    ON public.category_visits
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users can insert own visits"
    ON public.category_visits
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- 2. service_views 테이블 RLS 정책 최적화
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own service views" ON public.service_views;
DROP POLICY IF EXISTS "Users can insert own service views" ON public.service_views;
DROP POLICY IF EXISTS "Users can update own service views" ON public.service_views;
DROP POLICY IF EXISTS "Users can delete own service views" ON public.service_views;

-- 최적화된 정책 생성
CREATE POLICY "Users can view own service views"
    ON public.service_views
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own service views"
    ON public.service_views
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own service views"
    ON public.service_views
    FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own service views"
    ON public.service_views
    FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ============================================
-- 3. service_favorites 테이블 RLS 정책 최적화
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own favorites" ON public.service_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.service_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.service_favorites;

-- 최적화된 정책 생성
CREATE POLICY "Users can view own favorites"
    ON public.service_favorites
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own favorites"
    ON public.service_favorites
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own favorites"
    ON public.service_favorites
    FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ============================================
-- 4. service_revisions 중복 정책 제거
-- ============================================

-- 중복된 정책 중 하나 삭제 (더 오래된 정책 제거)
DROP POLICY IF EXISTS "Users can view service revisions" ON public.service_revisions;

-- service_revisions_select_policy만 유지 (최신 정책)

-- 코멘트
COMMENT ON POLICY "Authenticated users can view own visits" ON public.category_visits IS 'Optimized: Uses (select auth.uid()) for better performance';
COMMENT ON POLICY "Users can view own service views" ON public.service_views IS 'Optimized: Uses (select auth.uid()) for better performance';
COMMENT ON POLICY "Users can view own favorites" ON public.service_favorites IS 'Optimized: Uses (select auth.uid()) for better performance';
