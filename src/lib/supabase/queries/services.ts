import { createClient } from '@/lib/supabase/client'

export async function getSellerServices(userId: string, status?: string) {
  const supabase = createClient()

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
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      seller:sellers(
        id,
        business_name,
        user_id
      ),
      service_categories(
        category:categories(id, name, slug)
      ),
      service_packages(*)
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
  const supabase = createClient()

  const { count, error } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('status', status)

  if (error) throw error
  return count || 0
}

// 카테고리별 승인된 서비스 조회
export async function getServicesByCategory(categoryId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      seller:sellers!inner(
        id,
        business_name,
        user_id,
        is_verified
      ),
      service_categories!inner(
        category_id
      ),
      service_packages(*)
    `)
    .eq('service_categories.category_id', categoryId)
    .eq('status', 'active')  // 승인된 서비스만
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching services by category:', error)
    throw error
  }

  // seller의 user 정보 추가
  if (data && data.length > 0) {
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

// 전체 승인된 서비스 조회 (홈페이지용)
export async function getActiveServices(limit?: number) {
  const supabase = createClient()

  let query = supabase
    .from('services')
    .select(`
      *,
      seller:sellers!inner(
        id,
        business_name,
        user_id,
        is_verified
      ),
      service_categories(
        category:categories(id, name, slug)
      ),
      service_packages(*)
    `)
    .eq('status', 'active')  // 승인된 서비스만
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching active services:', error)
    throw error
  }

  return data || []
}
