const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function extractAll3rdCategories() {
  console.log('모든 3차 카테고리 추출 중...\n')

  const { data: allCategories, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, level, display_order')
    .order('level')
    .order('parent_id')
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

  // 3차 카테고리만 필터링
  const thirdLevel = allCategories.filter(cat => cat.level === 3)

  // 2차 카테고리별로 그룹화
  const grouped = {}
  thirdLevel.forEach(cat => {
    const parent = categoryMap[cat.parent_id]
    const grandParent = parent ? categoryMap[parent.parent_id] : null

    const key = parent ? parent.slug : 'unknown'

    if (!grouped[key]) {
      grouped[key] = {
        parent1: grandParent?.name || '알 수 없음',
        parent2: parent?.name || '알 수 없음',
        parent2Slug: parent?.slug || 'unknown',
        children: []
      }
    }

    grouped[key].children.push({
      name: cat.name,
      slug: cat.slug,
      currentOrder: cat.display_order
    })
  })

  // 결과를 파일로 저장
  let output = '# 전체 3차 카테고리 목록 (2차 카테고리별)\n\n'
  output += `총 3차 카테고리 개수: ${thirdLevel.length}개\n\n`
  output += '---\n\n'

  const sortedKeys = Object.keys(grouped).sort()

  sortedKeys.forEach(key => {
    const group = grouped[key]
    output += `## ${group.parent1} > ${group.parent2} (${group.parent2Slug})\n\n`
    output += `**3차 카테고리: ${group.children.length}개**\n\n`

    group.children.forEach((cat, index) => {
      output += `${index + 1}. [현재순서: ${cat.currentOrder}] ${cat.name} (${cat.slug})\n`
    })

    output += '\n**정렬 순서 (중요도 기반):**\n\n'
    output += '```\n'
    output += '여기에 중요도 순으로 정렬된 순서를 작성\n'
    output += '```\n\n'
    output += '---\n\n'
  })

  fs.writeFileSync('docs/3rd-categories-all.md', output, 'utf-8')

  console.log('✅ 완료!')
  console.log('📄 파일 저장: docs/3rd-categories-all.md')
  console.log(`📊 총 ${thirdLevel.length}개의 3차 카테고리`)
  console.log(`📁 ${Object.keys(grouped).length}개의 2차 카테고리`)
}

extractAll3rdCategories()
