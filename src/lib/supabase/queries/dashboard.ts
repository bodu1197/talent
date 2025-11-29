import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

interface BuyerOrder {
  status: string;
  review_id: string | null;
  created_at: string;
}

interface SellerOrder {
  status: string;
  total_amount: number | null;
  created_at: string;
}

interface BuyerDashboardStats {
  inProgressOrders: number;
  deliveredOrders: number;
  pendingReviews: number;
  monthlyPurchases: number;
}

interface SellerDashboardStats {
  newOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  monthlyRevenue: number;
}

/**
 * 이번 달 시작 날짜 ISO 문자열 반환
 */
function getMonthStartISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/**
 * 구매자 주문 상태 집계
 */
function calculateBuyerStats(orders: BuyerOrder[], monthStart: string): BuyerDashboardStats {
  const stats: BuyerDashboardStats = {
    inProgressOrders: 0,
    deliveredOrders: 0,
    pendingReviews: 0,
    monthlyPurchases: 0,
  };

  for (const order of orders) {
    switch (order.status) {
      case 'in_progress':
        stats.inProgressOrders++;
        break;
      case 'delivered':
        stats.deliveredOrders++;
        break;
      case 'completed':
        if (!order.review_id) stats.pendingReviews++;
        if (order.created_at >= monthStart) stats.monthlyPurchases++;
        break;
    }
  }

  return stats;
}

/**
 * 판매자 주문 상태 집계
 */
function calculateSellerStats(orders: SellerOrder[], monthStart: string): SellerDashboardStats {
  const stats: SellerDashboardStats = {
    newOrders: 0,
    inProgressOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
  };

  for (const order of orders) {
    switch (order.status) {
      case 'paid':
        stats.newOrders++;
        break;
      case 'in_progress':
        stats.inProgressOrders++;
        break;
      case 'delivered':
        stats.deliveredOrders++;
        break;
      case 'completed':
        stats.completedOrders++;
        if (order.created_at >= monthStart) {
          stats.monthlyRevenue += order.total_amount || 0;
        }
        break;
    }
  }

  return stats;
}

/**
 * 기본 구매자 대시보드 통계 반환
 */
function getDefaultBuyerStats(): BuyerDashboardStats {
  return {
    inProgressOrders: 0,
    deliveredOrders: 0,
    pendingReviews: 0,
    monthlyPurchases: 0,
  };
}

/**
 * 기본 판매자 대시보드 통계 반환
 */
function getDefaultSellerStats(): SellerDashboardStats {
  return {
    newOrders: 0,
    inProgressOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
  };
}

export async function getBuyerDashboardStats(userId: string): Promise<BuyerDashboardStats> {
  try {
    const supabase = await createClient();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, review_id, created_at')
      .eq('buyer_id', userId);

    if (error) {
      logger.error('[getBuyerDashboardStats] Error:', error);
      return getDefaultBuyerStats();
    }

    if (!orders) {
      return getDefaultBuyerStats();
    }

    return calculateBuyerStats(orders, getMonthStartISO());
  } catch (error) {
    logger.error('[getBuyerDashboardStats] Unexpected error:', error);
    return getDefaultBuyerStats();
  }
}

export async function getBuyerRecentOrders(userId: string, limit: number = 5) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        service:services(id, title, thumbnail_url),
        seller:users!seller_id(id, name, profile_image)
      `
      )
      .eq('buyer_id', userId)
      .in('status', ['in_progress', 'delivered'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('[getBuyerRecentOrders] Error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('[getBuyerRecentOrders] Unexpected error:', error);
    return [];
  }
}

export async function getBuyerRecentFavorites(userId: string, limit: number = 5) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('service_favorites')
      .select(
        `
        id,
        created_at,
        service:services(
          id, title,
          seller:users!seller_id(id, name)
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('[getBuyerRecentFavorites] Error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('[getBuyerRecentFavorites] Unexpected error:', error);
    return [];
  }
}

export async function getBuyerBenefits(_userId: string) {
  // Coupon/cash features have been removed
  // Return empty benefits to avoid querying deleted tables
  return {
    points: 0,
    coupons: 0,
    membershipLevel: 'basic',
  };
}

export async function getSellerDashboardStats(sellerUserId: string): Promise<SellerDashboardStats> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .eq('seller_id', sellerUserId);

  if (error) {
    logger.error('[getSellerDashboardStats] Error:', error);
    return getDefaultSellerStats();
  }

  if (!orders) {
    return getDefaultSellerStats();
  }

  return calculateSellerStats(orders, getMonthStartISO());
}

export async function getSellerRecentOrders(sellerUserId: string, limit: number = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      service:services(id, title, thumbnail_url),
      buyer:users!buyer_id(id, name, profile_image)
    `
    )
    .eq('seller_id', sellerUserId)
    .in('status', ['paid', 'in_progress', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
