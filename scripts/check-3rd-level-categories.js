const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function check3rdLevelCategories() {
  console.log('3차 카테고리 확인 중...\n')

  // 먼저 모든 카테고리 가져오기
  const { data: allCategories, error: allError } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, level, display_order')
    .order('level')
    .order('parent_id')
    .order('display_order')

  if (allError) {
    console.error('Error:', allError)
    return
  }

  // 카테고리를 맵으로 변환
  const categoryMap = {}
  allCategories.forEach(cat => {
    categoryMap[cat.id] = cat
  })

  // 3차 카테고리만 필터링
  const thirdLevel = allCategories.filter(cat => cat.level === 3)

  console.log('='.repeat(100))
  console.log('3차 카테고리 목록 (2차 카테고리별 그룹)')
  console.log('='.repeat(100))
  console.log('')

  let currentParent = null
  let currentGrandParent = null

  thirdLevel.forEach((cat) => {
    const parent = categoryMap[cat.parent_id]
    const grandParent = parent ? categoryMap[parent.parent_id] : null

    const grandParentName = grandParent?.name || '알 수 없음'
    const parentName = parent?.name || '알 수 없음'

    if (grandParentName !== currentGrandParent) {
      console.log('')
      console.log(`\n[${'='.repeat(80)}]`)
      console.log(`  1차: ${grandParentName}`)
      console.log(`[${'='.repeat(80)}]\n`)
      currentGrandParent = grandParentName
      currentParent = null
    }

    if (parentName !== currentParent) {
      console.log(`\n  ┌─ 2차: ${parentName}`)
      currentParent = parentName
    }

    console.log(`  │   └─ [${cat.display_order || 0}] ${cat.name} (${cat.slug})`)
  })

  console.log('')
  console.log('='.repeat(100))
  console.log(`총 3차 카테고리 개수: ${thirdLevel.length}개`)
  console.log('='.repeat(100))
}

check3rdLevelCategories()
