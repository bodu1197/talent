-- ============================================
-- Unify seller profile management with profiles table
-- ============================================
-- Purpose:
-- - Remove duplicate profile_image, display_name from sellers table
-- - Use profiles table as single source
-- - Migrate existing seller profile data to profiles table
-- ============================================

-- Step 1: Migrate existing seller profile data to profiles table
-- Update profiles.name and profile_image from sellers where sellers has data
UPDATE public.profiles p
SET
  name = COALESCE(s.display_name, p.name),
  profile_image = COALESCE(s.profile_image, p.profile_image),
  bio = COALESCE(s.bio, p.bio),
  updated_at = now()
FROM public.sellers s
WHERE p.user_id = s.user_id
  AND (
    (s.display_name IS NOT NULL AND s.display_name != '') OR
    (s.profile_image IS NOT NULL AND s.profile_image != '') OR
    (s.bio IS NOT NULL AND s.bio != '')
  );

-- Step 2: Create view for backward compatibility
-- This allows existing queries to work without immediate code changes
CREATE OR REPLACE VIEW public.seller_profiles AS
SELECT
  s.id,
  s.user_id,
  s.business_name,
  s.business_number,
  s.business_registration_file,
  s.bank_name,
  s.account_number,
  s.account_holder,
  s.is_verified,
  s.verification_status,
  s.verified_at,
  s.rejection_reason,
  s.total_sales,
  s.total_revenue,
  s.service_count,
  s.rating,
  s.review_count,
  s.last_sale_at,
  s.is_active,
  s.created_at,
  s.updated_at,
  -- Get profile data from profiles table
  p.name as display_name,
  p.profile_image,
  p.bio,
  s.phone,
  s.show_phone,
  s.kakao_id,
  s.kakao_openchat,
  s.whatsapp,
  s.website,
  s.preferred_contact,
  s.certificates,
  s.experience,
  s.is_business,
  s.status,
  s.real_name,
  s.contact_hours,
  s.tax_invoice_available,
  s.verified,
  s.verified_name,
  s.verified_phone
FROM public.sellers s
LEFT JOIN public.profiles p ON s.user_id = p.user_id;

-- Grant permissions on view
GRANT SELECT ON public.seller_profiles TO authenticated, anon;

-- Step 3: Drop duplicate columns from sellers table
-- Note: We keep bio for now as it might have seller-specific bio
ALTER TABLE public.sellers
  DROP COLUMN IF EXISTS display_name,
  DROP COLUMN IF EXISTS profile_image;

-- Step 4: Update function/trigger if any that references old columns
-- (Add any specific updates needed for triggers/functions)

-- ============================================
-- Comments
-- ============================================

COMMENT ON VIEW public.seller_profiles IS 'Backward-compatible view combining sellers + profiles data';
COMMENT ON COLUMN public.seller_profiles.display_name IS 'From profiles.name - unified profile name';
COMMENT ON COLUMN public.seller_profiles.profile_image IS 'From profiles.profile_image - unified profile image';
COMMENT ON COLUMN public.seller_profiles.bio IS 'From profiles.bio - unified biography';

-- ============================================
-- Migration Notes
-- ============================================
-- After deploying this migration:
-- 1. Update application code to:
--    - Join profiles table when fetching seller data
--    - Use seller_profiles view for backward compatibility
--    - Gradually migrate to direct profiles + sellers joins
-- 2. Test all seller profile update flows
-- 3. Eventually remove seller_profiles view when all code is migrated
