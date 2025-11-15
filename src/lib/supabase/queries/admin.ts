import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

// Types for query results with joins
type UserRow = Tables<'users'>
type OrderRow = Tables<'orders'>
type ServiceRow = Tables<'services'>
type ReviewRow = Tables<'reviews'>

export interface OrderWithRelations extends OrderRow {
  buyer: Pick<UserRow, 'id' | 'name' | 'email'> | null
  seller: Pick<UserRow, 'id' | 'name' | 'email'> | null
  service: Pick<ServiceRow, 'id' | 'title' | 'thumbnail_url'> | null
}

export interface ReviewWithRelations extends ReviewRow {
  buyer: Pick<UserRow, 'id' | 'name' | 'email'> | null
  seller: Pick<UserRow, 'id' | 'name' | 'email'> | null
  service: Pick<ServiceRow, 'id' | 'title'> | null
}

export interface ServiceWithSeller extends ServiceRow {
  seller: {
    id: string
    business_name: string | null
    user_id: string
    user?: Pick<UserRow, 'id' | 'name' | 'email'> | null
  } | null
}

export interface ServiceRevision {
  id: string
  service_id: string
  seller_id: string
  title: string
  description: string
  price: number
  delivery_days: number
  revision_count: number | null
  thumbnail_url: string | null
  status: string
  created_at: string
  reviewed_at: string | null
  admin_note: string | null
  revision_note: string | null
  service: ServiceWithSeller | null
  seller: {
    id: string
    business_name: string | null
    user_id: string
    user: Pick<UserRow, 'id' | 'name' | 'email'> | null
  } | null
}

export interface ServiceRevisionWithCategories extends ServiceRevision {
  revision_categories: Array<{ category: { id: string; name: string } }>
}

export interface ServiceDetailWithCategories extends ServiceRow {
  service_categories: Array<{ category: { id: string; name: string } }> | null
  seller: {
    id: string
    business_name: string | null
    user_id: string
    user: Pick<UserRow, 'id' | 'name' | 'email'> | null
  } | null
}

export interface AdminUserProfile {
  id: string
  email: string
  role: string
  created_at: string
  status: string
  name: string
  profile_image: string | null
}

// 관리자 대시보드 통계
export async function getAdminDashboardStats() {
  const supabase = createClient()

  // 전체 회원 수
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // 오늘 매출 (오늘 완료된 주문들의 합계)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .gte('completed_at', today.toISOString())

  const todayRevenue = todayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  // 진행중 주문 수
  const { count: inProgressOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['paid', 'in_progress'])

  // 대기중 신고 수 (reports 테이블이 있다고 가정)
  let pendingReports = 0
  try {
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .throwOnError()
    pendingReports = count || 0
  } catch {
    // reports 테이블이 없으면 0 반환
    pendingReports = 0
  }

  // 이번달 통계
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const { data: monthOrders } = await supabase
    .from('orders')
    .select('total_amount, status')
    .gte('created_at', monthStart.toISOString())

  const monthlyRevenue = monthOrders
    ?.filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  const monthlyOrderCount = monthOrders?.length || 0

  // 전체 통계
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: totalServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })

  return {
    totalUsers: totalUsers || 0,
    todayRevenue,
    inProgressOrders: inProgressOrders || 0,
    pendingReports,
    monthlyRevenue,
    monthlyOrderCount,
    totalOrders: totalOrders || 0,
    totalServices: totalServices || 0
  }
}

// 최근 주문 목록
export async function getAdminRecentOrders(limit: number = 10): Promise<OrderWithRelations[]> {
  const supabase = createClient()

  const { data, error} = await supabase
    .from('orders')
    .select(`
      *,
      buyer:users!buyer_id(id, name, email),
      seller:users!seller_id(id, name, email),
      service:services(id, title)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as OrderWithRelations[]) || []
}

// 최근 가입 회원
export async function getAdminRecentUsers(limit: number = 10): Promise<UserRow[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// 최근 리뷰
export async function getAdminRecentReviews(limit: number = 10): Promise<ReviewWithRelations[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      buyer:users!buyer_id(id, name),
      seller:users!seller_id(id, name),
      service:services(id, title)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as ReviewWithRelations[]) || []
}

// 일별 매출 통계 (최근 7일)
export async function getAdminDailySales(days: number = 7) {
  const supabase = createClient()

  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, completed_at, status')
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString())
    .eq('status', 'completed')

  if (error) throw error

  // 날짜별로 그룹화
  const salesByDate: { [key: string]: number } = {}

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateKey = date.toISOString().split('T')[0]
    salesByDate[dateKey] = 0
  }

  data?.forEach(order => {
    if (order.completed_at) {
      const dateKey = order.completed_at.split('T')[0]
      if (salesByDate[dateKey] !== undefined) {
        salesByDate[dateKey] += order.total_amount || 0
      }
    }
  })

  return Object.entries(salesByDate).map(([date, amount]) => ({
    date,
    amount
  }))
}

// 사용자 목록 조회 (필터링 및 페이지네이션)
export async function getAdminUsers(filters?: {
  role?: string
  searchQuery?: string
  status?: string
}): Promise<AdminUserProfile[]> {
  const supabase = createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.role && filters.role !== 'all') {
    query = query.eq('role', filters.role)
  }

  if (filters?.searchQuery) {
    query = query.or(`name.ilike.%${filters.searchQuery}%`)
  }

  const { data: profiles, error } = await query

  if (error) {
    console.error('getAdminUsers error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return []
  }

  // profiles 데이터를 users 형식으로 변환
  return profiles?.map((profile: { user_id: string; role?: string; created_at: string; name?: string; profile_image?: string | null }): AdminUserProfile => ({
    id: profile.user_id,
    email: 'user@example.com', // TODO: Server Component에서 auth.users 조회 필요
    role: profile.role || 'buyer',
    created_at: profile.created_at,
    status: 'active',
    name: profile.name || 'Unknown',
    profile_image: profile.profile_image || null
  })) || []
}

// 사용자 역할별 카운트
export async function getAdminUsersCount(role?: string) {
  const supabase = createClient()

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (role) {
    query = query.eq('role', role)
  }

  const { count, error } = await query

  if (error) {
    console.error('getAdminUsersCount error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return 0
  }
  return count || 0
}

// 관리자 주문 목록 조회
export async function getAdminOrders(filters?: {
  status?: string
  searchQuery?: string
}): Promise<OrderWithRelations[]> {
  const supabase = createClient()

  let query = supabase
    .from('orders')
    .select(`
      *,
      buyer:users!buyer_id(id, name, email),
      seller:users!seller_id(id, name, email),
      service:services(id, title, thumbnail_url)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.searchQuery) {
    // 주문 번호로 검색
    query = query.or(`order_number.ilike.%${filters.searchQuery}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as OrderWithRelations[]) || []
}

// 관리자 주문 상태별 카운트
export async function getAdminOrdersCount(status?: string) {
  const supabase = createClient()

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// 관리자 서비스 목록 조회
export async function getAdminServices(filters?: {
  status?: string
  searchQuery?: string
}): Promise<ServiceWithSeller[]> {
  const supabase = createClient()

  let query = supabase
    .from('services')
    .select(`
      *,
      seller:sellers!seller_id(
        id,
        business_name,
        user_id
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%`)
  }

  const { data: services, error } = await query

  if (error) throw error

  // seller의 user 정보를 별도로 조회
  if (services && services.length > 0) {
    const userIds = [...new Set(services.map(s => s.seller?.user_id).filter(Boolean))] as string[]

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds)

      // services에 user 정보 병합
      const userMap = new Map(users?.map(u => [u.id, u]) || [])
      services.forEach((service: ServiceWithSeller) => {
        if (service.seller?.user_id) {
          service.seller.user = userMap.get(service.seller.user_id) || null
        }
      })
    }
  }

  return (services as ServiceWithSeller[]) || []
}

// 관리자 서비스 상태별 카운트
export async function getAdminServicesCount(status?: string) {
  const supabase = createClient()

  let query = supabase
    .from('services')
    .select('*', { count: 'exact', head: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// 관리자 리뷰 목록 조회
export async function getAdminReviews(filters?: {
  rating?: number
  searchQuery?: string
}): Promise<ReviewWithRelations[]> {
  const supabase = createClient()

  let query = supabase
    .from('reviews')
    .select(`
      *,
      buyer:users!buyer_id(id, name, email),
      seller:users!seller_id(id, name, email),
      service:services(id, title)
    `)
    .order('created_at', { ascending: false})

  if (filters?.rating && filters.rating > 0) {
    query = query.eq('rating', filters.rating)
  }

  if (filters?.searchQuery) {
    query = query.or(`content.ilike.%${filters.searchQuery}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as ReviewWithRelations[]) || []
}

// 서비스 수정 요청 조회
export async function getServiceRevisions(filters?: {
  status?: 'pending' | 'approved' | 'rejected'
  searchQuery?: string
}): Promise<ServiceRevision[]> {
  const supabase = createClient()

  let query = supabase
    .from('service_revisions')
    .select(`
      *,
      service:services!service_id(
        id,
        title,
        status,
        seller_id
      ),
      seller:sellers!seller_id(
        id,
        business_name,
        user_id
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data: revisions, error } = await query

  if (error) throw error

  // 사용자 정보를 별도로 조회
  const userIds = [...new Set(revisions?.map((r: ServiceRevision) => r.seller?.user_id).filter(Boolean))] as string[]

  if (userIds.length === 0) {
    return revisions?.map((r: ServiceRevision) => ({
      ...r,
      seller: r.seller ? { ...r.seller, user: null } : null
    })) || []
  }

  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', userIds)

  // 사용자 정보 병합
  const usersMap = new Map(users?.map(u => [u.id, u]) || [])

  return revisions?.map((revision: ServiceRevision) => ({
    ...revision,
    seller: revision.seller ? {
      ...revision.seller,
      user: usersMap.get(revision.seller.user_id) || null
    } : null
  })) || []
}

// 서비스 수정 요청 개수 조회
export async function getServiceRevisionsCount(status?: 'pending' | 'approved' | 'rejected') {
  const supabase = createClient()

  let query = supabase
    .from('service_revisions')
    .select('*', { count: 'exact', head: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// 서비스 수정 요청 승인
export async function approveServiceRevision(revisionId: string) {
  const supabase = createClient()

  // approve_service_revision 함수 호출
  const { error } = await supabase.rpc('approve_service_revision', {
    revision_id_param: revisionId
  })

  if (error) throw error
}

// 서비스 수정 요청 반려
export async function rejectServiceRevision(revisionId: string, adminNote?: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('service_revisions')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      admin_note: adminNote || '수정 요청이 반려되었습니다.'
    })
    .eq('id', revisionId)

  if (error) throw error
}

// 서비스 수정 요청 상세 조회
export async function getServiceRevisionDetail(revisionId: string, supabaseClient?: ReturnType<typeof createClient>): Promise<ServiceRevisionWithCategories & { service: ServiceDetailWithCategories }> {
  const supabase = supabaseClient || createClient()

  // 수정 요청 정보
  const { data: revision, error: revisionError } = await supabase
    .from('service_revisions')
    .select('*')
    .eq('id', revisionId)
    .single()

  if (revisionError) throw revisionError

  // 원본 서비스 정보
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', revision.service_id)
    .single()

  // 원본 서비스 카테고리
  const { data: serviceCategoryLinks } = await supabase
    .from('service_categories')
    .select('category_id')
    .eq('service_id', revision.service_id)

  let serviceCategories: Array<{ category: { id: string; name: string } }> = []
  if (serviceCategoryLinks && serviceCategoryLinks.length > 0) {
    const categoryIds = serviceCategoryLinks.map((sc: { category_id: string }) => sc.category_id)
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)

    serviceCategories = cats?.map((cat: { id: string; name: string }) => ({ category: cat })) || []
  }

  // 수정 요청의 카테고리
  const { data: revisionCategoryLinks } = await supabase
    .from('service_revision_categories')
    .select('category_id')
    .eq('revision_id', revisionId)

  let revisionCategories: Array<{ category: { id: string; name: string } }> = []
  if (revisionCategoryLinks && revisionCategoryLinks.length > 0) {
    const categoryIds = revisionCategoryLinks.map((rc: { category_id: string }) => rc.category_id)
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)

    revisionCategories = cats?.map((cat: { id: string; name: string }) => ({ category: cat })) || []
  }

  // 판매자 정보
  const { data: seller } = await supabase
    .from('sellers')
    .select('id, business_name, user_id')
    .eq('id', revision.seller_id)
    .single()

  // seller user 정보
  let sellerWithUser: { id: string; business_name: string | null; user_id: string; user: Pick<UserRow, 'id' | 'name' | 'email'> | null } | null = seller ? { ...seller, user: null } : null
  if (seller?.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', seller.user_id)
      .single()

    if (userData) {
      sellerWithUser = { ...seller, user: userData }
    }
  }

  return {
    ...revision,
    service: {
      ...service,
      service_categories: serviceCategories,
      seller: null
    } as ServiceDetailWithCategories,
    seller: sellerWithUser,
    revision_categories: revisionCategories
  } as ServiceRevisionWithCategories & { service: ServiceDetailWithCategories }
}
