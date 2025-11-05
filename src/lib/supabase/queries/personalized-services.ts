import { createClient as createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface PersonalizedCategory {
  category_id: string
  category_name: string
  category_slug: string
  visit_count: number
  services: any[]
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
    // 1. 최근 방문한 모든 카테고리 조회 (방문 횟수 순)
    const { data: topCategories, error: categoryError } = await supabase
      .rpc('get_recent_category_visits', {
        p_user_id: user.id,
        p_days: 30,
        p_limit: 10  // 최대 10개 카테고리까지
      })

    console.log('[PERSONALIZED] User ID:', user.id)
    console.log('[PERSONALIZED] RPC Error:', categoryError)
    console.log('[PERSONALIZED] Top Categories:', topCategories)

    if (categoryError || !topCategories || topCategories.length === 0) {
      logger.warn('No visited categories found for personalized recommendations', {
        error: categoryError,
        hasData: !!topCategories,
        dataLength: topCategories?.length
      })
      return []
    }

    // 2. 각 카테고리별로 서비스 조회
    const categoriesWithServices = await Promise.all(
      topCategories.map(async (category: any) => {
        console.log('[PERSONALIZED] Processing category:', category.category_name, category.category_id)

        // 카테고리 ID로 서비스 조회
        // category_visits.category_id는 TEXT, service_categories.category_id는 UUID
        // Supabase 클라이언트에서 자동으로 타입 변환이 안 되므로
        // 먼저 categories 테이블에서 UUID를 가져와야 함

        const { data: categoryInfo } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category.category_slug)
          .single()

        if (!categoryInfo) {
          console.log('[PERSONALIZED] Category not found:', category.category_slug)
          return {
            category_id: category.category_id,
            category_name: category.category_name,
            category_slug: category.category_slug,
            visit_count: category.visit_count,
            services: []
          }
        }

        const { data: serviceCategoryLinks, error: linkError } = await supabase
          .from('service_categories')
          .select('service_id')
          .eq('category_id', categoryInfo.id)

        console.log('[PERSONALIZED] Service links found:', serviceCategoryLinks?.length || 0, 'Error:', linkError)

        if (!serviceCategoryLinks || serviceCategoryLinks.length === 0) {
          return {
            category_id: category.category_id,
            category_name: category.category_name,
            category_slug: category.category_slug,
            visit_count: category.visit_count,
            services: []
          }
        }

        const serviceIds = serviceCategoryLinks.map(link => link.service_id)

        // 서비스 상세 정보 조회 (판매자 정보 포함) - 모든 서비스
        const { data: services } = await supabase
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
          .order('orders_count', { ascending: false })

        return {
          category_id: category.category_id,
          category_name: category.category_name,
          category_slug: category.category_slug,
          visit_count: category.visit_count,
          services: services || []
        }
      })
    )

    // 서비스가 있는 카테고리만 반환
    return categoriesWithServices.filter(cat => cat.services.length > 0)

  } catch (error) {
    logger.error('Failed to fetch personalized services:', error)
    return []
  }
}
