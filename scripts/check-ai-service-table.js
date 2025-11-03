/**
 * ai_service 테이블 점검 스크립트
 *
 * 실행: node scripts/check-ai-service-table.js
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

async function checkAIServiceTable() {
  console.log('\n=== ai_services 테이블 점검 ===\n')

  try {
    // 1. ai_services 테이블 데이터 조회
    console.log('1️⃣  ai_services 테이블 데이터 조회')
    const { data: aiServices, error: aiError } = await supabase
      .from('ai_services')
      .select('*')

    if (aiError) {
      console.error('❌ ai_services 테이블 조회 오류:', aiError)
      return
    }

    console.log(`✅ ai_services 테이블 레코드 수: ${aiServices?.length || 0}`)

    if (aiServices && aiServices.length > 0) {
      console.log('\n테이블 구조 (첫 번째 레코드 기준):')
      const firstRecord = aiServices[0]
      Object.keys(firstRecord).forEach(key => {
        console.log(`   - ${key}: ${typeof firstRecord[key]} (예시: ${JSON.stringify(firstRecord[key]).substring(0, 50)})`)
      })

      console.log('\n전체 데이터:')
      aiServices.forEach((record, index) => {
        console.log(`\n   레코드 ${index + 1}:`)
        Object.entries(record).forEach(([key, value]) => {
          console.log(`      ${key}: ${JSON.stringify(value)}`)
        })
      })
    } else {
      console.log('   ⚠️  ai_services 테이블이 비어있습니다.')
    }

    // 2. services 테이블과 비교
    console.log('\n2️⃣  services 테이블의 AI 관련 서비스 확인')
    const { data: services, error: svcError } = await supabase
      .from('services')
      .select('id, title, status, seller_id')

    if (svcError) {
      console.error('❌ services 테이블 조회 오류:', svcError)
    } else {
      console.log(`✅ services 테이블 전체 레코드 수: ${services?.length || 0}`)

      if (aiServices && aiServices.length > 0) {
        // ai_service에 있는 service_id가 services에 존재하는지 확인
        const aiServiceIds = new Set(aiServices.map(ai => ai.service_id).filter(Boolean))
        if (aiServiceIds.size > 0) {
          console.log(`\n   ai_service에 연결된 서비스 ID: ${Array.from(aiServiceIds).join(', ')}`)

          const matchedServices = services?.filter(s => aiServiceIds.has(s.id)) || []
          console.log(`   ✅ 매칭되는 서비스: ${matchedServices.length}개`)

          matchedServices.forEach(s => {
            console.log(`      - ${s.title} (status: ${s.status})`)
          })
        }
      }
    }

    // 3. service_categories와 AI 카테고리 비교
    console.log('\n3️⃣  service_categories를 통한 AI 서비스 확인')
    const { data: aiCategory } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'ai-services')
      .single()

    if (aiCategory) {
      console.log(`✅ AI 카테고리 발견: ${aiCategory.name}`)

      const { data: serviceLinks } = await supabase
        .from('service_categories')
        .select('service_id, category_id')
        .eq('category_id', aiCategory.id)

      console.log(`   service_categories를 통한 AI 서비스: ${serviceLinks?.length || 0}개`)

      if (serviceLinks && serviceLinks.length > 0) {
        console.log(`   서비스 IDs: ${serviceLinks.map(l => l.service_id).join(', ')}`)
      }
    } else {
      console.log('   ⚠️  ai-services 카테고리를 찾을 수 없습니다.')
    }

    // 4. 결론
    console.log('\n4️⃣  분석 결과')
    console.log('─'.repeat(60))

    if (aiServices && aiServices.length > 0) {
      console.log('✅ ai_services 테이블이 존재하고 데이터가 있습니다.')
      console.log('\n💡 추정되는 용도:')

      if (aiServices[0].service_id) {
        console.log('   - AI 관련 서비스를 별도로 관리하는 테이블로 보입니다.')
        console.log('   - services 테이블과 1:1 또는 1:N 관계일 수 있습니다.')
      }

      console.log('\n⚠️  현재 코드 상황:')
      console.log('   - 현재 메인 페이지 코드는 ai_services 테이블을 사용하지 않습니다.')
      console.log('   - 대신 categories.is_ai = true 조건으로 조회합니다.')
      console.log('   - service_categories 테이블을 통해 AI 서비스를 찾습니다.')

      console.log('\n📋 권장사항:')
      console.log('   1. ai_services 테이블을 사용하도록 코드 수정')
      console.log('   2. 또는 ai_services 테이블을 사용하지 않고 is_ai 컬럼 추가')
    } else {
      console.log('   ai_services 테이블이 비어있습니다.')
      console.log('   → 테이블은 존재하지만 사용되지 않는 것으로 보입니다.')
    }

    console.log('\n=== 점검 완료 ===\n')

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

checkAIServiceTable().catch(console.error)
