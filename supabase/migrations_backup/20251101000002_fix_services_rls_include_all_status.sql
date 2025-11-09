-- Fix services SELECT policy to allow sellers to view their own services regardless of status (including draft, pending)

DROP POLICY IF EXISTS "Anyone can view active services" ON "public"."services";

-- Create SELECT policy: public can view active services, sellers can view ALL their own services
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

COMMENT ON POLICY "Anyone can view active services" ON "public"."services"
IS 'Public can view active services, sellers can view ALL their own services (draft, pending, active, inactive, rejected)';
