-- ============================================
-- Fix duplicate RLS policies on users table
-- Remove restrictive policy, keep permissive one
-- ============================================

-- Drop the restrictive duplicate policy
DROP POLICY IF EXISTS "사용자는 자신의 프로필 정보를 조회할 수 있습" ON public.users;

-- Keep only "View all user profiles" policy which allows SELECT for everyone
-- This prevents issues during auth initialization on page refresh

-- Verify remaining policies
-- Should only have:
-- 1. "View all user profiles" (SELECT, true)
-- 2. "Users update own profile" (UPDATE, auth.uid() = id)
