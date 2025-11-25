import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function getBuyerDashboardStats(userId: string) {
  try {
    const supabase = await createClient();

    // 단일 쿼리로 모든 주문 데이터 가져오기 (4개 쿼리 → 1개 쿼리로 최적화)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, review_id, created_at')
      .eq('buyer_id', userId);

    if (error) {
      logger.error('[getBuyerDashboardStats] Error:', error);
      return {
        inProgressOrders: 0,
        deliveredOrders: 0,
        pendingReviews: 0,
        monthlyPurchases: 0,
      };
    }

    // JavaScript로 카운트 계산
    const stats = {
      inProgressOrders: 0,
      deliveredOrders: 0,
      pendingReviews: 0,
      monthlyPurchases: 0,
    };

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    if (orders) {
      for (const order of orders) {
        if (order.status === 'in_progress') {
          stats.inProgressOrders++;
        } else if (order.status === 'delivered') {
          stats.deliveredOrders++;
        } else if (order.status === 'completed') {
          // 리뷰가 없는 완료된 주문 = 대기중인 리뷰
          if (!order.review_id) {
            stats.pendingReviews++;
          }
          // 이번 달 완료된 주문
          if (order.created_at >= monthStart) {
            stats.monthlyPurchases++;
          }
        }
      }
    }

    return stats;
  } catch (error) {
    logger.error('[getBuyerDashboardStats] Unexpected error:', error);
    return {
      inProgressOrders: 0,
      deliveredOrders: 0,
      pendingReviews: 0,
      monthlyPurchases: 0,
    };
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
      .from('favorites')
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

export async function getSellerDashboardStats(sellerUserId: string) {
  const supabase = await createClient();

  // 단일 쿼리로 모든 주문 데이터 가져오기 (5개 쿼리 → 1개 쿼리로 최적화)
  // Note: orders.seller_id actually references users.id (not sellers.id)
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .eq('seller_id', sellerUserId);

  if (error) {
    logger.error('[getSellerDashboardStats] Error:', error);
    return {
      newOrders: 0,
      inProgressOrders: 0,
      deliveredOrders: 0,
      completedOrders: 0,
      monthlyRevenue: 0,
    };
  }

  // JavaScript로 카운트 및 수익 계산
  const stats = {
    newOrders: 0,
    inProgressOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
  };

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  if (orders) {
    for (const order of orders) {
      if (order.status === 'paid') stats.newOrders++;
      else if (order.status === 'in_progress') stats.inProgressOrders++;
      else if (order.status === 'delivered') stats.deliveredOrders++;
      else if (order.status === 'completed') {
        stats.completedOrders++;
        // 이번 달 완료된 주문의 수익 계산
        if (order.created_at >= monthStart) {
          stats.monthlyRevenue += order.total_amount || 0;
        }
      }
    }
  }

  return stats;
}

export async function getSellerRecentOrders(sellerUserId: string, limit: number = 5) {
  const supabase = await createClient();

  // Note: orders.seller_id actually references users.id (not sellers.id)
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
