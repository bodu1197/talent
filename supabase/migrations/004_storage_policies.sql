
-- ============================================
-- Storage 버킷 정책 설정
-- ============================================

-- 1. profiles 버킷 정책
-- 모든 사용자가 프로필 이미지 조회 가능
CREATE POLICY "Public profiles are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- 본인 프로필 이미지만 업로드 가능
CREATE POLICY "Users can upload own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 본인 프로필 이미지만 수정 가능
CREATE POLICY "Users can update own profile image"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 본인 프로필 이미지만 삭제 가능
CREATE POLICY "Users can delete own profile image"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. services 버킷 정책
-- 모든 사용자가 서비스 이미지 조회 가능
CREATE POLICY "Service images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'services');

-- 판매자만 서비스 이미지 업로드 가능
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

-- 본인 서비스 이미지만 수정 가능
CREATE POLICY "Sellers can update own service images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'services'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. portfolios 버킷 정책
-- 모든 사용자가 포트폴리오 조회 가능
CREATE POLICY "Portfolios are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

-- 판매자만 포트폴리오 업로드 가능
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

-- 4. orders 버킷 정책 (비공개)
-- 주문 관련자만 파일 조회 가능
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

-- 주문 관련자만 파일 업로드 가능
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

-- 5. messages 버킷 정책 (비공개)
-- 대화 참여자만 파일 조회 가능
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

-- 대화 참여자만 파일 업로드 가능
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

-- 6. reviews 버킷 정책
-- 모든 사용자가 리뷰 이미지 조회 가능
CREATE POLICY "Review images are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'reviews');

-- 구매자만 리뷰 이미지 업로드 가능
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

-- 7. disputes 버킷 정책 (비공개)
-- 분쟁 관련자와 관리자만 조회 가능
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

-- 분쟁 신청자만 파일 업로드 가능
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
