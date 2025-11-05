const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function apply3rdReorder() {
  console.log('='.repeat(60))
  console.log('3차 카테고리 재정렬 실행 중...')
  console.log('='.repeat(60))
  console.log('')

  // SQL 파일 읽기
  const sqlContent = fs.readFileSync('scripts/reorder-all-3rd-categories.sql', 'utf-8')

  // UPDATE 문만 추출
  const updateLines = sqlContent
    .split('\n')
    .filter(line => line.trim().startsWith('UPDATE categories SET display_order'))

  console.log(`📊 총 ${updateLines.length}개 UPDATE 문 발견`)
  console.log('')

  let successCount = 0
  let errorCount = 0

  for (const line of updateLines) {
    // UPDATE categories SET display_order = 1 WHERE id = 'xxx'; -- name
    const match = line.match(/display_order = (\d+) WHERE id = '([^']+)'/)

    if (match) {
      const [, order, id] = match

      const { error } = await supabase
        .from('categories')
        .update({ display_order: parseInt(order) })
        .eq('id', id)
        .eq('level', 3)

      if (error) {
        console.error(`❌ Error updating ${id}:`, error.message)
        errorCount++
      } else {
        successCount++
        if (successCount % 20 === 0) {
          console.log(`✅ ${successCount}개 업데이트 완료...`)
        }
      }
    }
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('✅ 완료!')
  console.log(`📊 성공: ${successCount}개`)
  if (errorCount > 0) {
    console.log(`❌ 실패: ${errorCount}개`)
  }
  console.log('='.repeat(60))

  // 기타 카테고리 확인
  console.log('')
  console.log('기타 항목 위치 확인 (각 그룹에서 마지막인지):')
  console.log('-'.repeat(60))

  const { data: etcCategories } = await supabase
    .from('categories')
    .select('id, name, slug, display_order, parent_id')
    .eq('level', 3)
    .or('name.like.%기타%,slug.like.%etc%,slug.like.%other%')
    .order('parent_id')
    .order('display_order')

  for (const cat of etcCategories) {
    // 같은 parent_id의 최대 display_order 확인
    const { data: siblings } = await supabase
      .from('categories')
      .select('display_order')
      .eq('parent_id', cat.parent_id)
      .eq('level', 3)
      .order('display_order', { ascending: false })
      .limit(1)

    const maxOrder = siblings[0]?.display_order || 0
    const isLast = cat.display_order === maxOrder ? '✅ 마지막' : `❌ ${cat.display_order}/${maxOrder}`

    const { data: parent } = await supabase
      .from('categories')
      .select('name')
      .eq('id', cat.parent_id)
      .single()

    console.log(`[${cat.display_order}/${maxOrder}] ${parent.name} > ${cat.name} ${isLast}`)
  }
}

apply3rdReorder()
