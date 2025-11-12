-- ============================================
-- 데이터베이스 인덱스 적용 스크립트 (수정 버전)
-- 이 파일을 Supabase SQL Editor에서 실행하세요
-- ============================================

-- =====================================================
-- CHAT_ROOMS INDEXES
-- =====================================================

-- Index for finding chat rooms by user (most common query)
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1_id
  ON chat_rooms(user1_id);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2_id
  ON chat_rooms(user2_id);

-- Index for sorting chat rooms by last message time
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message_at
  ON chat_rooms(last_message_at DESC);

-- Index for finding chat rooms by service
CREATE INDEX IF NOT EXISTS idx_chat_rooms_service_id
  ON chat_rooms(service_id)
  WHERE service_id IS NOT NULL;

-- Composite index for user + last message ordering
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1_last_message
  ON chat_rooms(user1_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2_last_message
  ON chat_rooms(user2_id, last_message_at DESC);

-- =====================================================
-- CHAT_MESSAGES INDEXES
-- =====================================================

-- Index for finding messages by chat room (with ordering)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created
  ON chat_messages(room_id, created_at DESC);

-- Index for finding unread messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread
  ON chat_messages(room_id, is_read)
  WHERE is_read = false;

-- Index for finding messages by sender
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender
  ON chat_messages(sender_id);

-- Index for deleted messages (soft delete)
CREATE INDEX IF NOT EXISTS idx_chat_messages_not_deleted
  ON chat_messages(room_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Composite index for room + sender (for permission checks)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_sender
  ON chat_messages(room_id, sender_id);

-- =====================================================
-- CHAT_PARTICIPANTS INDEXES (if table exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'chat_participants'
  ) THEN
    -- Index for finding participants by chat room
    CREATE INDEX IF NOT EXISTS idx_chat_participants_room
      ON chat_participants(room_id);

    -- Index for finding chat rooms by user
    CREATE INDEX IF NOT EXISTS idx_chat_participants_user
      ON chat_participants(user_id);

    -- Composite index for room + user (for permission checks)
    CREATE INDEX IF NOT EXISTS idx_chat_participants_room_user
      ON chat_participants(room_id, user_id);

    -- Index for unread count queries
    CREATE INDEX IF NOT EXISTS idx_chat_participants_unread
      ON chat_participants(user_id, unread_count)
      WHERE unread_count > 0;
  END IF;
END $$;

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
-- NOTIFICATIONS INDEXES
-- =====================================================

-- Index for finding notifications by user (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON notifications(user_id, created_at DESC);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, created_at DESC)
  WHERE is_read = false;

-- Index for filtering by notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON notifications(user_id, type, created_at DESC);

-- Index for finding notifications by related entity
CREATE INDEX IF NOT EXISTS idx_notifications_entity
  ON notifications(entity_type, entity_id);

-- Composite index for user + type + read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_read
  ON notifications(user_id, type, is_read, created_at DESC);

-- Index for cleanup/archival (old read notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_cleanup
  ON notifications(created_at)
  WHERE is_read = true;

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
-- 인덱스 생성 확인
-- =====================================================

SELECT
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
