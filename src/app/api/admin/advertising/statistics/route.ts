import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';

interface StatsQuery {
  period: 'day' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

interface Payment {
  amount: number;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
}

interface Impression {
  subscription_id: string;
  clicked: boolean;
  created_at: string;
}

interface Subscription {
  status: string;
  monthly_price: number;
  total_paid: number | null;
}

/**
 * 날짜를 기간별 키로 변환
 */
function getDateKey(date: Date, period: StatsQuery['period']): string {
  switch (period) {
    case 'day':
      return date.toISOString().split('T')[0];
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    case 'year':
      return String(date.getFullYear());
  }
}

/**
 * 결제 데이터에서 수익 통계 집계
 */
function aggregateRevenueStats(
  payments: Payment[] | null,
  period: StatsQuery['period']
): {
  revenueByPeriod: Map<string, number>;
  paymentMethodStats: Map<string, number>;
} {
  const revenueByPeriod = new Map<string, number>();
  const paymentMethodStats = new Map<string, number>();

  if (!payments) {
    return { revenueByPeriod, paymentMethodStats };
  }

  for (const payment of payments) {
    const date = new Date(payment.paid_at || payment.created_at);
    const key = getDateKey(date, period);

    revenueByPeriod.set(key, (revenueByPeriod.get(key) || 0) + payment.amount);
    paymentMethodStats.set(
      payment.payment_method,
      (paymentMethodStats.get(payment.payment_method) || 0) + payment.amount
    );
  }

  return { revenueByPeriod, paymentMethodStats };
}

/**
 * 노출/클릭 데이터 집계
 */
function aggregateImpressionStats(
  impressions: Impression[] | null
): Map<string, { impressions: number; clicks: number }> {
  const impressionsByService = new Map<string, { impressions: number; clicks: number }>();

  if (!impressions) {
    return impressionsByService;
  }

  for (const impression of impressions) {
    const existing = impressionsByService.get(impression.subscription_id) || {
      impressions: 0,
      clicks: 0,
    };
    existing.impressions++;
    if (impression.clicked) {
      existing.clicks++;
    }
    impressionsByService.set(impression.subscription_id, existing);
  }

  return impressionsByService;
}

/**
 * 구독 통계 계산
 */
function calculateSubscriptionStats(subscriptions: Subscription[] | null) {
  if (!subscriptions) {
    return {
      total: 0,
      active: 0,
      pending: 0,
      cancelled: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
    };
  }

  return {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'active').length,
    pending: subscriptions.filter((s) => s.status === 'pending_payment').length,
    cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
    totalRevenue: subscriptions.reduce((sum, s) => sum + (s.total_paid || 0), 0),
    monthlyRevenue: subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + s.monthly_price, 0),
  };
}

/**
 * 상위 서비스 통계 포맷팅
 */
function formatTopServices(
  topServices: Array<{
    id: string;
    service: unknown;
    seller: unknown;
  }> | null,
  impressionsByService: Map<string, { impressions: number; clicks: number }>
) {
  if (!topServices) {
    return [];
  }

  return topServices
    .map((service) => {
      const stats = impressionsByService.get(service.id) || { impressions: 0, clicks: 0 };
      const serviceData = service.service as { title: string } | null;
      const sellerData = service.seller as { full_name: string | null } | null;

      return {
        subscriptionId: service.id,
        serviceName: serviceData?.title || 'Unknown',
        sellerName: sellerData?.full_name || 'Unknown',
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      };
    })
    .sort((a, b) => b.impressions - a.impressions);
}

/**
 * Map을 응답용 배열로 변환
 */
function mapToArray<T>(map: Map<string, T>, keyName: string, valueName: string) {
  return Array.from(map.entries()).map(([key, value]) => ({
    [keyName]: key,
    [valueName]: value,
  }));
}

// GET - 광고 통계 조회
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const period = (searchParams.get('period') || 'day') as StatsQuery['period'];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 수익 통계 쿼리
    let revenueQuery = supabase
      .from('advertising_payments')
      .select('amount, payment_method, paid_at, created_at')
      .eq('status', 'completed');

    if (startDate) revenueQuery = revenueQuery.gte('paid_at', startDate);
    if (endDate) revenueQuery = revenueQuery.lte('paid_at', endDate);

    const { data: payments, error: paymentError } = await revenueQuery;
    if (paymentError) throw paymentError;

    // 수익 집계
    const { revenueByPeriod, paymentMethodStats } = aggregateRevenueStats(payments, period);

    // 노출 통계
    const { data: impressions, error: impressionError } = await supabase
      .from('advertising_impressions')
      .select('subscription_id, clicked, created_at');

    if (impressionError) throw impressionError;

    const impressionsByService = aggregateImpressionStats(impressions);
    const totalImpressions = impressions?.length || 0;
    const totalClicks = impressions?.filter((i) => i.clicked).length || 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Top 10 광고 서비스
    const topSubscriptionIds = Array.from(impressionsByService.entries())
      .sort((a, b) => b[1].impressions - a[1].impressions)
      .slice(0, 10)
      .map(([id]) => id);

    const { data: topServices } = await supabase
      .from('advertising_subscriptions')
      .select(
        `
        id,
        service:services!advertising_subscriptions_service_id_fkey(title),
        seller:users!advertising_subscriptions_seller_id_fkey(full_name)
      `
      )
      .in('id', topSubscriptionIds);

    const topServicesWithStats = formatTopServices(topServices, impressionsByService);

    // 전체 구독 통계
    const { data: allSubscriptions } = await supabase
      .from('advertising_subscriptions')
      .select('status, monthly_price, total_paid');

    const subscriptionStats = calculateSubscriptionStats(allSubscriptions);

    return NextResponse.json({
      period,
      startDate,
      endDate,
      revenue: {
        byPeriod: mapToArray(revenueByPeriod, 'period', 'amount'),
        byPaymentMethod: mapToArray(paymentMethodStats, 'method', 'amount'),
        total: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
      },
      performance: {
        totalImpressions,
        totalClicks,
        ctr: Number(ctr.toFixed(2)),
        topServices: topServicesWithStats,
      },
      subscriptions: subscriptionStats,
    });
  } catch (error) {
    console.error(
      'Failed to fetch advertising statistics:',
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    return NextResponse.json({ error: 'Failed to fetch advertising statistics' }, { status: 500 });
  }
}
