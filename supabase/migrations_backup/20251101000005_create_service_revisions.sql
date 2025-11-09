-- 서비스 수정본 관리 테이블
CREATE TABLE IF NOT EXISTS public.service_revisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL,
    seller_id UUID NOT NULL,

    -- 서비스 정보 (수정될 내용)
    title VARCHAR(200) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    price INTEGER,

    -- 수정본 상태
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    revision_note TEXT, -- 판매자가 작성한 수정 사유
    admin_note TEXT, -- 관리자가 작성한 검토 메모

    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID
);

-- Foreign keys (이미 존재하면 무시됨)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'service_revisions_service_id_fkey'
    ) THEN
        ALTER TABLE public.service_revisions
        ADD CONSTRAINT service_revisions_service_id_fkey
        FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'service_revisions_seller_id_fkey'
    ) THEN
        ALTER TABLE public.service_revisions
        ADD CONSTRAINT service_revisions_seller_id_fkey
        FOREIGN KEY (seller_id) REFERENCES public.sellers(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'service_revisions_reviewed_by_fkey'
    ) THEN
        ALTER TABLE public.service_revisions
        ADD CONSTRAINT service_revisions_reviewed_by_fkey
        FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- 카테고리 수정본
CREATE TABLE IF NOT EXISTS public.service_revision_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revision_id UUID NOT NULL REFERENCES public.service_revisions(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 패키지 수정본
CREATE TABLE IF NOT EXISTS public.service_revision_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revision_id UUID NOT NULL REFERENCES public.service_revisions(id) ON DELETE CASCADE,
    package_type VARCHAR(20) NOT NULL CHECK (package_type IN ('basic', 'standard', 'premium')),
    price INTEGER NOT NULL,
    delivery_days INTEGER NOT NULL,
    revision_count INTEGER NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(revision_id, package_type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_service_revisions_service_id ON public.service_revisions(service_id);
CREATE INDEX IF NOT EXISTS idx_service_revisions_seller_id ON public.service_revisions(seller_id);
CREATE INDEX IF NOT EXISTS idx_service_revisions_status ON public.service_revisions(status);
CREATE INDEX IF NOT EXISTS idx_service_revision_categories_revision_id ON public.service_revision_categories(revision_id);
CREATE INDEX IF NOT EXISTS idx_service_revision_packages_revision_id ON public.service_revision_packages(revision_id);

-- RLS 활성화
ALTER TABLE public.service_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_revision_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_revision_packages ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 관리자는 모든 수정본 조회 가능
CREATE POLICY "Admins can view all service revisions"
    ON public.service_revisions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- RLS 정책: 판매자는 자신의 수정본만 조회 가능
CREATE POLICY "Sellers can view their own service revisions"
    ON public.service_revisions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.id = service_revisions.seller_id
            AND sellers.user_id = auth.uid()
        )
    );

-- RLS 정책: 판매자는 자신의 수정본 생성 가능
CREATE POLICY "Sellers can create their own service revisions"
    ON public.service_revisions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.id = seller_id
            AND sellers.user_id = auth.uid()
        )
    );

-- RLS 정책: 관리자는 수정본 업데이트 가능 (승인/반려)
CREATE POLICY "Admins can update service revisions"
    ON public.service_revisions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- 카테고리 RLS 정책
CREATE POLICY "Service revision categories are viewable by revision viewers"
    ON public.service_revision_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            WHERE service_revisions.id = revision_id
            AND (
                EXISTS (
                    SELECT 1 FROM public.admins
                    WHERE admins.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.sellers
                    WHERE sellers.id = service_revisions.seller_id
                    AND sellers.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Sellers can insert revision categories"
    ON public.service_revision_categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            JOIN public.sellers ON sellers.id = service_revisions.seller_id
            WHERE service_revisions.id = revision_id
            AND sellers.user_id = auth.uid()
        )
    );

-- 패키지 RLS 정책
CREATE POLICY "Service revision packages are viewable by revision viewers"
    ON public.service_revision_packages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            WHERE service_revisions.id = revision_id
            AND (
                EXISTS (
                    SELECT 1 FROM public.admins
                    WHERE admins.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.sellers
                    WHERE sellers.id = service_revisions.seller_id
                    AND sellers.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Sellers can insert revision packages"
    ON public.service_revision_packages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            JOIN public.sellers ON sellers.id = service_revisions.seller_id
            WHERE service_revisions.id = revision_id
            AND sellers.user_id = auth.uid()
        )
    );

-- 함수: 수정본 승인 시 메인 서비스 업데이트
CREATE OR REPLACE FUNCTION approve_service_revision(revision_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_revision RECORD;
    v_category_ids UUID[];
BEGIN
    -- 수정본 정보 조회
    SELECT * INTO v_revision
    FROM public.service_revisions
    WHERE id = revision_id_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Revision not found';
    END IF;

    -- 메인 서비스 업데이트
    UPDATE public.services
    SET
        title = v_revision.title,
        description = v_revision.description,
        thumbnail_url = v_revision.thumbnail_url,
        price = v_revision.price,
        updated_at = now()
    WHERE id = v_revision.service_id;

    -- 기존 카테고리 삭제
    DELETE FROM public.service_categories
    WHERE service_id = v_revision.service_id;

    -- 새 카테고리 추가
    INSERT INTO public.service_categories (service_id, category_id)
    SELECT v_revision.service_id, category_id
    FROM public.service_revision_categories
    WHERE revision_id = revision_id_param;

    -- 기존 패키지 삭제
    DELETE FROM public.service_packages
    WHERE service_id = v_revision.service_id;

    -- 새 패키지 추가
    INSERT INTO public.service_packages (service_id, package_type, price, delivery_days, revision_count, features)
    SELECT v_revision.service_id, package_type, price, delivery_days, revision_count, features
    FROM public.service_revision_packages
    WHERE revision_id = revision_id_param;

    -- 수정본 상태 업데이트
    UPDATE public.service_revisions
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid()
    WHERE id = revision_id_param;
END;
$$;
