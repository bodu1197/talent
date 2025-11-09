-- Fix notification system to prevent accumulation and ensure proper read status updates

-- 1. Add index for better performance on unread message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread
ON chat_messages(room_id, is_read, sender_id)
WHERE is_read = false;

-- 2. Create or replace function to mark messages as read for a room
CREATE OR REPLACE FUNCTION mark_room_messages_as_read(p_room_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE chat_messages
  SET is_read = true,
      updated_at = NOW()
  WHERE room_id = p_room_id
    AND is_read = false
    AND sender_id != p_user_id
  RETURNING COUNT(*) INTO updated_count;

  RETURN COALESCE(updated_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to get unread room count (not message count)
CREATE OR REPLACE FUNCTION get_unread_room_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT cm.room_id)
  INTO unread_count
  FROM chat_messages cm
  INNER JOIN chat_rooms cr ON cm.room_id = cr.id
  WHERE (cr.user1_id = p_user_id OR cr.user2_id = p_user_id)
    AND cm.is_read = false
    AND cm.sender_id != p_user_id;

  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION mark_room_messages_as_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_room_count(UUID) TO authenticated;

-- 5. Add RLS policy for UPDATE on chat_messages for marking as read
DROP POLICY IF EXISTS "Users can mark messages as read in their rooms" ON chat_messages;

CREATE POLICY "Users can mark messages as read in their rooms"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    is_read = true AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );

-- 6. Enable realtime for specific columns on chat_messages
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

COMMENT ON FUNCTION mark_room_messages_as_read IS '특정 채팅방의 모든 읽지 않은 메시지를 읽음 처리';
COMMENT ON FUNCTION get_unread_room_count IS '읽지 않은 메시지가 있는 채팅방 수 반환';