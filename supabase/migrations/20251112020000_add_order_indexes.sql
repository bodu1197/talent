-- Migration: Add indexes for order system performance
-- Date: 2025-11-12
-- Purpose: Optimize orders, order_items, and order_status_history queries

-- =====================================================
-- ORDERS INDEXES
-- =====================================================

-- Index for finding orders by buyer
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id
  ON orders(buyer_id, created_at DESC);

-- Index for finding orders by seller
CREATE INDEX IF NOT EXISTS idx_orders_seller_id
  ON orders(seller_id, created_at DESC);

-- Index for finding orders by service
CREATE INDEX IF NOT EXISTS idx_orders_service_id
  ON orders(service_id);

-- Index for filtering orders by status
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status, created_at DESC);

-- Index for buyer + status queries
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status
  ON orders(buyer_id, status, created_at DESC);

-- Index for seller + status queries
CREATE INDEX IF NOT EXISTS idx_orders_seller_status
  ON orders(seller_id, status, created_at DESC);

-- Index for completed orders (for review eligibility)
CREATE INDEX IF NOT EXISTS idx_orders_completed
  ON orders(buyer_id, created_at DESC)
  WHERE status = 'completed';

-- Index for pending payment orders
CREATE INDEX IF NOT EXISTS idx_orders_pending_payment
  ON orders(created_at DESC)
  WHERE status = 'pending_payment';

-- =====================================================
-- ORDER_ITEMS INDEXES (if table exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'order_items'
  ) THEN
    -- Index for finding items by order
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id
      ON order_items(order_id);

    -- Index for finding items by service
    CREATE INDEX IF NOT EXISTS idx_order_items_service_id
      ON order_items(service_id);

    -- Index for finding items by package
    CREATE INDEX IF NOT EXISTS idx_order_items_package_id
      ON order_items(package_id);
  END IF;
END $$;

-- =====================================================
-- ORDER_STATUS_HISTORY INDEXES (if table exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'order_status_history'
  ) THEN
    -- Index for finding status history by order
    CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
      ON order_status_history(order_id, created_at DESC);

    -- Index for finding status changes
    CREATE INDEX IF NOT EXISTS idx_order_status_history_status
      ON order_status_history(status, created_at DESC);
  END IF;
END $$;

-- =====================================================
-- COMPLETED
-- =====================================================
