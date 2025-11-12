-- This migration fixes a critical security flaw in the chat_messages UPDATE RLS policy.
-- The previous policy allowed users to update messages sent by others.
-- This is corrected by splitting the policy into two more restrictive policies.

-- Drop the flawed, overly permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their chat rooms" ON public.chat_messages;


-- Policy 1: Allow users to update the content of THEIR OWN messages.
CREATE POLICY "Users can update their own messages"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  sender_id = (SELECT auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
  )
)
WITH CHECK (
  sender_id = (SELECT auth.uid()) -- Ensure sender_id cannot be changed
);

-- Policy 2: Allow users to mark received messages as read.
-- This policy is intentionally narrow: it only allows updating the is_read status.
-- A trigger will be added to prevent modification of other columns.
CREATE POLICY "Users can mark received messages as read"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  sender_id != (SELECT auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = (SELECT auth.uid()) OR chat_rooms.user2_id = (SELECT auth.uid()))
  )
);

-- Trigger function to prevent modification of other columns when marking as read
CREATE OR REPLACE FUNCTION prevent_message_content_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the update is on a message from another user
  IF OLD.sender_id != (SELECT auth.uid()) THEN
    -- Allow only is_read and updated_at to be changed
    IF NEW.content IS DISTINCT FROM OLD.content OR
       NEW.sender_id IS DISTINCT FROM OLD.sender_id OR
       NEW.room_id IS DISTINCT FROM OLD.room_id OR
       NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN
      RAISE EXCEPTION 'Cannot modify content of a message from another user.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create the new one
DROP TRIGGER IF EXISTS prevent_content_update_trigger ON public.chat_messages;
CREATE TRIGGER prevent_content_update_trigger
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION prevent_message_content_update();

COMMENT ON POLICY "Users can update their own messages" ON public.chat_messages IS 'Users can edit the content of messages they have sent.';
COMMENT ON POLICY "Users can mark received messages as read" ON public.t_messages IS 'Users can update the is_read status of messages they have received.';
COMMENT ON TRIGGER prevent_content_update_trigger ON public.chat_messages IS 'Ensures that when updating a received message, only non-content fields like is_read can be changed.';
