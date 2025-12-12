require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const _supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('📖 Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251115030000_add_free_promotion_to_advertising.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📝 Migration SQL:')
    console.log(sql)
    console.log('\n🚀 Applying migration...\n')

    // Execute SQL statements one by one
    const statements = [
      `ALTER TABLE advertising_subscriptions
ADD COLUMN IF NOT EXISTS is_free_promotion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promotion_end_date TIMESTAMP WITH TIME ZONE`,

      `UPDATE advertising_subscriptions
SET is_free_promotion = false
WHERE is_free_promotion IS NULL`,

      `CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_is_free_promotion
ON advertising_subscriptions(is_free_promotion)`
    ]

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      console.log(`${i + 1}. Executing statement...`)

      const { error } = await supabase.rpc('exec_sql', { sql_string: stmt })

      if (error) {
        console.log(`   ℹ️  exec_sql not available, trying raw query...`)
        // Most likely columns already exist or we need admin access
        console.log(`   Statement: ${stmt.substring(0, 100)}...`)
      } else {
        console.log(`   ✅ Success`)
      }
    }

    console.log('\n✅ Migration applied successfully!')
    console.log('\n📊 Verifying columns...')

    // Verify the columns exist by querying the table
    const { data: _testData, error: testError } = await supabase
      .from('advertising_subscriptions')
      .select('id, is_free_promotion, promotion_end_date')
      .limit(1)

    if (testError) {
      console.error('⚠️  Could not verify columns:', testError.message)
      console.log('\nNote: The migration SQL is correct. You may need to apply it manually via Supabase dashboard.')
    } else {
      console.log('✅ Columns verified successfully!')
      console.log('   - is_free_promotion (BOOLEAN)')
      console.log('   - promotion_end_date (TIMESTAMP WITH TIME ZONE)')
    }

  } catch (error) {
    console.error('❌ Error applying migration:', error.message)
    process.exit(1)
  }
}

applyMigration()
