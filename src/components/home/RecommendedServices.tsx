import ServiceCard from '@/components/services/ServiceCard'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { Service } from '@/types'

interface RecommendedServicesProps {
  aiCategoryIds: string[]
}

export default async function RecommendedServices({ aiCategoryIds }: RecommendedServicesProps) {
  const supabase = await createClient()

  let aiServiceIds: string[] = []

  // AI 서비스 ID 조회 (AI 카테고리가 있을 경우만)
  if (aiCategoryIds.length > 0) {
    const { data: serviceCategoryLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .in('category_id', aiCategoryIds)

    if (serviceCategoryLinks && serviceCategoryLinks.length > 0) {
      aiServiceIds = serviceCategoryLinks.map(sc => sc.service_id)
    }
  }

  // 광고 서비스 ID 조회 (status = 'active') - Service Role 클라이언트 사용하여 RLS 우회
  const serviceRoleClient = createServiceRoleClient()
  const { data: advertisingData } = await serviceRoleClient
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active')

  const advertisedServiceIds = advertisingData?.map(ad => ad.service_id) || []

  // 추천 서비스 조회 (AI 카테고리 제외) - 최적화: 50개만
  let recommendedQuery = supabase
    .from('services')
    .select(`
      id,
      title,
      description,
      price,
      thumbnail_url,
      orders_count,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        is_verified
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50) // 최적화: 1000 -> 50

  // AI 서비스 제외
  if (aiServiceIds.length > 0) {
    recommendedQuery = recommendedQuery.not('id', 'in', `(${aiServiceIds.join(',')})`)
  }

  const { data: recommendedData } = await recommendedQuery

  // 광고 서비스와 일반 서비스 분리
  const advertisedServices = recommendedData?.filter(s => advertisedServiceIds.includes(s.id)) || []
  const regularServices = recommendedData?.filter(s => !advertisedServiceIds.includes(s.id)) || []

  // 광고 서비스 랜덤 셔플
  for (let i = advertisedServices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [advertisedServices[i], advertisedServices[j]] = [advertisedServices[j], advertisedServices[i]]
  }

  // 일반 서비스 랜덤 셔플
  for (let i = regularServices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [regularServices[i], regularServices[j]] = [regularServices[j], regularServices[i]]
  }

  // 광고 서비스(랜덤) + 일반 서비스(랜덤) (총 15개)
  const shuffled = [...advertisedServices, ...regularServices].slice(0, 15)

  // 리뷰 통계 조회 (15개만)
  const serviceIds = shuffled.map(s => s.id)
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('service_id, rating')
    .in('service_id', serviceIds)
    .eq('is_visible', true)

  // 서비스별 평균 별점 계산
  const ratingMap = new Map<string, { sum: number, count: number }>()
  reviewStats?.forEach((review: { service_id: string; rating: number }) => {
    const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 }
    ratingMap.set(review.service_id, {
      sum: current.sum + review.rating,
      count: current.count + 1
    })
  })

  const recommendedServices: Service[] = shuffled.map((service) => {
    const stats = ratingMap.get(service.id)
    return {
      ...service,
      order_count: service.orders_count || 0,
      rating: stats && stats.count > 0 ? stats.sum / stats.count : 0,
      review_count: stats?.count || 0
    } as unknown as Service
  })

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
