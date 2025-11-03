/**
 * 카테고리 분석 스크립트
 * 오프라인/온라인 구분을 위한 전체 카테고리 조회
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeCategories() {
  console.log('\n=== 전체 카테고리 분석 ===\n')

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, level, parent_id, is_ai')
    .order('level', { ascending: true })
    .order('display_order', { ascending: true })

  if (error) {
    console.error('❌ 카테고리 조회 오류:', error)
    return
  }

  // 1차 카테고리만 추출
  const level1 = data.filter(c => c.level === 1)

  console.log('📋 1차 카테고리 목록:\n')
  level1.forEach((cat, index) => {
    const aiMark = cat.is_ai ? '🤖 [AI]' : ''
    console.log(`${index + 1}. ${cat.name} ${aiMark}`)
    console.log(`   slug: ${cat.slug}`)
    console.log(`   id: ${cat.id}`)

    // 2차 카테고리 찾기
    const level2 = data.filter(c => c.parent_id === cat.id)
    if (level2.length > 0) {
      console.log(`   하위 카테고리: ${level2.length}개`)
      level2.forEach(sub => {
        console.log(`     - ${sub.name}`)
      })
    }
    console.log('')
  })

  console.log(`\n총 ${level1.length}개의 1차 카테고리`)
  console.log(`총 ${data.length}개의 전체 카테고리 (모든 레벨 포함)\n`)
}

analyzeCategories().catch(console.error)
