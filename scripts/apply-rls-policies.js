const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyRLSPolicies() {
  try {
    console.log('🚀 Starting RLS policies application...\n')

    const migrationPath = path.join(__dirname, '../supabase/migrations/20251112000000_add_core_tables_rls_policies.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log(`📏 SQL length: ${sqlContent.length} characters\n`)

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📋 Found ${statements.length} SQL statements\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comment-only lines
      if (statement.startsWith('--')) continue

      const preview = statement.substring(0, 60).replace(/\n/g, ' ')
      console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`)

      try {
        const { data, error } = await supabase.rpc('query', {
          query: statement
        })

        if (error) {
          // Check if error is due to policy already existing
          if (error.message.includes('already exists') ||
              error.message.includes('duplicate key')) {
            console.log(`   ⚠️  Already exists, skipping`)
            successCount++
          } else {
            console.error(`   ❌ Error: ${error.message}`)
            errorCount++
          }
        } else {
          console.log(`   ✅ Success`)
          successCount++
        }
      } catch (err) {
        console.error(`   ❌ Exception: ${err.message}`)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Summary:')
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📋 Total: ${statements.length}`)
    console.log('='.repeat(60))

    if (errorCount === 0) {
      console.log('\n🎉 All RLS policies applied successfully!')
    } else if (errorCount < statements.length / 2) {
      console.log('\n⚠️  Some errors occurred, but most policies were applied')
      console.log('   Review the errors above to see what needs manual attention')
    } else {
      console.log('\n❌ Too many errors occurred')
      console.log('   You may need to apply the migration via Supabase Dashboard SQL Editor')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    console.error('\n💡 Alternative: Apply migration via Supabase Dashboard:')
    console.error('   1. Open Supabase Dashboard → SQL Editor')
    console.error('   2. Copy contents of: supabase/migrations/20251112000000_add_core_tables_rls_policies.sql')
    console.error('   3. Paste and execute')
    process.exit(1)
  }
}

applyRLSPolicies()
