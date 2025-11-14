import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function getBuyerDashboardStats(userId: string) {
  try {
    const supabase = await createClient()

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

    if (inProgressResult.error) logger.error('[getBuyerDashboardStats] inProgress error:', inProgressResult.error)
    if (deliveredResult.error) logger.error('[getBuyerDashboardStats] delivered error:', deliveredResult.error)
    if (completedResult.error) logger.error('[getBuyerDashboardStats] completed error:', completedResult.error)

    // Get pending reviews count (completed orders without reviews)
    const { count: pendingReviewsCount, error: reviewError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .eq('status', 'completed')
      .is('review_id', null)

    if (reviewError) logger.error('[getBuyerDashboardStats] review error:', reviewError)

    const stats = {
      inProgressOrders: inProgressResult.count || 0,
      deliveredOrders: deliveredResult.count || 0,
      pendingReviews: pendingReviewsCount || 0,
      monthlyPurchases: completedResult.count || 0
    }

    return stats
  } catch (error) {
    logger.error('[getBuyerDashboardStats] Unexpected error:', error)
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
    const supabase = await createClient()

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
      logger.error('[getBuyerRecentOrders] Error:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('[getBuyerRecentOrders] Unexpected error:', error)
    return []
  }
}

export async function getBuyerRecentFavorites(userId: string, limit: number = 5) {
  try {
    const supabase = await createClient()

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
      logger.error('[getBuyerRecentFavorites] Error:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('[getBuyerRecentFavorites] Unexpected error:', error)
    return []
  }
}

export async function getBuyerBenefits(userId: string) {
  // Coupon/cash features have been removed
  // Return empty benefits to avoid querying deleted tables
  return {
    coupons: 0,
    cash: 0
  }
}

export async function getSellerDashboardStats(sellerUserId: string) {
  const supabase = await createClient()

  // Get counts for different order statuses
  // Note: orders.seller_id actually references users.id (not sellers.id)
  const [newOrdersResult, inProgressResult, deliveredResult, completedResult, monthlyCompletedResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerUserId)
      .eq('status', 'paid'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerUserId)
      .eq('status', 'in_progress'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerUserId)
      .eq('status', 'delivered'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerUserId)
      .eq('status', 'completed'),
    supabase
      .from('orders')
      .select('total_amount', { count: 'exact' })
      .eq('seller_id', sellerUserId)
      .eq('status', 'completed')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  // Calculate monthly revenue (no commission - 100% to seller)
  const monthlyRevenue = monthlyCompletedResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  return {
    newOrders: newOrdersResult.count || 0,
    inProgressOrders: inProgressResult.count || 0,
    deliveredOrders: deliveredResult.count || 0,
    completedOrders: completedResult.count || 0,
    monthlyRevenue
  }
}

export async function getSellerRecentOrders(sellerUserId: string, limit: number = 5) {
  const supabase = await createClient()

  // Note: orders.seller_id actually references users.id (not sellers.id)
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      service:services(id, title, thumbnail_url),
      buyer:users!buyer_id(id, name, profile_image)
    `)
    .eq('seller_id', sellerUserId)
    .in('status', ['paid', 'in_progress', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
