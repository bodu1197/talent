-- Fix function search_path security warnings
-- Adding SET search_path = '' to all functions to prevent search_path injection attacks

-- 1. is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = auth.uid()
    );
END;
$$;

-- 2. is_seller function
CREATE OR REPLACE FUNCTION public.is_seller()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND user_type IN ('seller', 'both')
    );
END;
$$;

-- 3. is_buyer function
CREATE OR REPLACE FUNCTION public.is_buyer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND user_type IN ('buyer', 'both')
    );
END;
$$;

-- 4. owns_service function
CREATE OR REPLACE FUNCTION public.owns_service(service_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.services
        WHERE id = service_id
        AND seller_id = auth.uid()
    );
END;
$$;

-- 5. update_users_updated_at function
CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 6. update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 7. update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 8. generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$;

-- 9. create_user_wallet function
CREATE OR REPLACE FUNCTION public.create_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- 10. update_coupon_issued_quantity function
CREATE OR REPLACE FUNCTION public.update_coupon_issued_quantity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    UPDATE public.coupons
    SET issued_quantity = issued_quantity + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$;

-- 11. update_quote_response_count function
CREATE OR REPLACE FUNCTION public.update_quote_response_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quotes
        SET response_count = response_count + 1
        WHERE id = NEW.quote_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quotes
        SET response_count = GREATEST(response_count - 1, 0)
        WHERE id = OLD.quote_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 12. create_seller_earnings function
CREATE OR REPLACE FUNCTION public.create_seller_earnings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.user_type IN ('seller', 'both') THEN
        INSERT INTO public.seller_earnings (seller_id, available_balance, pending_balance, total_withdrawn, total_earned)
        VALUES (NEW.id, 0, 0, 0, 0)
        ON CONFLICT (seller_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

-- 13. generate_service_slug function
CREATE OR REPLACE FUNCTION public.generate_service_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
        -- 기본 슬러그 생성 (한글 처리 포함)
        base_slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9가-힣]+', '-', 'g'));
        base_slug := TRIM(BOTH '-' FROM base_slug);

        final_slug := base_slug;

        -- 중복 체크 및 고유 슬러그 생성
        WHILE EXISTS (SELECT 1 FROM public.services WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;

        NEW.slug := final_slug;
    END IF;
    RETURN NEW;
END;
$$;

-- 코멘트 추가
COMMENT ON FUNCTION public.is_admin() IS 'Check if current user is an admin (search_path secured)';
COMMENT ON FUNCTION public.is_seller() IS 'Check if current user is a seller (search_path secured)';
COMMENT ON FUNCTION public.is_buyer() IS 'Check if current user is a buyer (search_path secured)';
COMMENT ON FUNCTION public.owns_service(uuid) IS 'Check if current user owns the service (search_path secured)';
