-- Fix: Remove last_message column reference from trigger function
-- The chat_rooms table only has last_message_at, not last_message

CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE chat_rooms
  SET
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.room_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_chat_room_last_message IS 'Trigger function to update chat room last message timestamp with secure search_path';
