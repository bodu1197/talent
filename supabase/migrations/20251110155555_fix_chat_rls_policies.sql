-- Fix chat_messages UPDATE RLS policies
-- 기존 UPDATE 정책들을 모두 삭제하고 새로 생성

-- 모든 기존 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Users can update messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can mark received messages as read" ON chat_messages;

-- 자신의 메시지를 수정하는 정책
CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
        AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
    )
  );

-- 받은 메시지의 is_read를 업데이트하는 정책
CREATE POLICY "Users can mark received messages as read"
  ON chat_messages FOR UPDATE
  USING (
    sender_id != (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
        AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
    )
  );
