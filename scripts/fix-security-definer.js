require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixSecurityDefiner() {
  console.log('Fixing SECURITY DEFINER functions...\n')

  // 1. Fix check_email_exists
  console.log('1. Fixing check_email_exists...')
  const { error: error1 } = await supabase.rpc('exec_sql', {
    sql: `
DROP FUNCTION IF EXISTS check_email_exists(TEXT);

CREATE OR REPLACE FUNCTION check_email_exists(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = check_email
  );
END;
$func$;

GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon, authenticated;
COMMENT ON FUNCTION check_email_exists IS 'Check if an email already exists in auth.users table.';
`
  })

  if (error1) {
    console.error('Error fixing check_email_exists:', error1.message)
  } else {
    console.log('✓ check_email_exists fixed')
  }

  // 2. Fix mark_room_messages_as_read
  console.log('\n2. Fixing mark_room_messages_as_read...')
  const { error: error2 } = await supabase.rpc('exec_sql', {
    sql: `
DROP FUNCTION IF EXISTS mark_room_messages_as_read(UUID, UUID);

CREATE OR REPLACE FUNCTION mark_room_messages_as_read(p_room_id UUID, p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
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
$func$;

GRANT EXECUTE ON FUNCTION mark_room_messages_as_read(UUID, UUID) TO authenticated;
COMMENT ON FUNCTION mark_room_messages_as_read IS 'Mark all unread messages in a room as read.';
`
  })

  if (error2) {
    console.error('Error fixing mark_room_messages_as_read:', error2.message)
  } else {
    console.log('✓ mark_room_messages_as_read fixed')
  }

  // 3. Fix get_unread_room_count
  console.log('\n3. Fixing get_unread_room_count...')
  const { error: error3 } = await supabase.rpc('exec_sql', {
    sql: `
DROP FUNCTION IF EXISTS get_unread_room_count(UUID);

CREATE OR REPLACE FUNCTION get_unread_room_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
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
$func$;

GRANT EXECUTE ON FUNCTION get_unread_room_count(UUID) TO authenticated;
COMMENT ON FUNCTION get_unread_room_count IS 'Get count of rooms with unread messages.';
`
  })

  if (error3) {
    console.error('Error fixing get_unread_room_count:', error3.message)
  } else {
    console.log('✓ get_unread_room_count fixed')
  }

  console.log('\n✅ All functions fixed!')
}

fixSecurityDefiner().catch(console.error)
