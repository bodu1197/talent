import ServiceCard from '@/components/services/ServiceCard'
import { createClient } from '@/lib/supabase/server'

export default async function RecommendedServices() {
  const supabase = await createClient()

  // AI 카테고리 제외하고 추천 서비스 조회 (한 번의 쿼리로 최적화)
  const { data: recommendedData } = await supabase
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
