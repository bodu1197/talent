-- Optimize RLS policies for performance
-- Fix auth_rls_initplan warnings by wrapping auth.uid() in SELECT
-- Fix multiple_permissive_policies by merging policies

-- ============================================
-- 1. Fix withdrawal_requests RLS policies
-- ============================================

DROP POLICY IF EXISTS "Sellers can create withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can view own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can update own pending withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "View own or all withdrawal requests" ON withdrawal_requests;

-- Optimized: Wrap auth.uid() in (SELECT auth.uid())
CREATE POLICY "Sellers can create withdrawal requests"
ON withdrawal_requests
FOR INSERT
TO authenticated
WITH CHECK (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Sellers can view own withdrawal requests"
ON withdrawal_requests
FOR SELECT
TO authenticated
USING (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Sellers can update own pending withdrawals"
ON withdrawal_requests
FOR UPDATE
TO authenticated
USING (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = (SELECT auth.uid())
  )
  AND status = 'pending'
)
WITH CHECK (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = (SELECT auth.uid())
  )
);

-- ============================================
-- 2. Fix chat_messages RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can mark received messages as read" ON chat_messages;

-- Merge both UPDATE policies into one with OR condition
-- This fixes the multiple_permissive_policies warning
CREATE POLICY "Users can update messages in their rooms"
ON chat_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
  )
  AND (
    -- Can update own messages
    sender_id = (SELECT auth.uid())
    OR
    -- Can mark received messages as read
    (sender_id != (SELECT auth.uid()) AND chat_messages.is_read IS DISTINCT FROM TRUE)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
  )
);

-- Add comment
COMMENT ON POLICY "Users can update messages in their rooms" ON chat_messages IS
'Users can update their own messages or mark received messages as read. Optimized with SELECT auth.uid() for performance.';
