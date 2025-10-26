-- ============================================
-- AI 재능 거래 플랫폼 - RLS (Row Level Security) 정책
-- ============================================

-- RLS 활성화 (테이블이 존재하는 경우만)
DO $$
BEGIN
  -- Always exists from 001_initial_schema.sql
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

  -- May not exist yet (created in later migrations)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seller_profiles') THEN
    ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_services') THEN
    ALTER TABLE public.ai_services ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'refunds') THEN
    ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settlements') THEN
    ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'favorites') THEN
    ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports') THEN
    ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'disputes') THEN
    ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'advertising_campaigns') THEN
    ALTER TABLE public.advertising_campaigns ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'premium_placements') THEN
    ALTER TABLE public.premium_placements ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- 헬퍼 함수
-- ============================================

-- 현재 사용자가 관리자인지 확인
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 판매자인지 확인
CREATE OR REPLACE FUNCTION is_seller()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND user_type IN ('seller', 'both')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 특정 서비스의 소유자인지 확인
CREATE OR REPLACE FUNCTION owns_service(service_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.services
        WHERE id = service_id
        AND seller_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS 테이블 정책
-- ============================================

-- 모든 사용자가 프로필 조회 가능
CREATE POLICY "Users profiles are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

-- 본인 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 회원가입시 프로필 생성
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- SELLER_PROFILES 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seller_profiles') THEN
    -- 판매자 프로필은 모두 조회 가능
    CREATE POLICY "Seller profiles are viewable by everyone"
        ON public.seller_profiles FOR SELECT
        USING (true);

    -- 본인 판매자 프로필만 수정 가능
    CREATE POLICY "Sellers can update own profile"
        ON public.seller_profiles FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    -- 판매자 전환시 프로필 생성
    CREATE POLICY "Users can create seller profile"
        ON public.seller_profiles FOR INSERT
        WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- CATEGORIES 테이블 정책
-- ============================================

-- 모든 사용자가 카테고리 조회 가능
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (is_active = true OR is_admin());

-- 관리자만 카테고리 생성/수정/삭제 가능
CREATE POLICY "Only admins can insert categories"
    ON public.categories FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can update categories"
    ON public.categories FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete categories"
    ON public.categories FOR DELETE
    USING (is_admin());

-- ============================================
-- SERVICES 테이블 정책
-- ============================================

-- 활성 서비스는 모두 조회 가능, 비활성은 소유자와 관리자만
CREATE POLICY "Active services are viewable by everyone"
    ON public.services FOR SELECT
    USING (
        status = 'active'
        OR seller_id = auth.uid()
        OR is_admin()
    );

-- 판매자만 서비스 생성 가능
CREATE POLICY "Sellers can create services"
    ON public.services FOR INSERT
    WITH CHECK (
        is_seller()
        AND auth.uid() = seller_id
    );

-- 본인 서비스만 수정 가능
CREATE POLICY "Sellers can update own services"
    ON public.services FOR UPDATE
    USING (auth.uid() = seller_id OR is_admin())
    WITH CHECK (auth.uid() = seller_id OR is_admin());

-- 본인 서비스만 삭제 가능 (소프트 삭제)
CREATE POLICY "Sellers can delete own services"
    ON public.services FOR DELETE
    USING (auth.uid() = seller_id OR is_admin());

-- ============================================
-- AI_SERVICES 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_services') THEN
    -- 서비스와 동일한 정책
    CREATE POLICY "AI services follow service policies for select"
        ON public.ai_services FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.services s
                WHERE s.id = service_id
                AND (s.status = 'active' OR s.seller_id = auth.uid() OR is_admin())
            )
        );

    CREATE POLICY "AI services follow service policies for insert"
        ON public.ai_services FOR INSERT
        WITH CHECK (owns_service(service_id));

    CREATE POLICY "AI services follow service policies for update"
        ON public.ai_services FOR UPDATE
        USING (owns_service(service_id) OR is_admin())
        WITH CHECK (owns_service(service_id) OR is_admin());
  END IF;
END $$;

-- ============================================
-- ORDERS 테이블 정책
-- ============================================

-- 본인이 관련된 주문만 조회 가능
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
        OR is_admin()
    );

-- 구매자만 주문 생성 가능
CREATE POLICY "Buyers can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- 관련자만 주문 수정 가능
CREATE POLICY "Related users can update orders"
    ON public.orders FOR UPDATE
    USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
        OR is_admin()
    );

-- ============================================
-- PAYMENTS 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    -- 관련자만 결제 정보 조회 가능
    CREATE POLICY "Users can view own payments"
        ON public.payments FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.orders o
                WHERE o.id = order_id
                AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
            )
            OR is_admin()
        );

    -- 구매자만 결제 생성 가능
    CREATE POLICY "Buyers can create payments"
        ON public.payments FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.orders o
                WHERE o.id = order_id
                AND o.buyer_id = auth.uid()
            )
        );
  END IF;
END $$;

-- ============================================
-- REVIEWS 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    -- 모든 사용자가 공개 리뷰 조회 가능
    CREATE POLICY "Public reviews are viewable by everyone"
        ON public.reviews FOR SELECT
        USING (is_visible = true OR buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());

    -- 구매자만 리뷰 작성 가능
    CREATE POLICY "Buyers can create reviews"
        ON public.reviews FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.orders o
                WHERE o.id = order_id
                AND o.buyer_id = auth.uid()
                AND o.status = 'completed'
            )
        );

    -- 본인 리뷰만 수정 가능
    CREATE POLICY "Buyers can update own reviews"
        ON public.reviews FOR UPDATE
        USING (auth.uid() = buyer_id)
        WITH CHECK (auth.uid() = buyer_id);
  END IF;
END $$;

-- ============================================
-- CONVERSATIONS 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    -- 참여자만 대화 조회 가능
    CREATE POLICY "Participants can view conversations"
        ON public.conversations FOR SELECT
        USING (
            auth.uid() = participant1_id
            OR auth.uid() = participant2_id
            OR is_admin()
        );

    -- 대화 생성 가능
    CREATE POLICY "Users can create conversations"
        ON public.conversations FOR INSERT
        WITH CHECK (
            auth.uid() = participant1_id
            OR auth.uid() = participant2_id
        );
  END IF;
END $$;

-- ============================================
-- MESSAGES 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    -- 대화 참여자만 메시지 조회 가능
    CREATE POLICY "Participants can view messages"
        ON public.messages FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.conversations c
                WHERE c.id = conversation_id
                AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
            )
            OR is_admin()
        );

    -- 대화 참여자만 메시지 전송 가능
    CREATE POLICY "Participants can send messages"
        ON public.messages FOR INSERT
        WITH CHECK (
            auth.uid() = sender_id
            AND EXISTS (
                SELECT 1 FROM public.conversations c
                WHERE c.id = conversation_id
                AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
            )
        );
  END IF;
END $$;

-- ============================================
-- NOTIFICATIONS 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    -- 본인 알림만 조회 가능
    CREATE POLICY "Users can view own notifications"
        ON public.notifications FOR SELECT
        USING (auth.uid() = user_id);

    -- 시스템이 알림 생성 (서비스 역할로)
    CREATE POLICY "System can create notifications"
        ON public.notifications FOR INSERT
        WITH CHECK (true);

    -- 본인 알림만 수정 가능 (읽음 처리 등)
    CREATE POLICY "Users can update own notifications"
        ON public.notifications FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- FAVORITES 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'favorites') THEN
    -- 본인 찜 목록만 조회 가능
    CREATE POLICY "Users can view own favorites"
        ON public.favorites FOR SELECT
        USING (auth.uid() = user_id);

    -- 찜하기 생성
    CREATE POLICY "Users can create favorites"
        ON public.favorites FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    -- 찜하기 삭제
    CREATE POLICY "Users can delete own favorites"
        ON public.favorites FOR DELETE
        USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- REPORTS 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports') THEN
    -- 본인 신고와 관리자만 조회 가능
    CREATE POLICY "Users can view own reports"
        ON public.reports FOR SELECT
        USING (
            auth.uid() = reporter_id
            OR auth.uid() = reported_user_id
            OR is_admin()
        );

    -- 로그인한 사용자는 신고 가능
    CREATE POLICY "Authenticated users can create reports"
        ON public.reports FOR INSERT
        WITH CHECK (auth.uid() = reporter_id);

    -- 관리자만 신고 수정 가능
    CREATE POLICY "Only admins can update reports"
        ON public.reports FOR UPDATE
        USING (is_admin())
        WITH CHECK (is_admin());
  END IF;
END $$;

-- ============================================
-- ADVERTISING_CAMPAIGNS 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'advertising_campaigns') THEN
    -- 본인 캠페인만 조회 가능
    CREATE POLICY "Sellers can view own campaigns"
        ON public.advertising_campaigns FOR SELECT
        USING (auth.uid() = seller_id OR is_admin());

    -- 판매자만 캠페인 생성 가능
    CREATE POLICY "Sellers can create campaigns"
        ON public.advertising_campaigns FOR INSERT
        WITH CHECK (is_seller() AND auth.uid() = seller_id);

    -- 본인 캠페인만 수정 가능
    CREATE POLICY "Sellers can update own campaigns"
        ON public.advertising_campaigns FOR UPDATE
        USING (auth.uid() = seller_id OR is_admin())
        WITH CHECK (auth.uid() = seller_id OR is_admin());
  END IF;
END $$;

-- ============================================
-- PREMIUM_PLACEMENTS 테이블 정책
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'premium_placements') THEN
    -- 활성 배치는 모두 조회 가능
    CREATE POLICY "Active placements are public"
        ON public.premium_placements FOR SELECT
        USING (is_active = true OR
               EXISTS (
                   SELECT 1 FROM public.advertising_campaigns c
                   WHERE c.id = campaign_id
                   AND (c.seller_id = auth.uid() OR is_admin())
               ));

    -- 캠페인 소유자만 배치 생성 가능
    CREATE POLICY "Campaign owners can create placements"
        ON public.premium_placements FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.advertising_campaigns c
                WHERE c.id = campaign_id
                AND c.seller_id = auth.uid()
            )
        );
  END IF;
END $$;

-- ============================================
-- 스키마 버전 업데이트
-- ============================================

INSERT INTO public.schema_migrations (version) VALUES ('003_rls_policies');

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ RLS 정책 설정 완료!';
    RAISE NOTICE '보안 정책이 모든 테이블에 적용되었습니다.';
    RAISE NOTICE '다음 단계: Storage 버킷 생성';
END $$;