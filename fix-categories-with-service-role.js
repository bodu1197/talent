const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function fixCategories() {
  console.log('🔧 Fixing categories level values...\n')

  // Step 1: Update level 1 (top-level categories with no parent)
  console.log('Step 1: Setting level 1 for top-level categories...')
  const { data: level1Data, error: error1 } = await supabase
    .from('categories')
    .update({ level: 1 })
    .is('parent_id', null)
    .select('id, name')

  if (error1) {
    console.error('❌ Error updating level 1:', error1)
    return
  }
  console.log(`✅ Updated ${level1Data?.length || 0} level 1 categories`)

  // Step 2: Get all level 1 IDs
  const { data: level1Cats } = await supabase
    .from('categories')
    .select('id')
    .eq('level', 1)

  if (level1Cats && level1Cats.length > 0) {
    console.log('\nStep 2: Setting level 2 for categories with level 1 parents...')
    const level1Ids = level1Cats.map(c => c.id)

    const { data: level2Data, error: error2 } = await supabase
      .from('categories')
      .update({ level: 2 })
      .in('parent_id', level1Ids)
      .select('id, name')

    if (error2) {
      console.error('❌ Error updating level 2:', error2)
      return
    }
    console.log(`✅ Updated ${level2Data?.length || 0} level 2 categories`)

    // Step 3: Get all level 2 IDs
    const { data: level2Cats } = await supabase
      .from('categories')
      .select('id')
      .eq('level', 2)

    if (level2Cats && level2Cats.length > 0) {
      console.log('\nStep 3: Setting level 3 for categories with level 2 parents...')
      const level2Ids = level2Cats.map(c => c.id)

      const { data: level3Data, error: error3 } = await supabase
        .from('categories')
        .update({ level: 3 })
        .in('parent_id', level2Ids)
        .select('id, name')

      if (error3) {
        console.error('❌ Error updating level 3:', error3)
        return
      }
      console.log(`✅ Updated ${level3Data?.length || 0} level 3 categories`)
    }
  }

  // Verification
  console.log('\n📊 Verification:')

  const { count: count1 } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('level', 1)
    .eq('is_active', true)

  const { count: count2 } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('level', 2)
    .eq('is_active', true)

  const { count: count3 } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('level', 3)
    .eq('is_active', true)

  console.log(`\nActive categories by level:`)
  console.log(`  Level 1: ${count1 || 0}`)
  console.log(`  Level 2: ${count2 || 0}`)
  console.log(`  Level 3: ${count3 || 0}`)

  // Show sample level 1 categories
  const { data: sampleLevel1 } = await supabase
    .from('categories')
    .select('id, name, slug, level')
    .eq('level', 1)
    .eq('is_active', true)
    .order('display_order')
    .limit(10)

  if (sampleLevel1 && sampleLevel1.length > 0) {
    console.log('\n📋 Sample Level 1 Categories (for service registration):')
    console.table(sampleLevel1)
  }

  console.log('\n✅ Categories fixed! Now check https://talent-zeta.vercel.app/mypage/seller/services/new')
}

fixCategories().catch(console.error)
