-- Optimize RLS policies for chat tables to improve performance

-- ============================================================================
-- chat_rooms 테이블 RLS 정책 최적화
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can update their chat rooms" ON chat_rooms;

CREATE POLICY "Users can view their own chat rooms"
  ON chat_rooms FOR SELECT
  USING (user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid()));

CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their chat rooms"
  ON chat_rooms FOR UPDATE
  USING (user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid()));

-- ============================================================================
-- chat_messages 테이블 RLS 정책 최적화
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can mark messages as read in their rooms" ON chat_messages;

CREATE POLICY "Users can view messages in their chat rooms"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
        AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can send messages to their chat rooms"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
        AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
    )
  );

-- 통합된 UPDATE 정책 (자신의 메시지 수정 + 읽음 표시)
CREATE POLICY "Users can update messages in their chat rooms"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
        AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
    )
    AND (
      sender_id = (SELECT auth.uid())  -- 자신의 메시지만 수정 가능
      OR sender_id != (SELECT auth.uid())  -- 다른 사람의 메시지는 읽음 표시만 가능
    )
  )
  WITH CHECK (
    sender_id = (SELECT auth.uid())  -- sender_id는 변경 불가
  );

CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR DELETE
  USING (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
        AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
    )
  );

-- ============================================================================
-- chat_favorites 테이블 RLS 정책 최적화
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own favorites" ON chat_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON chat_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON chat_favorites;

CREATE POLICY "Users can view their own favorites"
  ON chat_favorites FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own favorites"
  ON chat_favorites FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own favorites"
  ON chat_favorites FOR DELETE
  USING (user_id = (SELECT auth.uid()));
