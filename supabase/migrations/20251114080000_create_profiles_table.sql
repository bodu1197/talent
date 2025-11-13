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
