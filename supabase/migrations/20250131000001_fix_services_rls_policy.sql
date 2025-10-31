-- Fix services RLS policy to work with sellers table structure
-- seller_id references sellers.id, not auth.uid()

-- Drop old policy
DROP POLICY IF EXISTS "Sellers create services" ON "public"."services";

-- Create new policy that checks seller_id exists in sellers table with matching user_id
CREATE POLICY "Sellers create services" ON "public"."services"
FOR INSERT
WITH CHECK (
    "public"."is_seller"()
    AND EXISTS (
        SELECT 1 FROM public.sellers
        WHERE sellers.id = services.seller_id
        AND sellers.user_id = auth.uid()
        AND sellers.is_active = true
    )
);

COMMENT ON POLICY "Sellers create services" ON "public"."services" IS 'Allow active sellers to create services with their seller_id';
