-- Fix: Refactor chat_rooms to support chat between any two users
-- Handle case where user1_id and user2_id might be the same (should not happen, but handle it)

-- 1. Create new chat_rooms table with user1_id and user2_id
CREATE TABLE IF NOT EXISTS chat_rooms_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 두 사용자 간에는 하나의 채팅방만 존재 (순서 무관)
  -- user1_id는 항상 user2_id보다 작거나 같아야 함
  CONSTRAINT unique_users CHECK (user1_id <= user2_id),
  UNIQUE(user1_id, user2_id)
);

-- 2. Copy data from old table to new table
-- Filter out cases where buyer_id = seller.user_id (same user as both buyer and seller)
INSERT INTO chat_rooms_new (id, user1_id, user2_id, service_id, last_message_at, created_at, updated_at)
SELECT
  cr.id,
  LEAST(cr.buyer_id, s.user_id) as user1_id,
  GREATEST(cr.buyer_id, s.user_id) as user2_id,
  cr.service_id,
  cr.last_message_at,
  cr.created_at,
  cr.updated_at
FROM chat_rooms cr
JOIN sellers s ON s.id = cr.seller_id
WHERE cr.buyer_id != s.user_id  -- Skip if same user is both buyer and seller
ON CONFLICT (user1_id, user2_id) DO NOTHING;

-- 3. Drop old table and rename new table
DROP TABLE IF EXISTS chat_rooms CASCADE;
ALTER TABLE chat_rooms_new RENAME TO chat_rooms;

-- 4. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1_id ON chat_rooms(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2_id ON chat_rooms(user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);

-- 5. Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- 사용자는 자신이 참여한 채팅방만 조회 가능
CREATE POLICY "Users can view their own chat rooms"
  ON chat_rooms FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 사용자는 채팅방 생성 가능
CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 채팅방 업데이트 (last_message_at 등)
CREATE POLICY "Users can update their chat rooms"
  ON chat_rooms FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Comments
COMMENT ON TABLE chat_rooms IS '일대일 채팅방 (모든 사용자 간 채팅 가능)';
COMMENT ON COLUMN chat_rooms.user1_id IS '첫 번째 사용자 (user1_id <= user2_id)';
COMMENT ON COLUMN chat_rooms.user2_id IS '두 번째 사용자 (user1_id <= user2_id)';

-- 8. Update chat_messages RLS policies to work with new chat_rooms structure
-- Drop old policies
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

-- Create new policies
CREATE POLICY "Users can view messages in their chat rooms"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their chat rooms"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR DELETE
  USING (sender_id = auth.uid());
