-- Fix search_path for chat-related functions

-- 1. mark_room_messages_as_read 함수 수정
DROP FUNCTION IF EXISTS public.mark_room_messages_as_read(UUID, UUID);

CREATE OR REPLACE FUNCTION public.mark_room_messages_as_read(p_room_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE chat_messages
  SET is_read = true
  WHERE room_id = p_room_id
    AND sender_id != p_user_id
    AND is_read = false;
END;
$$;

-- 2. get_unread_room_count 함수 수정
DROP FUNCTION IF EXISTS public.get_unread_room_count(UUID);

CREATE OR REPLACE FUNCTION public.get_unread_room_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT room_id)
  INTO v_count
  FROM chat_messages
  WHERE sender_id != p_user_id
    AND is_read = false
    AND room_id IN (
      SELECT id FROM chat_rooms
      WHERE user1_id = p_user_id OR user2_id = p_user_id
    );

  RETURN COALESCE(v_count, 0);
END;
$$;
