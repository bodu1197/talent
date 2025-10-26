-- ============================================
-- Fix seller_profiles schema to match code expectations
-- ============================================

-- Change skills from TEXT to TEXT[] (array)
ALTER TABLE public.seller_profiles
  ALTER COLUMN skills TYPE TEXT[] USING
    CASE
      WHEN skills IS NULL THEN NULL
      WHEN skills = '' THEN '{}'::TEXT[]
      ELSE string_to_array(skills, ',')
    END;

-- Add introduction column (alias for description for backward compatibility)
-- We'll keep description as the main field and handle introduction in code
COMMENT ON COLUMN public.seller_profiles.description IS 'Seller introduction/description';

-- Update schema version
INSERT INTO public.schema_migrations (version)
VALUES ('20251026045742_fix_seller_profiles_schema')
ON CONFLICT (version) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ seller_profiles schema fixed!';
    RAISE NOTICE '- skills column changed to TEXT[] (array type)';
    RAISE NOTICE '- Code should use "description" field instead of "introduction"';
END $$;
