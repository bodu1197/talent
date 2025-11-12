-- Migration: Add indexes for services and reviews performance
-- Date: 2025-11-12
-- Purpose: Optimize services, service_packages, reviews, and categories queries

-- =====================================================
-- SERVICES INDEXES
-- =====================================================

-- Index for finding services by seller
CREATE INDEX IF NOT EXISTS idx_services_seller_id
  ON services(seller_id, created_at DESC);

-- Index for active services (most common public query)
CREATE INDEX IF NOT EXISTS idx_services_active
  ON services(created_at DESC)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_services_status
  ON services(status, created_at DESC)
  WHERE deleted_at IS NULL;

-- Index for finding services by category
CREATE INDEX IF NOT EXISTS idx_services_category_id
  ON services(category_id, created_at DESC)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Index for seller + status queries
CREATE INDEX IF NOT EXISTS idx_services_seller_status
  ON services(seller_id, status, created_at DESC);

-- Index for soft-deleted services
CREATE INDEX IF NOT EXISTS idx_services_deleted
  ON services(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Index for price range queries
CREATE INDEX IF NOT EXISTS idx_services_price
  ON services(min_price, max_price)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Index for popular services (by view count, if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'view_count'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_services_popular
      ON services(view_count DESC)
      WHERE status = 'active' AND deleted_at IS NULL;
  END IF;
END $$;

-- =====================================================
-- SERVICE_PACKAGES INDEXES
-- =====================================================

-- Index for finding packages by service
CREATE INDEX IF NOT EXISTS idx_service_packages_service_id
  ON service_packages(service_id, display_order);

-- Index for package type filtering
CREATE INDEX IF NOT EXISTS idx_service_packages_type
  ON service_packages(package_type);

-- Composite index for service + active packages
CREATE INDEX IF NOT EXISTS idx_service_packages_service_active
  ON service_packages(service_id, is_active, display_order);

-- =====================================================
-- REVIEWS INDEXES
-- =====================================================

-- Index for finding reviews by service
CREATE INDEX IF NOT EXISTS idx_reviews_service_id
  ON reviews(service_id, created_at DESC)
  WHERE is_visible = true AND moderated = false;

-- Index for finding reviews by buyer
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id
  ON reviews(buyer_id, created_at DESC);

-- Index for finding reviews by seller
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id
  ON reviews(seller_id, created_at DESC);

-- Index for finding reviews by order
CREATE INDEX IF NOT EXISTS idx_reviews_order_id
  ON reviews(order_id);

-- Index for rating queries
CREATE INDEX IF NOT EXISTS idx_reviews_rating
  ON reviews(service_id, rating)
  WHERE is_visible = true AND moderated = false;

-- Index for visible public reviews
CREATE INDEX IF NOT EXISTS idx_reviews_public
  ON reviews(created_at DESC)
  WHERE is_visible = true AND moderated = false;

-- Index for moderation queue
CREATE INDEX IF NOT EXISTS idx_reviews_moderation
  ON reviews(created_at)
  WHERE moderated = true OR is_visible = false;

-- =====================================================
-- CATEGORIES INDEXES
-- =====================================================

-- Index for category hierarchy
CREATE INDEX IF NOT EXISTS idx_categories_parent_id
  ON categories(parent_id, display_order);

-- Index for active categories
CREATE INDEX IF NOT EXISTS idx_categories_active
  ON categories(is_active, display_order);

-- Index for category slug (for URL routing)
CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON categories(slug)
  WHERE is_active = true;

-- Index for root categories
CREATE INDEX IF NOT EXISTS idx_categories_root
  ON categories(display_order)
  WHERE parent_id IS NULL AND is_active = true;

-- =====================================================
-- CATEGORY_VISITS INDEXES (if table exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'category_visits'
  ) THEN
    -- Index for finding visits by category
    CREATE INDEX IF NOT EXISTS idx_category_visits_category_id
      ON category_visits(category_id, visited_at DESC);

    -- Index for finding visits by user
    CREATE INDEX IF NOT EXISTS idx_category_visits_user_id
      ON category_visits(user_id, visited_at DESC);

    -- Index for analytics queries
    CREATE INDEX IF NOT EXISTS idx_category_visits_date
      ON category_visits(visited_at DESC);
  END IF;
END $$;

-- =====================================================
-- FAVORITES INDEXES (if table exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'favorites'
  ) THEN
    -- Index for finding favorites by user
    CREATE INDEX IF NOT EXISTS idx_favorites_user_id
      ON favorites(user_id, created_at DESC);

    -- Index for finding favorites by service
    CREATE INDEX IF NOT EXISTS idx_favorites_service_id
      ON favorites(service_id);

    -- Composite unique index for user + service
    CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_service
      ON favorites(user_id, service_id);

    -- Index for favorite count queries
    CREATE INDEX IF NOT EXISTS idx_favorites_count
      ON favorites(service_id)
      WHERE deleted_at IS NULL;
  END IF;
END $$;

-- =====================================================
-- COMPLETED
-- =====================================================
