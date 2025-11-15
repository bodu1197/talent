import { createClient as createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Service } from '@/types'

export interface PersonalizedCategory {
  category_id: string
  category_name: string
  category_slug: string
  visit_count: number
  services: Service[]
}

/**
 * 회원의 관심 카테고리 기반 개인화 서비스 추천
 * 최근 방문한 모든 카테고리의 서비스를 불러옴 (방문 횟수 순)
 */
export async function getPersonalizedServicesByInterest(): Promise<PersonalizedCategory[]> {
  const supabase = await createServerClient()

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    // 1. 최근 방문한 카테고리 조회 (방문 횟수 우선, 최근 방문 순)
    const { data: topCategories, error: categoryError } = await supabase
      .rpc('get_recent_category_visits', {
        p_user_id: user.id,
        p_limit: 3  // 상위 3개만
      })

    if (categoryError || !topCategories || topCategories.length === 0) {
      return []
    }

    // 2. 각 카테고리별로 서비스 조회 (병렬 처리)
    const categoriesWithServices = await Promise.all(
      topCategories.map(async (category: {
        category_id: string
        category_name: string
        category_slug: string
        visit_count: number
      }) => {
        // 카테고리 UUID 조회
        const { data: categoryInfo } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category.category_slug)
          .single()

        if (!categoryInfo) {
          return {
            category_id: category.category_id,
            category_name: category.category_name,
            category_slug: category.category_slug,
            visit_count: category.visit_count,
            services: []
          }
        }

        // 광고 서비스 ID 조회
        const { data: advertisingData } = await supabase
          .from('advertising_subscriptions')
          .select('service_id')
          .eq('status', 'active')

        const advertisedServiceIds = advertisingData?.map(ad => ad.service_id) || []

        // 서비스 조회 (JOIN으로 한 번에, 최적화: 50개만)
        const { data: services } = await supabase
          .from('services')
          .select(`
            id,
            title,
            description,
            price,
            thumbnail_url,
            orders_count,
            seller:sellers(
              id,
              business_name,
              is_verified
            ),
            service_categories!inner(category_id)
          `)
          .eq('service_categories.category_id', categoryInfo.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50) // 최적화: 1000 -> 50

        // 광고 서비스와 일반 서비스 분리
        const advertisedServices = services?.filter(s => advertisedServiceIds.includes(s.id)) || []
        const regularServices = services?.filter(s => !advertisedServiceIds.includes(s.id)) || []

        // 일반 서비스 랜덤 셔플
        for (let i = regularServices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [regularServices[i], regularServices[j]] = [regularServices[j], regularServices[i]]
        }

        // 광고 서비스 + 랜덤 일반 서비스 (상위 5개)
        const topServices = [...advertisedServices, ...regularServices].slice(0, 5)

        if (topServices.length > 0) {
          const serviceIdsForRating = topServices.map(s => s.id)
          const { data: reviewStats } = await supabase
            .from('reviews')
            .select('service_id, rating')
            .in('service_id', serviceIdsForRating)
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

          // 각 서비스에 별점 추가
          topServices.forEach((service: any) => {
            const stats = ratingMap.get(service.id)
            service.rating = stats && stats.count > 0 ? stats.sum / stats.count : 0
            service.review_count = stats?.count || 0
            service.order_count = service.orders_count || 0
          })
        }

        return {
          category_id: category.category_id,
          category_name: category.category_name,
          category_slug: category.category_slug,
          visit_count: category.visit_count,
          services: topServices
        }
      })
    )

    return categoriesWithServices

  } catch (error) {
    logger.error('Failed to fetch personalized services:', error)
    return []
  }
}
