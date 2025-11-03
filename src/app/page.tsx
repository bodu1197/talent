import ServiceGrid from '@/components/services/ServiceGrid'
import HeroSection from '@/components/home/HeroSection'
import AITalentShowcase from '@/components/home/AITalentShowcase'
import CategoryGrid from '@/components/home/CategoryGrid'
import RecentVisitedCategories from '@/components/home/RecentVisitedCategories'
import RecentViewedServices from '@/components/home/RecentViewedServices'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  // AI 카테고리 서비스 조회
  const supabase = await createClient()

  // 1. AI 카테고리 찾기 (slug로)
  const { data: aiCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'ai-services')
    .maybeSingle()

  let aiServices = []

  if (aiCategory) {
    // 2. AI 카테고리에 속한 active 서비스 조회
    const { data: serviceCategoryLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .eq('category_id', aiCategory.id)

    if (serviceCategoryLinks && serviceCategoryLinks.length > 0) {
      const serviceIds = serviceCategoryLinks.map(sc => sc.service_id)

      const { data } = await supabase
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
        .in('id', serviceIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(15)

      if (data) {
        // orders_count를 order_count로 매핑
        aiServices = data.map(service => ({
          ...service,
          order_count: service.orders_count || 0
        }))
      }
    }
  }

  return (
    <div className="pb-0">
      <HeroSection />
      <CategoryGrid />
      <RecentVisitedCategories />
      <RecentViewedServices />
      <AITalentShowcase services={aiServices} />

      {/* 기존의 '추천 서비스', '서비스 프로세스', '실시간 구매 후기', 'CTA 섹션' 등은
          새로운 컴포넌트들로 대체되거나 재구성될 예정입니다. */}

      {/* 기존 '추천 서비스' 섹션 (ServiceGrid는 재사용 가능성 있음) */}
      <section className="py-8 bg-gray-50">
        <div className="container-1200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-mobile-lg lg:text-xl font-bold mb-2">추천 서비스</h2>
              <p className="text-mobile-md text-gray-600">믿을 수 있는 검증된 전문가들의 서비스</p>
            </div>
            <button className="hidden md:block px-4 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-gray-50 transition-colors">
              전체보기
            </button>
          </div>
          <ServiceGrid featured={true} columns={5} />
        </div>
      </section>

      {/* 기존 '서비스 프로세스' 섹션 - PC만 표시 */}
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
              <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2">서비스 검색</h3>
              <p className="text-sm text-gray-600">원하는 서비스를 검색하고 전문가를 찾아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2">상담 및 견적</h3>
              <p className="text-sm text-gray-600">전문가와 상담하고 견적을 받아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2">안전 결제</h3>
              <p className="text-sm text-gray-600">안전한 에스크로 시스템으로 결제하세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="font-bold mb-2">작업 완료</h3>
              <p className="text-sm text-gray-600">만족스러운 결과물을 받고 리뷰를 남겨주세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* 기존 '실시간 리뷰' 섹션 - PC만 표시 */}
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

      {/* 자동 스크롤 배너 섹션 - PC만 표시 */}
      <section className="hidden md:block bg-gray-50 py-8 overflow-hidden">
        <div className="h-[180px] flex items-center">
          <div className="animate-scroll flex gap-6 whitespace-nowrap">
            {/* 배너 아이템 - 2번 반복해서 무한 스크롤 효과 */}
            {[1, 2].map((set) => (
              <div key={set} className="flex gap-6">
                <div className="flex flex-col items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-brand-primary to-brand-light text-white rounded-lg h-[180px] min-w-[300px]">
                  <i className="fas fa-sack-dollar text-4xl"></i>
                  <span className="text-lg font-bold text-center">수수료 0%</span>
                  <span className="text-sm text-center">당신이 번 돈 100% 가져가세요</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg h-[180px] min-w-[300px]">
                  <i className="fas fa-bullhorn text-4xl"></i>
                  <span className="text-lg font-bold text-center">광고비 1,500만원</span>
                  <span className="text-sm text-center">런칭 기념 무료 지원</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg h-[180px] min-w-[300px]">
                  <i className="fas fa-balance-scale text-4xl"></i>
                  <span className="text-lg font-bold text-center">공평한 기회</span>
                  <span className="text-sm text-center">실력으로 승부하세요</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg h-[180px] min-w-[300px]">
                  <i className="fas fa-shield-alt text-4xl"></i>
                  <span className="text-lg font-bold text-center">구매 수수료 0원</span>
                  <span className="text-sm text-center">숨은 비용 없음</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
