import { createClient } from '@/lib/supabase/client'

export async function getBuyerDashboardStats(userId: string) {
  try {
    const supabase = createClient()

    console.log('[getBuyerDashboardStats] Fetching stats for buyer:', userId)

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

    if (inProgressResult.error) console.error('[getBuyerDashboardStats] inProgress error:', inProgressResult.error)
    if (deliveredResult.error) console.error('[getBuyerDashboardStats] delivered error:', deliveredResult.error)
    if (completedResult.error) console.error('[getBuyerDashboardStats] completed error:', completedResult.error)

    // Get pending reviews count (completed orders without reviews)
    const { count: pendingReviewsCount, error: reviewError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .eq('status', 'completed')
      .is('review_id', null)

    if (reviewError) console.error('[getBuyerDashboardStats] review error:', reviewError)

    const stats = {
      inProgressOrders: inProgressResult.count || 0,
      deliveredOrders: deliveredResult.count || 0,
      pendingReviews: pendingReviewsCount || 0,
      monthlyPurchases: completedResult.count || 0
    }

    console.log('[getBuyerDashboardStats] Stats:', stats)

    return stats
  } catch (error) {
    console.error('[getBuyerDashboardStats] Unexpected error:', error)
    return {
      inProgressOrders: 0,
      deliveredOrders: 0,
      pendingReviews: 0,
      monthlyPurchases: 0
    }
  }
}

export async function getBuyerRecentOrders(userId: string, limit: number = 5) {
  try {
    const supabase = createClient()

    console.log('[getBuyerRecentOrders] Fetching orders for buyer:', userId)

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

    if (error) {
      console.error('[getBuyerRecentOrders] Error:', error)
      return []
    }

    console.log('[getBuyerRecentOrders] Found orders:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('[getBuyerRecentOrders] Unexpected error:', error)
    return []
  }
}

export async function getBuyerRecentFavorites(userId: string, limit: number = 5) {
  try {
    const supabase = createClient()

    console.log('[getBuyerRecentFavorites] Fetching favorites for user:', userId)

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

    if (error) {
      console.error('[getBuyerRecentFavorites] Error:', error)
      return []
    }

    console.log('[getBuyerRecentFavorites] Found favorites:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('[getBuyerRecentFavorites] Unexpected error:', error)
    return []
  }
}

export async function getBuyerBenefits(userId: string) {
  try {
    const supabase = createClient()

    console.log('[getBuyerBenefits] Fetching benefits for user:', userId)

    // Get coupons count
    const { count: couponsCount, error: couponError } = await supabase
      .from('user_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())

    if (couponError) console.error('[getBuyerBenefits] Coupon error:', couponError)

    // Get cash balance from user_wallets or users table
    const { data: walletData, error: walletError } = await supabase
      .from('user_wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle()

    if (walletError) console.error('[getBuyerBenefits] Wallet error:', walletError)

    const benefits = {
      coupons: couponsCount || 0,
      cash: walletData?.balance || 0
    }

    console.log('[getBuyerBenefits] Benefits:', benefits)

    return benefits
  } catch (error) {
    console.error('[getBuyerBenefits] Unexpected error:', error)
    return {
      coupons: 0,
      cash: 0
    }
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
