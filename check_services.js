const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkServices() {
  console.log('=== 서비스 데이터 확인 ===\n')

  // 1. 전체 서비스 조회
  const { data: allServices, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('1. 등록된 서비스 목록:')
  if (servicesError) {
    console.error('오류:', servicesError)
  } else {
    console.log(`총 ${allServices.length}개 서비스`)
    allServices.forEach(s => {
      console.log(`  - ${s.title} (ID: ${s.id}, seller_id: ${s.seller_id}, status: ${s.status})`)
    })
  }

  console.log('\n2. Sellers 테이블 조회:')
  const { data: sellers, error: sellersError } = await supabase
    .from('sellers')
    .select('id, user_id, business_name')

  if (sellersError) {
    console.error('오류:', sellersError)
  } else {
    console.log(`총 ${sellers.length}개 seller`)
    sellers.forEach(s => {
      console.log(`  - ${s.business_name || 'N/A'} (seller_id: ${s.id}, user_id: ${s.user_id})`)
    })
  }

  console.log('\n3. 서비스와 Seller 매칭 확인:')
  if (allServices && sellers) {
    allServices.forEach(service => {
      const seller = sellers.find(s => s.id === service.seller_id)
      if (seller) {
        console.log(`  ✓ ${service.title} → seller ${seller.id} (${seller.business_name || 'N/A'})`)
      } else {
        console.log(`  ✗ ${service.title} → seller_id ${service.seller_id} (sellers 테이블에 없음!)`)
      }
    })
  }

  console.log('\n4. 현재 로그인 사용자 확인:')
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (user) {
    console.log(`  User ID: ${user.id}`)
    console.log(`  Email: ${user.email}`)

    const mySeller = sellers?.find(s => s.user_id === user.id)
    if (mySeller) {
      console.log(`  Seller ID: ${mySeller.id}`)

      const myServices = allServices?.filter(s => s.seller_id === mySeller.id)
      console.log(`  내 서비스: ${myServices?.length || 0}개`)
      myServices?.forEach(s => {
        console.log(`    - ${s.title} (${s.status})`)
      })
    } else {
      console.log(`  이 사용자의 seller 정보가 없습니다!`)
    }
  } else {
    console.log('  로그인되지 않음')
  }
}

checkServices().catch(console.error)
