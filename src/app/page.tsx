import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import HeroWithCategories from '@/components/common/HeroWithCategories'
import AITalentShowcase from '@/components/home/AITalentShowcase'
import RecentVisitedCategories from '@/components/home/RecentVisitedCategories'
import RecentViewedServices from '@/components/home/RecentViewedServices'
import RecommendedServices from '@/components/home/RecommendedServices'
import PersonalizedServices from '@/components/home/PersonalizedServices'

// 랜덤 정렬을 위해 매번 새로 렌더링
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function HomePage() {
  const supabase = await createClient()

  // 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 비로그인 사용자는 랜딩 페이지로
  if (!user) {
    redirect('/landing')
  }

  // 로그인 사용자는 메인 페이지 표시
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

      {/* 회원 맞춤 관심 카테고리 서비스 (Suspense로 감싸기) */}
      <Suspense fallback={<PersonalizedSkeleton />}>
        <PersonalizedServices />
      </Suspense>
    </div>
  )
}

// AI 서비스 섹션 (서버 컴포넌트)
async function AIServicesSection() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  // 1. AI 카테고리 찾기
  const { data: aiCategories } = await supabase
    .from('categories')
    .select('id')
    .eq('is_ai', true)

  let services = []

  if (aiCategories && aiCategories.length > 0) {
    const aiCategoryIds = aiCategories.map(cat => cat.id)

    // 2. AI 카테고리의 서비스 ID 조회
    const { data: serviceCategoryLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .in('category_id', aiCategoryIds)

    if (serviceCategoryLinks && serviceCategoryLinks.length > 0) {
      const aiServiceIds = serviceCategoryLinks.map(sc => sc.service_id)

      // 3. AI 서비스 조회
      const { data: aiServices } = await supabase
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

      if (aiServices) {
        // 평균 별점 계산
        const serviceIds = aiServices.map(s => s.id)
        const { data: reviewStats } = await supabase
          .from('reviews')
          .select('service_id, rating')
          .in('service_id', serviceIds)
          .eq('is_visible', true)

        // 서비스별 평균 별점 계산
        const ratingMap = new Map<string, { sum: number, count: number }>()
        reviewStats?.forEach((review: any) => {
          const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 }
          ratingMap.set(review.service_id, {
            sum: current.sum + review.rating,
            count: current.count + 1
          })
        })

        // Fisher-Yates 셔플로 공평한 랜덤
        const shuffled = [...aiServices]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        services = shuffled.map(service => {
          const stats = ratingMap.get(service.id)
          return {
            ...service,
            order_count: service.orders_count || 0,
            rating: stats && stats.count > 0 ? stats.sum / stats.count : 0,
            review_count: stats?.count || 0
          }
        })
      }
    }
  }

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

function PersonalizedSkeleton() {
  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>
        <div className="space-y-10">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
