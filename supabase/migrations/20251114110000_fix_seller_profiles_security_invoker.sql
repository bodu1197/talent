-- ============================================
-- Fix seller_profiles VIEW security property
-- ============================================
-- Purpose:
-- - Change SECURITY DEFINER to SECURITY INVOKER
-- - This ensures RLS policies are applied based on the querying user's permissions
-- - Fixes Supabase Linter warning: security_definer_view
-- ============================================

-- Recreate seller_profiles VIEW with SECURITY INVOKER
CREATE OR REPLACE VIEW public.seller_profiles
WITH (security_invoker=true) AS
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

-- Add comments
COMMENT ON VIEW public.seller_profiles IS 'Backward-compatible view combining sellers + profiles data (SECURITY INVOKER for proper RLS enforcement)';

-- ============================================
-- Migration Notes
-- ============================================
-- This change improves security by ensuring that:
-- 1. RLS policies are applied based on the querying user's permissions
-- 2. Users can only see data they're authorized to access
-- 3. Fixes Supabase Linter warning about SECURITY DEFINER views
