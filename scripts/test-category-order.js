/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testCategoryOrder() {
  // 1. Get active ads
  const { data: ads } = await supabase
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active')

  const advertisedServiceIds = ads?.map(a => a.service_id) || []
  console.log('활성 광고 서비스 IDs:', advertisedServiceIds.length, '개')

  // 2. Get IT category
  const { data: category } = await supabase
    .from('categories')
    .select('id, level')
    .eq('slug', 'it-programming')
    .single()

  if (!category) {
    console.log('카테고리를 찾을 수 없습니다')
    return
  }

  // 3. Get all descendant categories
  const { data: level2 } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', category.id)

  const level2Ids = level2?.map(c => c.id) || []

  const { data: level3 } = await supabase
    .from('categories')
    .select('id')
    .in('parent_id', level2Ids.length > 0 ? level2Ids : ['none'])

  const level3Ids = level3?.map(c => c.id) || []
  const allCategoryIds = [category.id, ...level2Ids, ...level3Ids]

  // 4. Get service IDs
  const { data: serviceLinks } = await supabase
    .from('service_categories')
    .select('service_id')
    .in('category_id', allCategoryIds)

  const serviceIds = serviceLinks?.map(sl => sl.service_id) || []
  console.log('카테고리 내 서비스:', serviceIds.length, '개')

  // 5. Get all services
  const { data: allServices } = await supabase
    .from('services')
    .select('id, title, orders_count')
    .in('id', serviceIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  console.log('활성 서비스:', allServices?.length, '개')

  // 6. Simulate the logic
  const advertisedServices = allServices?.filter(s => advertisedServiceIds.includes(s.id)) || []
  const regularServices = allServices?.filter(s => !advertisedServiceIds.includes(s.id)) || []

  console.log('\n=== 광고 서비스 ===')
  advertisedServices.forEach((s, i) => {
    console.log(`${i + 1}. ${s.title} (주문: ${s.orders_count})`)
  })

  console.log('\n=== 일반 서비스 (상위 5개) ===')
  regularServices.slice(0, 5).forEach((s, i) => {
    console.log(`${i + 1}. ${s.title} (주문: ${s.orders_count})`)
  })

  // 7. Combined (as server does)
  const combined = [...advertisedServices, ...regularServices]
  console.log('\n=== 결합 후 순서 (상위 10개) ===')
  combined.slice(0, 10).forEach((s, i) => {
    const isAd = advertisedServiceIds.includes(s.id) ? '[광고]' : ''
    console.log(`${i + 1}. ${s.title} ${isAd}`)
  })
}

testCategoryOrder()
