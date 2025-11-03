import ServiceCard from '@/components/services/ServiceCard'
import HeroWithCategories from '@/components/common/HeroWithCategories'
import AITalentShowcase from '@/components/home/AITalentShowcase'
import RecentVisitedCategories from '@/components/home/RecentVisitedCategories'
import RecentViewedServices from '@/components/home/RecentViewedServices'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. AI 카테고리 찾기 (is_ai = true인 모든 카테고리)
  const { data: aiCategories, error: aiCategoryError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_ai', true)

  logger.dev('AI 카테고리 조회', {
    count: aiCategories?.length || 0,
    categories: aiCategories,
    error: aiCategoryError
  })

  let aiServices = []
  let aiServiceIds: string[] = []

  if (aiCategories && aiCategories.length > 0) {
    const aiCategoryIds = aiCategories.map(cat => cat.id)

    // 2. AI 카테고리들에 속한 서비스 ID 목록 조회
    const { data: serviceCategoryLinks, error: linkError } = await supabase
      .from('service_categories')
      .select('service_id, category_id')
      .in('category_id', aiCategoryIds)

    logger.dev('AI 서비스 카테고리 링크 조회', {
      categoryIds: aiCategoryIds,
      linkCount: serviceCategoryLinks?.length || 0,
      links: serviceCategoryLinks,
      error: linkError
    })

    if (serviceCategoryLinks && serviceCategoryLinks.length > 0) {
      aiServiceIds = serviceCategoryLinks.map(sc => sc.service_id)

      // 3. AI 카테고리 서비스 조회 (AI 재능 쇼케이스용 - 모든 AI 서비스 표시)
      const { data, error: servicesError } = await supabase
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
        .in('id', aiServiceIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      logger.dev('AI 서비스 조회 결과', {
        serviceIds: aiServiceIds,
        serviceCount: data?.length || 0,
        services: data?.map(s => ({ id: s.id, title: s.title, status: s.status })),
        error: servicesError
      })

      if (data) {
        // orders_count를 order_count로 매핑
        aiServices = data.map(service => ({
          ...service,
          order_count: service.orders_count || 0
        }))
      }
    }
  }

  // 4. 추천 서비스 조회 (AI 카테고리 제외)
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
    <div className="pb-0">
      {/* 히어로 섹션 + 카테고리 (공통) */}
      <HeroWithCategories />

      {/* 로그인 사용자 전용 섹션 */}
      <RecentVisitedCategories />
      <RecentViewedServices />
      <AITalentShowcase services={aiServices} />

      {/* 추천 서비스 섹션 - AI 카테고리 제외 */}
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

      {/* 서비스 프로세스 섹션 - PC만 표시 */}
      <section className="hidden md:block py-8 bg-gray-100">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold mb-4">간단한 거래 프로세스</h2>
            <p className="text-gray-600">
              단 4단계로 완성되는 안전한 거래
            </p>
          </div>

          {/* PC: 그리드 레이아웃 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2">서비스 검색</h3>
              <p className="text-sm text-gray-600">원하는 서비스를 검색하고 전문가를 찾아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2">상담 및 견적</h3>
              <p className="text-sm text-gray-600">전문가와 상담하고 견적을 받아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2">안전 결제</h3>
              <p className="text-sm text-gray-600">안전한 에스크로 시스템으로 결제하세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="font-bold mb-2">작업 완료</h3>
              <p className="text-sm text-gray-600">만족스러운 결과물을 받고 리뷰를 남겨주세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* 실시간 리뷰 섹션 - PC만 표시 */}
      <section className="hidden md:block py-8 bg-gray-50">
        <div className="container-1200">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-4">실시간 구매 후기</h2>
            <p className="text-gray-600">
              실제 구매자들의 생생한 후기
            </p>
          </div>

          <div className="text-center py-8 text-gray-500">
            아직 등록된 후기가 없습니다
          </div>
        </div>
      </section>
    </div>
  );
}
