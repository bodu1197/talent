const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function check2ndLevelCategories() {
  console.log('2차 카테고리 확인 중...\n')

  // 모든 카테고리 가져오기
  const { data: allCategories, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, level, display_order')
    .order('level')
    .order('display_order')

  if (error) {
    console.error('Error:', error)
    return
  }

  // 카테고리를 맵으로 변환
  const categoryMap = {}
  allCategories.forEach(cat => {
    categoryMap[cat.id] = cat
  })

  // 2차 카테고리만 필터링
  const secondLevel = allCategories.filter(cat => cat.level === 2)

  // 1차 카테고리별로 그룹화
  const grouped = {}
  secondLevel.forEach(cat => {
    const parent = categoryMap[cat.parent_id]
    const parentName = parent?.name || '알 수 없음'

    if (!grouped[parentName]) {
      grouped[parentName] = []
    }
    grouped[parentName].push({
      name: cat.name,
      slug: cat.slug,
      currentOrder: cat.display_order
    })
  })

  console.log('='.repeat(100))
  console.log('현재 2차 카테고리 목록 (1차 카테고리별)')
  console.log('='.repeat(100))
  console.log('')

  Object.keys(grouped).sort().forEach(parentName => {
    console.log(`\n[${'='.repeat(80)}]`)
    console.log(`  1차: ${parentName}`)
    console.log(`[${'='.repeat(80)}]\n`)

    grouped[parentName].forEach((cat, index) => {
      console.log(`  ${index + 1}. [순서: ${cat.currentOrder}] ${cat.name} (${cat.slug})`)
    })
  })

  console.log('')
  console.log('='.repeat(100))
  console.log(`총 2차 카테고리 개수: ${secondLevel.length}개`)
  console.log('='.repeat(100))
}

check2ndLevelCategories()
