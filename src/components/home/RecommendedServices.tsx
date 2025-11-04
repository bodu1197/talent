import ServiceCard from '@/components/services/ServiceCard'
import { createClient } from '@/lib/supabase/server'

export default async function RecommendedServices() {
  const supabase = await createClient()

  // 1. AI 카테고리 찾기
  const { data: aiCategories } = await supabase
    .from('categories')
    .select('id')
    .eq('is_ai', true)

  let aiServiceIds: string[] = []

  if (aiCategories && aiCategories.length > 0) {
    const aiCategoryIds = aiCategories.map(cat => cat.id)

    // 2. AI 카테고리의 서비스 ID 조회
    const { data: serviceCategoryLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .in('category_id', aiCategoryIds)

    if (serviceCategoryLinks && serviceCategoryLinks.length > 0) {
      aiServiceIds = serviceCategoryLinks.map(sc => sc.service_id)
    }
  }

  // 3. 추천 서비스 조회 (AI 카테고리 제외)
  let recommendedQuery = supabase
    .from('services')
    .select(`
      *,
      seller:sellers(
        id,
        business_name,
        display_name,
        is_verified
      )
    `)
    .eq('status', 'active')

  // AI 서비스 제외
  if (aiServiceIds.length > 0) {
    recommendedQuery = recommendedQuery.not('id', 'in', `(${aiServiceIds.join(',')})`)
  }

  const { data: recommendedData } = await recommendedQuery
    .order('created_at', { ascending: false })
    .limit(15)

  const recommendedServices = recommendedData?.map(service => ({
    ...service,
    order_count: service.orders_count || 0
  })) || []

  return (
    <section className="py-8 bg-gray-50">
      <div className="container-1200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-mobile-lg lg:text-xl font-bold mb-2">추천 서비스</h2>
            <p className="text-mobile-md text-gray-600">믿을 수 있는 검증된 전문가들의 서비스</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendedServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
