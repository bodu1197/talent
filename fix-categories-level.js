const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
// Service role key needed for updates - using anon key might not work
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixCategoriesLevel() {
  console.log('🔧 Fixing categories level...\n')

  // Step 1: Set level 1 for categories with no parent (top level)
  console.log('Step 1: Setting level 1 for top-level categories (parent_id IS NULL)...')
  const { data: level1Updated, error: error1 } = await supabase
    .from('categories')
    .update({ level: 1 })
    .is('parent_id', null)
    .select('id, name')

  if (error1) {
    console.error('❌ Error updating level 1:', error1.message)
    return
  }
  console.log(`✅ Updated ${level1Updated?.length || 0} level 1 categories`)

  // Step 2: Set level 2 for categories with parent
  console.log('\nStep 2: Setting level 2 for categories with parent...')

  // Get all level 1 category IDs
  const { data: level1Cats } = await supabase
    .from('categories')
    .select('id')
    .eq('level', 1)

  if (level1Cats && level1Cats.length > 0) {
    const level1Ids = level1Cats.map(c => c.id)

    const { data: level2Updated, error: error2 } = await supabase
      .from('categories')
      .update({ level: 2 })
      .in('parent_id', level1Ids)
      .select('id, name')

    if (error2) {
      console.error('❌ Error updating level 2:', error2.message)
      return
    }
    console.log(`✅ Updated ${level2Updated?.length || 0} level 2 categories`)

    // Step 3: Set level 3 for remaining categories
    console.log('\nStep 3: Setting level 3 for categories with level 2 parents...')

    const { data: level2Cats } = await supabase
      .from('categories')
      .select('id')
      .eq('level', 2)

    if (level2Cats && level2Cats.length > 0) {
      const level2Ids = level2Cats.map(c => c.id)

      const { data: level3Updated, error: error3 } = await supabase
        .from('categories')
        .update({ level: 3 })
        .in('parent_id', level2Ids)
        .select('id, name')

      if (error3) {
        console.error('❌ Error updating level 3:', error3.message)
        return
      }
      console.log(`✅ Updated ${level3Updated?.length || 0} level 3 categories`)
    }
  }

  // Verify results
  console.log('\n📊 Verification:')

  const { data: level1Count } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('level', 1)
    .eq('is_active', true)

  const { data: level2Count } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('level', 2)
    .eq('is_active', true)

  const { data: level3Count } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('level', 3)
    .eq('is_active', true)

  console.log(`\nActive categories by level:`)
  console.log(`  Level 1: ${level1Count || 0}`)
  console.log(`  Level 2: ${level2Count || 0}`)
  console.log(`  Level 3: ${level3Count || 0}`)

  // Show sample level 1 categories
  const { data: sampleLevel1 } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('level', 1)
    .eq('is_active', true)
    .limit(10)

  if (sampleLevel1 && sampleLevel1.length > 0) {
    console.log('\n📋 Sample Level 1 Categories:')
    console.table(sampleLevel1)
  }

  console.log('\n✅ Done!')
}

fixCategoriesLevel().catch(console.error)
