-- ============================================
-- Add location fields to seller_profiles VIEW
-- ============================================
-- Purpose:
-- - Add location_latitude, location_longitude, location_region to seller_profiles view
-- - Enable distance-based sorting in category pages
-- ============================================

-- Recreate seller_profiles VIEW with location fields
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
  s.verified_phone,
  -- NEW: Location fields for distance-based sorting
  s.location_latitude,
  s.location_longitude,
  s.location_region,
  s.location_address
FROM public.sellers s
LEFT JOIN public.profiles p ON s.user_id = p.user_id;

-- Grant permissions on view
GRANT SELECT ON public.seller_profiles TO authenticated, anon;

-- Add comments
COMMENT ON VIEW public.seller_profiles IS 'Seller profiles view with location data for distance-based features';

-- ============================================
-- Create RPC function for services with distance
-- ============================================
CREATE OR REPLACE FUNCTION get_services_by_category_with_distance(
  p_category_id UUID,
  p_user_lat DECIMAL DEFAULT NULL,
  p_user_lon DECIMAL DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_per_page INTEGER DEFAULT 28
) RETURNS TABLE(
  service_id UUID,
  title TEXT,
  description TEXT,
  price BIGINT,
  price_type TEXT,
  thumbnail TEXT,
  status TEXT,
  seller_id UUID,
  seller_display_name TEXT,
  seller_profile_image TEXT,
  seller_is_verified BOOLEAN,
  seller_is_business BOOLEAN,
  distance_km DECIMAL,
  is_advertised BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH service_ids AS (
    -- Get all service IDs for this category and its descendants
    SELECT DISTINCT sc.service_id
    FROM service_categories sc
    WHERE sc.category_id = p_category_id
       OR sc.category_id IN (
         SELECT c.id FROM categories c WHERE c.parent_id = p_category_id
       )
       OR sc.category_id IN (
         SELECT c2.id FROM categories c2
         WHERE c2.parent_id IN (SELECT c.id FROM categories c WHERE c.parent_id = p_category_id)
       )
  ),
  advertised_ids AS (
    -- Get advertised service IDs
    SELECT ads.service_id
    FROM advertising_subscriptions ads
    WHERE ads.status = 'active'
  )
  SELECT
    s.id as service_id,
    s.title,
    s.description,
    s.price,
    s.price_type,
    s.thumbnail,
    s.status,
    sel.id as seller_id,
    sel.display_name as seller_display_name,
    sel.profile_image as seller_profile_image,
    sel.is_verified as seller_is_verified,
    sel.is_business as seller_is_business,
    CASE
      WHEN p_user_lat IS NOT NULL AND p_user_lon IS NOT NULL AND sel.location_latitude IS NOT NULL AND sel.location_longitude IS NOT NULL
      THEN calculate_distance(p_user_lat, p_user_lon, sel.location_latitude, sel.location_longitude)
      ELSE NULL
    END as distance_km,
    EXISTS (SELECT 1 FROM advertised_ids a WHERE a.service_id = s.id) as is_advertised,
    s.created_at
  FROM services s
  JOIN seller_profiles sel ON s.seller_id = sel.id
  WHERE s.id IN (SELECT service_id FROM service_ids)
    AND s.status = 'active'
  ORDER BY
    -- Advertised first
    EXISTS (SELECT 1 FROM advertised_ids a WHERE a.service_id = s.id) DESC,
    -- Then by distance (if location provided)
    CASE
      WHEN p_user_lat IS NOT NULL AND p_user_lon IS NOT NULL AND sel.location_latitude IS NOT NULL AND sel.location_longitude IS NOT NULL
      THEN calculate_distance(p_user_lat, p_user_lon, sel.location_latitude, sel.location_longitude)
      ELSE 99999
    END ASC,
    -- Finally by created_at
    s.created_at DESC
  LIMIT p_per_page OFFSET (p_page - 1) * p_per_page;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_services_by_category_with_distance TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION get_services_by_category_with_distance IS 'Get services by category with optional distance-based sorting';
