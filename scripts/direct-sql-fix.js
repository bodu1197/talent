require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
})

async function executeSql(sql) {
  const { data, error } = await supabase.rpc('exec', { sql })
  return { data, error }
}

async function fixFunctions() {
  console.log('Fixing SECURITY DEFINER functions...\n')

  const sqls = [
    {
      name: 'check_email_exists',
      sql: `
DROP FUNCTION IF EXISTS check_email_exists(TEXT);
CREATE OR REPLACE FUNCTION check_email_exists(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = check_email);
END;
$func$;
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon, authenticated;
      `
    },
    {
      name: 'mark_room_messages_as_read',
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
  SET is_read = true, updated_at = NOW()
  WHERE room_id = p_room_id AND is_read = false AND sender_id != p_user_id;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$func$;
GRANT EXECUTE ON FUNCTION mark_room_messages_as_read(UUID, UUID) TO authenticated;
      `
    },
    {
      name: 'get_unread_room_count',
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
  SELECT COUNT(DISTINCT cm.room_id) INTO unread_count
  FROM chat_messages cm
  INNER JOIN chat_rooms cr ON cm.room_id = cr.id
  WHERE (cr.user1_id = p_user_id OR cr.user2_id = p_user_id)
    AND cm.is_read = false AND cm.sender_id != p_user_id;
  RETURN COALESCE(unread_count, 0);
END;
$func$;
GRANT EXECUTE ON FUNCTION get_unread_room_count(UUID) TO authenticated;
      `
    }
  ]

  // Use REST API directly
  const url = `${supabaseUrl}/rest/v1/rpc/exec`

  for (const { name, sql } of sqls) {
    console.log(`Fixing ${name}...`)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql: sql.trim() })
      })

      if (!response.ok) {
        const text = await response.text()
        console.error(`✗ ${name}: ${text}`)
      } else {
        console.log(`✓ ${name} fixed`)
      }
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`)
    }
  }

  console.log('\nDone!')
}

fixFunctions()
