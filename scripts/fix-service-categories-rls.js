require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function fixServiceCategoriesRLS() {
  console.log('🔧 Fixing service_categories RLS policy...\n')

  // 1. 기존 정책 확인
  console.log('📋 Checking existing policies...')
  const { data: existingPolicies, error: checkError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT policyname, cmd, roles
        FROM pg_policies
        WHERE tablename = 'service_categories'
        ORDER BY policyname;
      `
    })
    .catch(() => ({ data: null, error: { message: 'RPC not available, using direct query' } }))

  if (checkError && !checkError.message.includes('not available')) {
    console.error('❌ Error checking policies:', checkError)
  } else if (existingPolicies) {
    console.log('Existing policies:', JSON.stringify(existingPolicies, null, 2))
  }

  // 2. RLS 정책 수정
  const sql = `
-- service_categories 테이블에 대한 SELECT 권한 정책 추가

-- 기존 정책이 있다면 삭제
DROP POLICY IF EXISTS "Anyone can view service categories" ON public.service_categories;

-- 새로운 SELECT 정책 생성 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view service categories"
ON public.service_categories
FOR SELECT
USING (true);

-- RLS 활성화 확인
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
  `

  console.log('\n🚀 Executing SQL...\n')
  console.log(sql)
  console.log('\n' + '='.repeat(80) + '\n')

  // Supabase의 SQL API를 통해 실행
  const { data, error } = await supabase.rpc('exec_sql', { sql })
    .catch(() => ({ data: null, error: null }))

  if (error) {
    console.log('\n⚠️  RPC not available. Please run this SQL manually in Supabase Dashboard:\n')
    console.log('='.repeat(80))
    console.log(sql)
    console.log('='.repeat(80))
    console.log('\nSteps:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Copy and paste the SQL above')
    console.log('3. Click "Run"\n')
  } else {
    console.log('✅ Successfully updated service_categories RLS policy!')
    console.log('\n📋 Verifying new policy...')

    const { data: newPolicies } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT policyname, cmd, roles, qual
          FROM pg_policies
          WHERE tablename = 'service_categories'
          ORDER BY policyname;
        `
      })
      .catch(() => ({ data: null }))

    if (newPolicies) {
      console.log('New policies:', JSON.stringify(newPolicies, null, 2))
    }
  }
}

fixServiceCategoriesRLS()
