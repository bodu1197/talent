-- ============================================
-- Remove coupon and cash features
-- ============================================
-- Purpose:
-- - Remove coupon/cash functionality from the platform
-- - Drop related tables
-- ============================================

-- Drop user_coupons table (junction table, drop first)
DROP TABLE IF EXISTS public.user_coupons CASCADE;

-- Drop coupons table
DROP TABLE IF EXISTS public.coupons CASCADE;

-- ============================================
-- Migration Notes
-- ============================================
-- This migration removes the coupon and cash features:
-- 1. Removed from buyer dashboard UI
-- 2. Deleted /mypage/buyer/coupons page and all subpages
-- 3. Dropped database tables: user_coupons, coupons
-- 4. Simplified buyer experience by focusing on core functionality
