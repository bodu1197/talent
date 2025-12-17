-- 서비스 삭제 시 이력 보존을 위한 FK 수정
-- 서비스만 삭제되고, 주문/리뷰 등 이력은 보존됨 (service_id가 NULL로 설정)

-- 1. orders 테이블: service_id를 NULLABLE로 변경
ALTER TABLE public.orders ALTER COLUMN service_id DROP NOT NULL;

-- 2. orders FK 제약 조건 재설정 (ON DELETE SET NULL)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;
ALTER TABLE public.orders
ADD CONSTRAINT orders_service_id_fkey
FOREIGN KEY (service_id)
REFERENCES public.services(id)
ON DELETE SET NULL;

COMMENT ON CONSTRAINT orders_service_id_fkey ON public.orders IS
'서비스 삭제 시 주문 이력은 보존하고 service_id만 NULL로 설정';

-- 3. reviews 테이블: service_id를 NULLABLE로 변경
ALTER TABLE public.reviews ALTER COLUMN service_id DROP NOT NULL;

-- 4. reviews FK 제약 조건 재설정 (ON DELETE SET NULL)
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_service_id_fkey;
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_service_id_fkey
FOREIGN KEY (service_id)
REFERENCES public.services(id)
ON DELETE SET NULL;

COMMENT ON CONSTRAINT reviews_service_id_fkey ON public.reviews IS
'서비스 삭제 시 리뷰 이력은 보존하고 service_id만 NULL로 설정';
