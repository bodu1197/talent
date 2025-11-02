-- Fix duplicate_index warnings

-- 1. Drop duplicate index on admins.user_id
-- Keep only the unique constraint index, drop the redundant one
DROP INDEX IF EXISTS public.idx_admins_user_id;

-- 2. Drop duplicate index on buyers.user_id
-- Keep only the unique constraint index, drop the redundant one
DROP INDEX IF EXISTS public.idx_buyers_user_id;

-- 3. Drop duplicate index on sellers.user_id
-- Keep only the unique constraint index, drop the redundant one
DROP INDEX IF EXISTS public.idx_sellers_user_id;
