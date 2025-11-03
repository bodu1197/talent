/**
 * AI 서비스 데이터 점검 스크립트
 *
 * 실행: node scripts/check-ai-services.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '설정됨' : '없음')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAIServices() {
  console.log('\n=== AI 서비스 데이터 점검 ===\n')

  // 1. AI 카테고리 확인
  console.log('1️⃣  AI 카테고리 확인 (is_ai = true)')
  const { data: aiCategories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, is_ai, level')
    .eq('is_ai', true)

  if (catError) {
    console.error('❌ 카테고리 조회 오류:', catError)
  } else {
    console.log(`✅ AI 카테고리 개수: ${aiCategories?.length || 0}`)
    if (aiCategories && aiCategories.length > 0) {
      aiCategories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug}, level: ${cat.level})`)
      })
    } else {
      console.log('   ⚠️  AI 카테고리가 없습니다!')
      return
    }
  }

  const aiCategoryIds = aiCategories.map(c => c.id)

  // 2. service_categories 테이블 확인
  console.log('\n2️⃣  AI 카테고리와 연결된 서비스 확인')
  const { data: serviceLinks, error: linkError } = await supabase
    .from('service_categories')
    .select('service_id, category_id, categories(name)')
    .in('category_id', aiCategoryIds)

  if (linkError) {
    console.error('❌ 서비스-카테고리 링크 조회 오류:', linkError)
  } else {
    console.log(`✅ 연결된 서비스 개수: ${serviceLinks?.length || 0}`)
    if (serviceLinks && serviceLinks.length > 0) {
      serviceLinks.forEach(link => {
        console.log(`   - 서비스 ID: ${link.service_id} → 카테고리: ${link.categories?.name}`)
      })
    } else {
      console.log('   ⚠️  AI 카테고리에 연결된 서비스가 없습니다!')
      return
    }
  }

  const serviceIds = [...new Set(serviceLinks.map(l => l.service_id))]

  // 3. 실제 서비스 확인
  console.log('\n3️⃣  실제 서비스 데이터 확인')
  const { data: services, error: svcError } = await supabase
    .from('services')
    .select('id, title, status, seller_id')
    .in('id', serviceIds)

  if (svcError) {
    console.error('❌ 서비스 조회 오류:', svcError)
  } else {
    console.log(`✅ 전체 서비스 개수: ${services?.length || 0}`)

    if (services && services.length > 0) {
      const activeServices = services.filter(s => s.status === 'active')
      const pendingServices = services.filter(s => s.status === 'pending')
      const inactiveServices = services.filter(s => s.status === 'inactive')

      console.log(`   - active: ${activeServices.length}개`)
      console.log(`   - pending: ${pendingServices.length}개`)
      console.log(`   - inactive: ${inactiveServices.length}개`)

      console.log('\n   서비스 목록:')
      services.forEach(s => {
        console.log(`   ${s.status === 'active' ? '✅' : s.status === 'pending' ? '⏳' : '❌'} ${s.title} (${s.status})`)
      })

      if (activeServices.length === 0) {
        console.log('\n   ⚠️  active 상태인 서비스가 없습니다!')
        console.log('   → 서비스를 승인해야 메인 페이지에 표시됩니다.')
      }
    }
  }

  // 4. 판매자 정보 확인
  console.log('\n4️⃣  판매자 정보 확인')
  if (services && services.length > 0) {
    const sellerIds = [...new Set(services.map(s => s.seller_id))]
    const { data: sellers, error: sellerError } = await supabase
      .from('sellers')
      .select('id, display_name, business_name')
      .in('id', sellerIds)

    if (sellerError) {
      console.error('❌ 판매자 조회 오류:', sellerError)
    } else {
      console.log(`✅ 판매자 개수: ${sellers?.length || 0}`)
      sellers?.forEach(seller => {
        console.log(`   - ${seller.display_name || seller.business_name}`)
      })
    }
  }

  console.log('\n=== 점검 완료 ===\n')
}

checkAIServices().catch(console.error)
