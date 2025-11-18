import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdminAuth } from '@/lib/admin/auth'

interface StatsQuery {
  period: 'day' | 'month' | 'year'
  startDate?: string
  endDate?: string
}

// GET - 광고 통계 조회
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth()
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const period = (searchParams.get('period') || 'day') as StatsQuery['period']
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 수익 통계
    let revenueQuery = supabase
      .from('advertising_payments')
      .select('amount, payment_method, paid_at, created_at')
      .eq('status', 'completed')

    if (startDate) {
      revenueQuery = revenueQuery.gte('paid_at', startDate)
    }
    if (endDate) {
      revenueQuery = revenueQuery.lte('paid_at', endDate)
    }

    const { data: payments, error: paymentError } = await revenueQuery

    if (paymentError) throw paymentError

    // 기간별 수익 집계
    const revenueByPeriod = new Map<string, number>()
    const paymentMethodStats = new Map<string, number>()

    payments?.forEach(payment => {
      const date = new Date(payment.paid_at || payment.created_at)
      let key: string

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'year':
          key = String(date.getFullYear())
          break
      }

      revenueByPeriod.set(key, (revenueByPeriod.get(key) || 0) + payment.amount)
      paymentMethodStats.set(
        payment.payment_method,
        (paymentMethodStats.get(payment.payment_method) || 0) + payment.amount
      )
    })

    // 광고 성과 통계
    const { data: impressions, error: impressionError } = await supabase
      .from('advertising_impressions')
      .select('subscription_id, clicked, created_at')

    if (impressionError) throw impressionError

    const totalImpressions = impressions?.length || 0
    const totalClicks = impressions?.filter(i => i.clicked).length || 0
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    // Top 10 광고 서비스
    const impressionsByService = new Map<string, { impressions: number; clicks: number }>()

    impressions?.forEach(impression => {
      const existing = impressionsByService.get(impression.subscription_id) || {
        impressions: 0,
        clicks: 0,
      }
      existing.impressions++
      if (impression.clicked) existing.clicks++
      impressionsByService.set(impression.subscription_id, existing)
    })

    // 서비스 정보 가져오기
    const topSubscriptionIds = Array.from(impressionsByService.entries())
      .sort((a, b) => b[1].impressions - a[1].impressions)
      .slice(0, 10)
      .map(([id]) => id)

    const { data: topServices } = await supabase
      .from('advertising_subscriptions')
      .select(`
        id,
        service:services!advertising_subscriptions_service_id_fkey(title),
        seller:users!advertising_subscriptions_seller_id_fkey(full_name)
      `)
      .in('id', topSubscriptionIds)

    const topServicesWithStats = topServices?.map(service => {
      const stats = impressionsByService.get(service.id) || { impressions: 0, clicks: 0 }
      const serviceData = service.service as unknown as { title: string } | null
      const sellerData = service.seller as unknown as { full_name: string | null } | null
      return {
        subscriptionId: service.id,
        serviceName: serviceData?.title || 'Unknown',
        sellerName: sellerData?.full_name || 'Unknown',
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      }
    }).sort((a, b) => b.impressions - a.impressions) || []

    // 전체 구독 통계
    const { data: allSubscriptions } = await supabase
      .from('advertising_subscriptions')
      .select('status, monthly_price, total_paid')

    const subscriptionStats = {
      total: allSubscriptions?.length || 0,
      active: allSubscriptions?.filter(s => s.status === 'active').length || 0,
      pending: allSubscriptions?.filter(s => s.status === 'pending_payment').length || 0,
      cancelled: allSubscriptions?.filter(s => s.status === 'cancelled').length || 0,
      totalRevenue: allSubscriptions?.reduce((sum, s) => sum + (s.total_paid || 0), 0) || 0,
      monthlyRevenue: allSubscriptions?.filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.monthly_price, 0) || 0,
    }

    return NextResponse.json({
      period,
      startDate,
      endDate,
      revenue: {
        byPeriod: Array.from(revenueByPeriod.entries()).map(([period, amount]) => ({
          period,
          amount,
        })),
        byPaymentMethod: Array.from(paymentMethodStats.entries()).map(([method, amount]) => ({
          method,
          amount,
        })),
        total: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
      },
      performance: {
        totalImpressions,
        totalClicks,
        ctr: Number(ctr.toFixed(2)),
        topServices: topServicesWithStats,
      },
      subscriptions: subscriptionStats,
    })
  } catch (error) {
    console.error('Failed to fetch advertising statistics:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to fetch advertising statistics' },
      { status: 500 }
    )
  }
}
