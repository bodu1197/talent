-- ============================================
-- Create profiles table for unified user profile management
-- ============================================
-- Purpose:
-- - Single source of truth for user profile data (name, profile_image, bio)
-- - Automatically synced from auth.users.raw_user_meta_data
-- - Used by both buyers and sellers
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profile_image TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one profile per user
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all profiles (for public display)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Only authenticated users can insert (handled by trigger)
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- Auto-sync trigger: auth.users → profiles
-- ============================================
-- When a user signs up, automatically create profile from metadata
-- When metadata is updated, sync to profiles table

CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- On INSERT: Create profile from user_metadata
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.profiles (user_id, name, profile_image)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous'),
      NEW.raw_user_meta_data->>'profile_image'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
  END IF;

  -- On UPDATE: Sync metadata changes to profiles
  IF (TG_OP = 'UPDATE') THEN
    -- Check if raw_user_meta_data has changed
    IF (NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data) THEN
      UPDATE public.profiles
      SET
        name = COALESCE(NEW.raw_user_meta_data->>'name', name),
        profile_image = COALESCE(NEW.raw_user_meta_data->>'profile_image', profile_image),
        updated_at = now()
      WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_profile_sync ON auth.users;
CREATE TRIGGER on_auth_user_profile_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_profile_sync();

-- ============================================
-- Backfill existing users
-- ============================================
-- Migrate existing auth.users data to profiles table

INSERT INTO public.profiles (user_id, name, profile_image)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'name', 'Anonymous'),
  raw_user_meta_data->>'profile_image'
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET
  name = COALESCE(EXCLUDED.name, profiles.name),
  profile_image = COALESCE(EXCLUDED.profile_image, profiles.profile_image),
  updated_at = now();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.profiles IS 'User profiles - single source of truth for name, profile_image, bio';
COMMENT ON COLUMN public.profiles.user_id IS 'References auth.users(id) - one profile per user';
COMMENT ON COLUMN public.profiles.name IS 'Display name (auto-synced from auth metadata)';
COMMENT ON COLUMN public.profiles.profile_image IS 'Profile image URL (auto-synced from auth metadata)';
COMMENT ON COLUMN public.profiles.bio IS 'User biography (can be updated by user)';
COMMENT ON FUNCTION public.handle_user_profile_sync() IS 'Auto-sync auth.users metadata to profiles table';
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
