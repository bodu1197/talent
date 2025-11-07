const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsersSchema() {
  try {
    // users 테이블에서 한 행만 조회하여 컬럼 확인
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    if (data) {
      console.log('Users table columns:')
      console.log(Object.keys(data))
      console.log('\nSample data:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.log('No users found in the table')
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

checkUsersSchema()
