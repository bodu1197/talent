-- Fix duplicate 'profiles/profiles/' paths in profile_image URLs
-- This script corrects URLs that have '/profiles/profiles/' to '/profiles/'

-- Step 1: Check affected records
SELECT
  id,
  profile_image,
  REPLACE(profile_image, '/profiles/profiles/', '/profiles/') as fixed_url
FROM profiles
WHERE profile_image LIKE '%/profiles/profiles/%'
ORDER BY updated_at DESC;

-- Step 2: Update affected records (uncomment to execute)
/*
UPDATE profiles
SET profile_image = REPLACE(profile_image, '/profiles/profiles/', '/profiles/')
WHERE profile_image LIKE '%/profiles/profiles/%';
*/

-- Step 3: Verify the fix
/*
SELECT
  COUNT(*) as remaining_duplicates
FROM profiles
WHERE profile_image LIKE '%/profiles/profiles/%';
*/
