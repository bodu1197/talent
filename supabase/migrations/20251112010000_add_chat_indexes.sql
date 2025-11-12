-- Migration: Add indexes for chat system performance
-- Date: 2025-11-12
-- Purpose: Optimize chat_rooms, chat_messages, and chat_participants queries

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
  ON chat_messages(chat_room_id, created_at DESC);

-- Index for finding unread messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread
  ON chat_messages(chat_room_id, is_read)
  WHERE is_read = false;

-- Index for finding messages by sender
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender
  ON chat_messages(sender_id);

-- Index for deleted messages (soft delete)
CREATE INDEX IF NOT EXISTS idx_chat_messages_not_deleted
  ON chat_messages(chat_room_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Composite index for room + sender (for permission checks)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_sender
  ON chat_messages(chat_room_id, sender_id);

-- =====================================================
-- CHAT_PARTICIPANTS INDEXES (if table exists)
-- =====================================================

-- Check if chat_participants table exists and add indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'chat_participants'
  ) THEN
    -- Index for finding participants by chat room
    CREATE INDEX IF NOT EXISTS idx_chat_participants_room
      ON chat_participants(chat_room_id);

    -- Index for finding chat rooms by user
    CREATE INDEX IF NOT EXISTS idx_chat_participants_user
      ON chat_participants(user_id);

    -- Composite index for room + user (for permission checks)
    CREATE INDEX IF NOT EXISTS idx_chat_participants_room_user
      ON chat_participants(chat_room_id, user_id);

    -- Index for unread count queries
    CREATE INDEX IF NOT EXISTS idx_chat_participants_unread
      ON chat_participants(user_id, unread_count)
      WHERE unread_count > 0;
  END IF;
END $$;

-- =====================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- =====================================================

-- Expected query improvements:
-- 1. Fetching user's chat rooms: 10-100x faster
-- 2. Loading messages in a chat: 5-50x faster
-- 3. Counting unread messages: 20-200x faster
-- 4. Searching by service: 5-20x faster

-- =====================================================
-- COMPLETED
-- =====================================================
