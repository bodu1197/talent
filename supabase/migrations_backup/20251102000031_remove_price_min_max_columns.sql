-- Confirm services table uses single 'price' column only
-- price_min and price_max columns never existed in production

-- 1. Ensure price column has proper constraints
ALTER TABLE public.services
ALTER COLUMN price SET DEFAULT 0;

-- 2. Update any NULL prices to 0
UPDATE public.services
SET price = 0
WHERE price IS NULL;

-- 3. Make price NOT NULL
ALTER TABLE public.services
ALTER COLUMN price SET NOT NULL;

-- 코멘트
COMMENT ON COLUMN public.services.price IS '서비스 가격 (단일 가격)';
