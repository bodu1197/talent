-- Fix chat_messages UPDATE policy to allow marking received messages as read

DROP POLICY IF EXISTS "Users can update messages in their chat rooms" ON chat_messages;

-- 새로운 UPDATE 정책: 자신의 메시지 수정 또는 받은 메시지의 is_read 업데이트 허용
CREATE POLICY "Users can update messages in their chat rooms"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
        AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    -- sender_id는 절대 변경 불가
    sender_id = (
      SELECT sender_id FROM chat_messages AS old_msg
      WHERE old_msg.id = chat_messages.id
    )
    -- 추가 조건 없음 - 채팅방 멤버라면 is_read 업데이트 가능
  );
