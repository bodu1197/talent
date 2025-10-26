
-- ============================================
-- Storage 버킷 정책 설정
-- ============================================

-- 1. profiles 버킷 정책
DO $$
BEGIN
  -- 모든 사용자가 프로필 이미지 조회 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profiles');
  END IF;

  -- 본인 프로필 이미지만 업로드 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Users can upload own profile image'
  ) THEN
    CREATE POLICY "Users can upload own profile image"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'profiles'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- 본인 프로필 이미지만 수정 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Users can update own profile image'
  ) THEN
    CREATE POLICY "Users can update own profile image"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'profiles'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- 본인 프로필 이미지만 삭제 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Users can delete own profile image'
  ) THEN
    CREATE POLICY "Users can delete own profile image"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'profiles'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- 2. services 버킷 정책
DO $$
BEGIN
  -- 모든 사용자가 서비스 이미지 조회 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Service images are viewable by everyone'
  ) THEN
    CREATE POLICY "Service images are viewable by everyone"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'services');
  END IF;

  -- 판매자만 서비스 이미지 업로드 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Sellers can upload service images'
  ) THEN
    CREATE POLICY "Sellers can upload service images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'services'
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND user_type IN ('seller', 'both')
      )
    );
  END IF;

  -- 본인 서비스 이미지만 수정 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Sellers can update own service images'
  ) THEN
    CREATE POLICY "Sellers can update own service images"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'services'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- 3. portfolios 버킷 정책
DO $$
BEGIN
  -- 모든 사용자가 포트폴리오 조회 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Portfolios are viewable by everyone'
  ) THEN
    CREATE POLICY "Portfolios are viewable by everyone"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolios');
  END IF;

  -- 판매자만 포트폴리오 업로드 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Sellers can upload portfolios'
  ) THEN
    CREATE POLICY "Sellers can upload portfolios"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'portfolios'
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND user_type IN ('seller', 'both')
      )
    );
  END IF;
END $$;

-- 4. orders 버킷 정책 (비공개)
DO $$
BEGIN
  -- 주문 관련자만 파일 조회 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Order files viewable by participants'
  ) THEN
    CREATE POLICY "Order files viewable by participants"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'orders'
      AND EXISTS (
        SELECT 1 FROM public.orders
        WHERE id::text = (storage.foldername(name))[1]
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
      )
    );
  END IF;

  -- 주문 관련자만 파일 업로드 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Order participants can upload files'
  ) THEN
    CREATE POLICY "Order participants can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'orders'
      AND EXISTS (
        SELECT 1 FROM public.orders
        WHERE id::text = (storage.foldername(name))[1]
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
      )
    );
  END IF;
END $$;

-- 5. messages 버킷 정책 (비공개)
DO $$
BEGIN
  -- 대화 참여자만 파일 조회 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Message files viewable by participants'
  ) THEN
    CREATE POLICY "Message files viewable by participants"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'messages'
      AND EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id::text = (storage.foldername(name))[1]
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
      )
    );
  END IF;

  -- 대화 참여자만 파일 업로드 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Conversation participants can upload files'
  ) THEN
    CREATE POLICY "Conversation participants can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'messages'
      AND EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id::text = (storage.foldername(name))[1]
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
      )
    );
  END IF;
END $$;

-- 6. reviews 버킷 정책
DO $$
BEGIN
  -- 모든 사용자가 리뷰 이미지 조회 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Review images are public'
  ) THEN
    CREATE POLICY "Review images are public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'reviews');
  END IF;

  -- 구매자만 리뷰 이미지 업로드 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Buyers can upload review images'
  ) THEN
    CREATE POLICY "Buyers can upload review images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'reviews'
      AND EXISTS (
        SELECT 1 FROM public.reviews
        WHERE id::text = (storage.foldername(name))[1]
        AND buyer_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 7. disputes 버킷 정책 (비공개)
DO $$
BEGIN
  -- 분쟁 관련자와 관리자만 조회 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Dispute files viewable by participants and admins'
  ) THEN
    CREATE POLICY "Dispute files viewable by participants and admins"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'disputes'
      AND (
        EXISTS (
          SELECT 1 FROM public.disputes
          WHERE id::text = (storage.foldername(name))[1]
          AND initiated_by = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.admins
          WHERE user_id = auth.uid()
        )
      )
    );
  END IF;

  -- 분쟁 신청자만 파일 업로드 가능
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Dispute initiators can upload files'
  ) THEN
    CREATE POLICY "Dispute initiators can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'disputes'
      AND EXISTS (
        SELECT 1 FROM public.disputes
        WHERE id::text = (storage.foldername(name))[1]
        AND initiated_by = auth.uid()
      )
    );
  END IF;
END $$;
