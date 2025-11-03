/**
 * categories 테이블에 is_ai 컬럼 추가 및 AI 카테고리 설정
 *
 * 실행: node scripts/add-is-ai-column.js
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

async function addIsAiColumn() {
  console.log('\n=== is_ai 컬럼 추가 및 AI 카테고리 설정 ===\n')

  try {
    // 1. is_ai 컬럼 추가 (SQL 실행)
    console.log('1️⃣  is_ai 컬럼 추가 중...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS is_ai BOOLEAN DEFAULT FALSE;
      `
    })

    if (alterError) {
      // RPC가 없을 수 있으므로 직접 SQL을 실행할 수 있는 방법을 사용
      console.log('   ⚠️  RPC를 사용할 수 없습니다. 수동으로 SQL을 실행해야 합니다.')
      console.log('\n   다음 SQL을 Supabase SQL Editor에서 실행하세요:')
      console.log('   ----------------------------------------')
      console.log('   ALTER TABLE categories')
      console.log('   ADD COLUMN IF NOT EXISTS is_ai BOOLEAN DEFAULT FALSE;')
      console.log('   ----------------------------------------\n')
    } else {
      console.log('   ✅ is_ai 컬럼 추가 완료')
    }

    // 2. AI 서비스 카테고리 찾기
    console.log('\n2️⃣  AI 서비스 카테고리 찾기 (slug = "ai-services")')
    const { data: aiCategory } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'ai-services')
      .single()

    if (!aiCategory) {
      console.log('   ⚠️  ai-services 카테고리를 찾을 수 없습니다.')
      console.log('   → categories-full.ts의 AI 서비스 카테고리가 DB에 없습니다.')
      return
    }

    console.log(`   ✅ AI 카테고리 발견: ${aiCategory.name} (${aiCategory.id})`)

    // 3. AI 카테고리의 모든 하위 카테고리 ID 가져오기
    console.log('\n3️⃣  AI 카테고리의 하위 카테고리 찾기...')
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name, parent_id, level')
      .or(`id.eq.${aiCategory.id},parent_id.eq.${aiCategory.id}`)

    if (!allCategories) {
      console.log('   ⚠️  하위 카테고리를 찾을 수 없습니다.')
      return
    }

    // 2차 카테고리 ID 가져오기
    const level2Ids = allCategories
      .filter(c => c.parent_id === aiCategory.id)
      .map(c => c.id)

    // 3차 카테고리 가져오기
    let level3Categories = []
    if (level2Ids.length > 0) {
      const { data: level3 } = await supabase
        .from('categories')
        .select('id, name, parent_id')
        .in('parent_id', level2Ids)

      level3Categories = level3 || []
    }

    const allAICategoryIds = [
      aiCategory.id,
      ...level2Ids,
      ...level3Categories.map(c => c.id)
    ]

    console.log(`   ✅ 전체 AI 관련 카테고리: ${allAICategoryIds.length}개`)
    console.log(`   - 1차 카테고리: 1개 (ai-services)`)
    console.log(`   - 2차 카테고리: ${level2Ids.length}개`)
    console.log(`   - 3차 카테고리: ${level3Categories.length}개`)

    // 4. is_ai = true 설정
    console.log('\n4️⃣  is_ai = true 설정 중...')
    const { error: updateError } = await supabase
      .from('categories')
      .update({ is_ai: true })
      .in('id', allAICategoryIds)

    if (updateError) {
      console.error('   ❌ 업데이트 오류:', updateError)
    } else {
      console.log(`   ✅ ${allAICategoryIds.length}개 카테고리 is_ai = true 설정 완료`)
    }

    // 5. 확인
    console.log('\n5️⃣  설정 확인...')
    const { data: aiCategoriesCheck } = await supabase
      .from('categories')
      .select('id, name, slug, is_ai')
      .eq('is_ai', true)

    console.log(`   ✅ is_ai = true인 카테고리: ${aiCategoriesCheck?.length || 0}개`)
    aiCategoriesCheck?.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`)
    })

    console.log('\n=== 완료 ===\n')

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

addIsAiColumn().catch(console.error)
