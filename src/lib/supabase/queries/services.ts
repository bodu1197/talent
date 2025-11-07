import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// 한 번의 쿼리로 모든 하위 카테고리 ID 가져오기 (최적화)
async function getAllDescendantCategories(supabase: any, parentId: string, parentLevel: number): Promise<string[]> {
  // level에 따라 필요한 모든 카테고리를 한 번에 조회
  if (parentLevel === 1) {
    // 1차 카테고리: 2차와 3차 모두 가져오기
    const { data: level2 } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', parentId)

    if (!level2 || level2.length === 0) return []

    const level2Ids = level2.map((c: any) => c.id)

    // 3차 카테고리도 한 번에 가져오기
    const { data: level3 } = await supabase
      .from('categories')
      .select('id')
      .in('parent_id', level2Ids)

    const level3Ids = level3?.map((c: any) => c.id) || []
    return [...level2Ids, ...level3Ids]

  } else if (parentLevel === 2) {
    // 2차 카테고리: 3차만 가져오기
    const { data: level3 } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', parentId)

    return level3?.map((c: any) => c.id) || []
  }

  return []
}

export async function getSellerServices(userId: string, status?: string) {
  const supabase = createBrowserClient()

  let query = supabase
    .from('services')
    .select(`
      *,
      service_categories(
        category:categories(id, name)
      )
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getServiceById(serviceId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      seller:sellers(
        id,
        business_name,
        display_name,
        user_id
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `)
    .eq('id', serviceId)
    .single()

  if (error) throw error

  // seller의 user 정보를 별도로 조회
  if (data?.seller?.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email, profile_image')
      .eq('id', data.seller.user_id)
      .single()

    if (userData) {
      data.seller.user = userData
    }
  }

  return data
}

export async function getSellerServicesCount(userId: string, status: string) {
  const supabase = createBrowserClient()

  const { count, error } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('status', status)

  if (error) throw error
  return count || 0
}

// 카테고리별 승인된 서비스 조회 (서버 컴포넌트용)
export async function getServicesByCategory(categoryId: string) {
  const supabase = await createServerClient()

  // 1. 먼저 카테고리 정보 조회 (level 확인)
  const { data: category } = await supabase
    .from('categories')
    .select('id, level')
    .eq('id', categoryId)
    .single()

  if (!category) {
    return []
  }

  let categoryIds = [categoryId]

  // 2. 1차 또는 2차 카테고리인 경우, 모든 하위 카테고리 ID 가져오기
  if (category.level === 1 || category.level === 2) {
    const allDescendants = await getAllDescendantCategories(supabase, categoryId, category.level)
    categoryIds = [categoryId, ...allDescendants]
  }

  // 3. 먼저 해당 카테고리의 service_id 목록 가져오기
  const { data: serviceLinks } = await supabase
    .from('service_categories')
    .select('service_id')
    .in('category_id', categoryIds)

  const serviceIds = serviceLinks?.map(sl => sl.service_id) || []

  if (serviceIds.length === 0) {
    return []
  }

  // 4. 서비스 조회
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      seller:sellers!inner(
        id,
        business_name,
        display_name,
        user_id,
        is_verified
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `)
    .in('id', serviceIds)
    .eq('status', 'active')  // 승인된 서비스만
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching services by category:', error)
    throw error
  }

  // 데이터 매핑 및 seller user 정보 추가
  if (data && data.length > 0) {
    // 각 서비스에 대해 price_min, price_max 설정 (단일 가격 사용)
    data.forEach(service => {
      service.price_min = service.price || 0
      service.price_max = service.price || undefined

      // order_count 매핑
      service.order_count = service.orders_count || 0
    })

    // seller의 user 정보 추가
    const userIds = data.map(s => s.seller?.user_id).filter(Boolean)

    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, email, profile_image')
        .in('id', userIds)

      if (usersData) {
        data.forEach(service => {
          if (service.seller?.user_id) {
            const user = usersData.find(u => u.id === service.seller.user_id)
            if (user) {
              service.seller.user = user
            }
          }
        })
      }
    }
  }

  return data || []
}

// 전체 승인된 서비스 조회 (홈페이지용) - AI 카테고리 제외
export async function getActiveServices(limit?: number) {
  const supabase = await createServerClient()

  // 1. AI 카테고리 ID 조회
  const { data: aiCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'ai-services')
    .maybeSingle()

  let excludeServiceIds: string[] = []

  // 2. AI 카테고리 서비스 ID 조회
  if (aiCategory) {
    const { data: aiServiceLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .eq('category_id', aiCategory.id)

    if (aiServiceLinks && aiServiceLinks.length > 0) {
      excludeServiceIds = aiServiceLinks.map(sc => sc.service_id)
    }
  }

  // 3. AI 카테고리 제외한 서비스 조회
  let query = supabase
    .from('services')
    .select(`
      *,
      seller:sellers!inner(
        id,
        business_name,
        display_name,
        user_id,
        is_verified
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `)
    .eq('status', 'active')  // 승인된 서비스만

  // AI 카테고리 서비스 제외
  if (excludeServiceIds.length > 0) {
    query = query.not('id', 'in', `(${excludeServiceIds.join(',')})`)
  }

  query = query.order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    logger.error('Error fetching active services:', error)
    throw error
  }

  // 데이터 매핑 (단일 가격 사용)
  if (data && data.length > 0) {
    data.forEach(service => {
      service.price_min = service.price || 0
      service.price_max = service.price || undefined

      // order_count 매핑
      service.order_count = service.orders_count || 0
    })
  }

  return data || []
}
