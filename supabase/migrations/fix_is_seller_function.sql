-- Fix is_seller() and is_buyer() functions to use sellers/buyers tables
-- instead of non-existent user_type column in users table

-- Fix is_buyer() to use buyers table
CREATE OR REPLACE FUNCTION "public"."is_buyer"()
RETURNS boolean
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO ''
AS $$
BEGIN
    -- Check if current user exists in buyers table and is active
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$$;

COMMENT ON FUNCTION "public"."is_buyer"() IS 'Check if current authenticated user is an active buyer';

-- Fix is_seller() to use sellers table
CREATE OR REPLACE FUNCTION "public"."is_seller"()
RETURNS boolean
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO ''
AS $$
BEGIN
    -- Check if current user exists in sellers table and is active
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$$;

COMMENT ON FUNCTION "public"."is_seller"() IS 'Check if current authenticated user is an active seller';
