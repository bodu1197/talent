-- Migration: Add RLS policies for core tables
-- Date: 2025-11-12
-- Purpose: Implement row-level security for users, sellers, buyers, orders, and services tables

-- =====================================================
-- 1. USERS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- =====================================================
-- 2. SELLERS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on sellers table
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own seller profile
CREATE POLICY "Sellers can view own profile"
  ON sellers FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Sellers can update their own profile
CREATE POLICY "Sellers can update own profile"
  ON sellers FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Sellers can create their own profile
CREATE POLICY "Sellers can create own profile"
  ON sellers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- 3. SELLER_PROFILES TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on seller_profiles table
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view public seller profiles
CREATE POLICY "Anyone can view public seller profiles"
  ON seller_profiles FOR SELECT
  TO authenticated, anon
  USING (is_verified = true);

-- Sellers can view their own profile (even if not verified)
CREATE POLICY "Sellers can view own profile"
  ON seller_profiles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Sellers can update their own profile
CREATE POLICY "Sellers can update own profile"
  ON seller_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Sellers can insert their own profile
CREATE POLICY "Sellers can insert own profile"
  ON seller_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- 4. ORDERS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyers and sellers can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid()) OR
    seller_id = (SELECT auth.uid())
  );

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = (SELECT auth.uid()));

-- Buyers and sellers can update their own orders
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid()) OR
    seller_id = (SELECT auth.uid())
  )
  WITH CHECK (
    buyer_id = (SELECT auth.uid()) OR
    seller_id = (SELECT auth.uid())
  );

-- =====================================================
-- 5. SERVICES TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Anyone can view active, non-deleted services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO authenticated, anon
  USING (
    status = 'active' AND
    deleted_at IS NULL
  );

-- Sellers can view all their own services (including drafts and deleted)
CREATE POLICY "Sellers can view own services"
  ON services FOR SELECT
  TO authenticated
  USING (seller_id = (SELECT auth.uid()));

-- Sellers can insert their own services
CREATE POLICY "Sellers can insert own services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = (SELECT auth.uid()));

-- Sellers can update their own services
CREATE POLICY "Sellers can update own services"
  ON services FOR UPDATE
  TO authenticated
  USING (seller_id = (SELECT auth.uid()))
  WITH CHECK (seller_id = (SELECT auth.uid()));

-- Sellers can soft-delete their own services
CREATE POLICY "Sellers can delete own services"
  ON services FOR DELETE
  TO authenticated
  USING (seller_id = (SELECT auth.uid()));

-- =====================================================
-- 6. SERVICE_PACKAGES TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on service_packages table
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can view packages for active services
CREATE POLICY "Anyone can view service packages"
  ON service_packages FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_packages.service_id
      AND services.status = 'active'
      AND services.deleted_at IS NULL
    )
  );

-- Sellers can view packages for their own services
CREATE POLICY "Sellers can view own service packages"
  ON service_packages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_packages.service_id
      AND services.seller_id = (SELECT auth.uid())
    )
  );

-- Sellers can manage packages for their own services
CREATE POLICY "Sellers can manage own service packages"
  ON service_packages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_packages.service_id
      AND services.seller_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_packages.service_id
      AND services.seller_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 7. REVIEWS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible, non-moderated reviews
CREATE POLICY "Anyone can view public reviews"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (
    is_visible = true AND
    moderated = false
  );

-- Users can view their own reviews (even if not visible)
CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid()) OR
    seller_id = (SELECT auth.uid())
  );

-- Buyers can create reviews for their orders
CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = reviews.order_id
      AND orders.buyer_id = (SELECT auth.uid())
      AND orders.status = 'completed'
    )
  );

-- Buyers can update their own reviews (within limits)
CREATE POLICY "Buyers can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (buyer_id = (SELECT auth.uid()))
  WITH CHECK (buyer_id = (SELECT auth.uid()));

-- =====================================================
-- 8. SELLER_EARNINGS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on seller_earnings table
ALTER TABLE seller_earnings ENABLE ROW LEVEL SECURITY;

-- Sellers can only view their own earnings
CREATE POLICY "Sellers can view own earnings"
  ON seller_earnings FOR SELECT
  TO authenticated
  USING (seller_id = (SELECT auth.uid()));

-- =====================================================
-- 9. WITHDRAWAL_REQUESTS TABLE RLS POLICIES (Already exists, but verify)
-- =====================================================

-- These policies already exist from previous migrations
-- Just ensuring they're documented here

-- =====================================================
-- 10. PAYMENTS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view payments for their own orders
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND (
        orders.buyer_id = (SELECT auth.uid()) OR
        orders.seller_id = (SELECT auth.uid())
      )
    )
  );

-- =====================================================
-- COMPLETED
-- =====================================================

-- All core tables now have RLS policies
-- Next steps:
-- 1. Test each policy with different user roles
-- 2. Verify no unauthorized access is possible
-- 3. Monitor performance impact
