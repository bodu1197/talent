-- services 테이블에 wishlist_count 컬럼 추가
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS wishlist_count INTEGER DEFAULT 0 NOT NULL;

-- 기존 데이터의 wishlist_count 업데이트
UPDATE public.services
SET wishlist_count = (
  SELECT COUNT(*)
  FROM public.service_favorites
  WHERE service_favorites.service_id = services.id
);

-- 인덱스 추가 (정렬 시 성능 향상)
CREATE INDEX IF NOT EXISTS idx_services_wishlist_count ON public.services(wishlist_count DESC);

-- 코멘트
COMMENT ON COLUMN public.services.wishlist_count IS '서비스 찜 개수 (service_favorites 테이블과 동기화)';
