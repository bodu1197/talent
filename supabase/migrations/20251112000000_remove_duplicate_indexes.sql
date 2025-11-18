-- Remove duplicate indexes to improve performance
-- Identified by Supabase Database Linter

-- ============================================
-- Table: favorites
-- ============================================

-- Drop duplicate index for service_id
-- Keep: idx_favorites_service_id
-- Drop: idx_favorites_service
DROP INDEX IF EXISTS public.idx_favorites_service;

-- Drop duplicate index for user_id + service_id unique constraint
-- Keep: favorites_user_id_service_id_key (unique constraint)
-- Drop: idx_favorites_user_service
DROP INDEX IF EXISTS public.idx_favorites_user_service;

-- ============================================
-- Table: orders
-- ============================================

-- Drop duplicate index for service_id
-- Keep: idx_orders_service_id
-- Drop: idx_orders_service
DROP INDEX IF EXISTS public.idx_orders_service;

-- ============================================
-- Summary
-- ============================================
-- Removed 3 duplicate indexes:
-- 1. idx_favorites_service (duplicate of idx_favorites_service_id)
-- 2. idx_favorites_user_service (duplicate of unique constraint)
-- 3. idx_orders_service (duplicate of idx_orders_service_id)
--
-- Performance Impact: Positive
-- - Reduced storage usage
-- - Faster write operations (INSERT, UPDATE, DELETE)
-- - No impact on read performance (kept essential indexes)
