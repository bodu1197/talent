import { Suspense } from 'react'
import HeroWithCategories from '@/components/common/HeroWithCategories'
import AITalentShowcase from '@/components/home/AITalentShowcase'
import RecentVisitedCategories from '@/components/home/RecentVisitedCategories'
import RecentViewedServices from '@/components/home/RecentViewedServices'
import RecommendedServices from '@/components/home/RecommendedServices'

export default async function HomePage() {
  return (
    <div className="pb-0">
      {/* 히어로 섹션 + 카테고리 (즉시 표시) */}
      <HeroWithCategories />

      {/* 로그인 사용자 전용 섹션 (클라이언트 사이드) */}
      <RecentVisitedCategories />
      <RecentViewedServices />

      {/* AI 재능 쇼케이스 (Suspense로 감싸기) */}
      <Suspense fallback={<AIShowcaseSkeleton />}>
        <AIServicesSection />
      </Suspense>

      {/* 추천 서비스 섹션 (Suspense로 감싸기) */}
      <Suspense fallback={<RecommendedSkeleton />}>
        <RecommendedServices />
      </Suspense>

      {/* 서비스 프로세스 섹션 - PC만 표시 (정적 컨텐츠 - 즉시 표시) */}
      <section className="hidden md:block py-8 bg-gray-100">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold mb-4">간단한 거래 프로세스</h2>
            <p className="text-gray-600">
              단 4단계로 완성되는 안전한 거래
            </p>
          </div>

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

      {/* 실시간 리뷰 섹션 - PC만 표시 (정적 컨텐츠 - 즉시 표시) */}
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
  )
}

// AI 서비스 섹션 (서버 컴포넌트)
async function AIServicesSection() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  // AI 카테고리의 서비스 조회를 한 번의 쿼리로 최적화
  const { data: aiServices } = await supabase
    .from('services')
    .select(`
      *,
      seller:sellers(
        id,
        business_name,
        display_name,
        is_verified
      ),
      service_categories!inner(
        category:categories!inner(
          is_ai_category
        )
      )
    `)
    .eq('status', 'active')
    .eq('service_categories.category.is_ai_category', true)
    .order('created_at', { ascending: false })

  const services = aiServices?.map(service => ({
    ...service,
    order_count: service.orders_count || 0
  })) || []

  return <AITalentShowcase services={services} />
}

// 스켈레톤 로딩 컴포넌트
function AIShowcaseSkeleton() {
  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RecommendedSkeleton() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container-1200">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    </section>
  )
}
