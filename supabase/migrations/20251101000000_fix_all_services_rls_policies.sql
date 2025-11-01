-- Fix all services RLS policies to work with sellers table structure
-- seller_id references sellers.id, not auth.uid()

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view active services" ON "public"."services";
DROP POLICY IF EXISTS "Sellers can create services" ON "public"."services";
DROP POLICY IF EXISTS "Sellers can update own services" ON "public"."services";
DROP POLICY IF EXISTS "Sellers can delete own services" ON "public"."services";

-- Create SELECT policy: public can view active services, sellers can view their own
CREATE POLICY "Anyone can view active services" ON "public"."services"
FOR SELECT
USING (
    status = 'active'
    OR EXISTS (
        SELECT 1 FROM public.sellers
        WHERE sellers.id = services.seller_id
        AND sellers.user_id = auth.uid()
    )
);

-- Note: INSERT policy is already fixed in 20250131000001_fix_services_rls_policy.sql

-- Create UPDATE policy: sellers can update their own services
CREATE POLICY "Sellers can update own services" ON "public"."services"
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.sellers
        WHERE sellers.id = services.seller_id
        AND sellers.user_id = auth.uid()
        AND sellers.is_active = true
    )
);

-- Create DELETE policy: sellers can delete their own services
CREATE POLICY "Sellers can delete own services" ON "public"."services"
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.sellers
        WHERE sellers.id = services.seller_id
        AND sellers.user_id = auth.uid()
        AND sellers.is_active = true
    )
);

COMMENT ON POLICY "Anyone can view active services" ON "public"."services"
IS 'Public can view active services, sellers can view their own services regardless of status';

COMMENT ON POLICY "Sellers can update own services" ON "public"."services"
IS 'Active sellers can update their own services';

COMMENT ON POLICY "Sellers can delete own services" ON "public"."services"
IS 'Active sellers can delete their own services';
