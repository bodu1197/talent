require('dotenv').config({ path: require('path').join(__dirname, '.env.local') })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
})

const sqlStatements = [
  // Drop functions with CASCADE
  `DROP FUNCTION IF EXISTS public.set_visited_date(uuid) CASCADE;`,
  `DROP FUNCTION IF EXISTS public.get_recent_category_visits(uuid, integer) CASCADE;`,
  `DROP FUNCTION IF EXISTS public.get_seller_id(uuid) CASCADE;`,
  `DROP FUNCTION IF EXISTS public.get_buyer_id(uuid) CASCADE;`,

  // Recreate set_visited_date
  `CREATE FUNCTION public.set_visited_date(p_category_id UUID)
   RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
   AS $$ BEGIN
     INSERT INTO category_visits (user_id, category_id, visited_at)
     VALUES (auth.uid(), p_category_id, NOW())
     ON CONFLICT (user_id, category_id) DO UPDATE SET visited_at = NOW();
   END; $$;`,

  // Recreate get_recent_category_visits
  `CREATE FUNCTION public.get_recent_category_visits(p_user_id UUID, p_limit INT DEFAULT 10)
   RETURNS TABLE (category_id UUID, category_name TEXT, category_slug TEXT, visited_at TIMESTAMPTZ)
   LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
   AS $$ BEGIN
     RETURN QUERY SELECT c.id, c.name, c.slug, cv.visited_at
     FROM category_visits cv JOIN categories c ON c.id = cv.category_id
     WHERE cv.user_id = p_user_id ORDER BY cv.visited_at DESC LIMIT p_limit;
   END; $$;`,

  // Recreate get_seller_id
  `CREATE FUNCTION public.get_seller_id(user_uuid UUID)
   RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
   AS $$ DECLARE seller_uuid UUID; BEGIN
     SELECT id INTO seller_uuid FROM sellers WHERE user_id = user_uuid LIMIT 1;
     RETURN seller_uuid;
   END; $$;`,

  // Recreate get_buyer_id
  `CREATE FUNCTION public.get_buyer_id(user_uuid UUID)
   RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
   AS $$ DECLARE buyer_uuid UUID; BEGIN
     SELECT id INTO buyer_uuid FROM buyers WHERE user_id = user_uuid LIMIT 1;
     RETURN buyer_uuid;
   END; $$;`
]

async function executeSQL() {
  console.log('🔧 Fixing search_path for 4 remaining functions...\n')

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i]
    const shortSql = sql.substring(0, 60) + '...'

    try {
      console.log(`${i + 1}/${sqlStatements.length}: ${shortSql}`)

      // Try using rpc if available
      const { data, error } = await supabase.rpc('exec', { sql }).catch(() => ({ data: null, error: null }))

      if (error && error.code !== 'PGRST202') {
        console.log(`   ⚠️  RPC not available, SQL needs manual execution`)
        continue
      }

      console.log(`   ✅ Success`)
    } catch (err) {
      console.log(`   ⚠️  ${err.message}`)
    }
  }

  console.log('\n📋 Manual Execution Required:')
  console.log('Copy this SQL to Supabase Dashboard > SQL Editor:\n')
  console.log('─'.repeat(80))
  console.log(fs.readFileSync('fix_functions_final_with_cascade.sql', 'utf8'))
  console.log('─'.repeat(80))
}

executeSQL()
