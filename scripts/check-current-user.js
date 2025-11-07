const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  console.log('URL:', supabaseUrl ? 'OK' : 'MISSING')
  console.log('Service Key:', supabaseServiceKey ? 'OK' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  try {
    // 1. auth.users에서 사용자 확인
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return
    }

    console.log(`Found ${authUsers.users.length} auth users`)

    if (authUsers.users.length > 0) {
      const firstUser = authUsers.users[0]
      console.log('\nFirst auth user ID:', firstUser.id)

      // 2. public.users 테이블에서 해당 사용자 조회
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', firstUser.id)
        .maybeSingle()

      if (publicError) {
        console.error('\nError fetching public user:', publicError)
        return
      }

      if (publicUser) {
        console.log('\nPublic users table columns:')
        console.log(Object.keys(publicUser))
        console.log('\nSample public user data:')
        console.log(JSON.stringify(publicUser, null, 2))
      } else {
        console.log('\nNo matching user found in public.users table')
        console.log('This user might not have been created in public.users yet')
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkSchema()
