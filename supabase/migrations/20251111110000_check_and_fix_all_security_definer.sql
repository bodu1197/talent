-- Check all SECURITY DEFINER functions
-- Run this to see which functions need fixing:
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_schema = 'public' AND security_type = 'DEFINER';

-- Fix ALL known SECURITY DEFINER functions with search_path

-- 1. check_email_exists (already has search_path, but recreate to be sure)
DROP FUNCTION IF EXISTS check_email_exists(TEXT);

CREATE OR REPLACE FUNCTION check_email_exists(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = check_email
  );
END;
$$;

COMMENT ON FUNCTION check_email_exists IS 'Check if an email already exists in auth.users table. Used for duplicate email validation during registration.';

-- 2. mark_room_messages_as_read
DROP FUNCTION IF EXISTS mark_room_messages_as_read(UUID, UUID);

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
    AND sender_id != p_user_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- 3. get_unread_room_count
DROP FUNCTION IF EXISTS get_unread_room_count(UUID);

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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_room_messages_as_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_room_count(UUID) TO authenticated;

-- Add comments
COMMENT ON FUNCTION mark_room_messages_as_read IS 'Mark all unread messages in a room as read. SECURITY DEFINER with search_path set for security.';
COMMENT ON FUNCTION get_unread_room_count IS 'Get count of rooms with unread messages. SECURITY DEFINER with search_path set for security.';
