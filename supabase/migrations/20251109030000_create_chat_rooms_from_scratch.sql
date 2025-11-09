-- Create chat_rooms table from scratch (data may be lost from previous failed migration)

-- 1. Drop any existing tables
DROP TABLE IF EXISTS chat_rooms_new CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;

-- 2. Create new chat_rooms table with user1_id and user2_id
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_users CHECK (user1_id <= user2_id),
  UNIQUE(user1_id, user2_id)
);

-- 3. Create indexes
CREATE INDEX idx_chat_rooms_user1_id ON chat_rooms(user1_id);
CREATE INDEX idx_chat_rooms_user2_id ON chat_rooms(user2_id);
CREATE INDEX idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);

-- 4. Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for chat_rooms
CREATE POLICY "Users can view their own chat rooms"
  ON chat_rooms FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their chat rooms"
  ON chat_rooms FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 6. Recreate trigger for updating last_message_at
CREATE OR REPLACE TRIGGER update_chat_room_last_message_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_last_message();

-- 7. Comments
COMMENT ON TABLE chat_rooms IS '일대일 채팅방 (모든 사용자 간 채팅 가능)';
COMMENT ON COLUMN chat_rooms.user1_id IS '첫 번째 사용자 (user1_id <= user2_id)';
COMMENT ON COLUMN chat_rooms.user2_id IS '두 번째 사용자 (user1_id <= user2_id)';

-- 8. Update chat_messages RLS policies
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

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
