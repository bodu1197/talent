-- Migration: Add indexes for notification system performance
-- Date: 2025-11-12
-- Purpose: Optimize notifications queries

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
-- COMPLETED
-- =====================================================
