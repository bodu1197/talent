import { createClient } from '@/lib/supabase/client'

export async function getBuyerDashboardStats(userId: string) {
  const supabase = createClient()

  // Get counts for different order statuses
  const [inProgressResult, deliveredResult, completedResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .eq('status', 'in_progress'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .eq('status', 'delivered'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .eq('status', 'completed')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  // Get pending reviews count (completed orders without reviews)
  const { count: pendingReviewsCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', userId)
    .eq('status', 'completed')
    .is('review_id', null)

  return {
    inProgressOrders: inProgressResult.count || 0,
    deliveredOrders: deliveredResult.count || 0,
    pendingReviews: pendingReviewsCount || 0,
    monthlyPurchases: completedResult.count || 0
  }
}

export async function getBuyerRecentOrders(userId: string, limit: number = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      service:services(id, title, thumbnail_url),
      seller:users!seller_id(id, name, profile_image)
    `)
    .eq('buyer_id', userId)
    .in('status', ['in_progress', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getBuyerRecentFavorites(userId: string, limit: number = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      service:services(
        id, title,
        seller:users!seller_id(id, name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getBuyerBenefits(userId: string) {
  const supabase = createClient()

  // Get coupons count
  const { count: couponsCount } = await supabase
    .from('user_coupons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString())

  // Get cash balance from user_wallets or users table
  const { data: walletData } = await supabase
    .from('user_wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()

  return {
    coupons: couponsCount || 0,
    cash: walletData?.balance || 0
  }
}

export async function getSellerDashboardStats(userId: string) {
  const supabase = createClient()

  // Get counts for different order statuses
  const [newOrdersResult, inProgressResult, deliveredResult, completedResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)
      .eq('status', 'paid'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)
      .eq('status', 'in_progress'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)
      .eq('status', 'delivered'),
    supabase
      .from('orders')
      .select('total_amount', { count: 'exact' })
      .eq('seller_id', userId)
      .eq('status', 'completed')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  // Calculate monthly revenue
  const monthlyRevenue = completedResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  return {
    newOrders: newOrdersResult.count || 0,
    inProgressOrders: inProgressResult.count || 0,
    deliveredOrders: deliveredResult.count || 0,
    monthlyRevenue
  }
}

export async function getSellerRecentOrders(userId: string, limit: number = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      service:services(id, title, thumbnail_url),
      buyer:users!buyer_id(id, name, profile_image)
    `)
    .eq('seller_id', userId)
    .in('status', ['paid', 'in_progress', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
