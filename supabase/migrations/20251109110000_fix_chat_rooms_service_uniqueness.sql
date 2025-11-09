-- Fix chat_rooms to support multiple chat rooms per user pair (one per service)
-- Issue: Same seller (different services) should have separate chat rooms

-- 1. Drop existing unique constraint (user1_id, user2_id)
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_user1_id_user2_id_key;

-- 2. Add new unique constraint including service_id
-- This allows the same two users to have multiple chat rooms for different services
-- NULLS NOT DISTINCT ensures only one chat room with NULL service_id per user pair
ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_users_service_unique
  UNIQUE NULLS NOT DISTINCT (user1_id, user2_id, service_id);

-- 3. Add index for better query performance when filtering by service_id
CREATE INDEX IF NOT EXISTS idx_chat_rooms_service_id ON chat_rooms(service_id) WHERE service_id IS NOT NULL;

-- 4. Comments
COMMENT ON CONSTRAINT chat_rooms_users_service_unique ON chat_rooms IS '동일한 두 사용자는 서비스별로 하나의 채팅방을 가질 수 있음 (NULL도 하나만 허용)';
