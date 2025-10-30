const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategories() {
  console.log('🔍 Checking categories table...\n')

  // Try to fetch all categories
  const { data: allCategories, error: allError } = await supabase
    .from('categories')
    .select('*')

  if (allError) {
    console.error('❌ Error fetching all categories:', allError.message)
    console.error('   Code:', allError.code)
    console.error('   Details:', allError.details)
    console.error('   Hint:', allError.hint)
  } else {
    console.log(`✅ Total categories found: ${allCategories.length}`)
    if (allCategories.length > 0) {
      console.log('\nCategory data sample:')
      console.table(allCategories.slice(0, 5))
    }
  }

  console.log('\n---\n')

  // Try to fetch active level 1 categories (what the page needs)
  const { data: activeLevel1, error: level1Error } = await supabase
    .from('categories')
    .select('id, name, slug, level, parent_id, is_active')
    .eq('is_active', true)
    .eq('level', 1)
    .order('display_order', { ascending: true })

  if (level1Error) {
    console.error('❌ Error fetching level 1 active categories:', level1Error.message)
    console.error('   Code:', level1Error.code)
    console.error('   Details:', level1Error.details)
    console.error('   Hint:', level1Error.hint)
  } else {
    console.log(`✅ Active level 1 categories: ${activeLevel1.length}`)
    if (activeLevel1.length > 0) {
      console.log('\nActive Level 1 Categories:')
      console.table(activeLevel1)
    } else {
      console.log('⚠️  No active level 1 categories found!')
    }
  }
}

checkCategories().catch(console.error)
