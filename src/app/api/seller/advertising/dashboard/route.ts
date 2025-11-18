import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/singleton'

export async function GET(_request: NextRequest) {
  try {
    // 사용자 인증
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Service Role Client로 데이터 조회
    const serviceSupabase = createServiceRoleClient()

    // Seller ID 조회
    const { data: seller } = await serviceSupabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // 구독 정보 조회 (서비스 정보 포함)
    const { data: subscriptions } = await serviceSupabase
      .from('advertising_subscriptions')
      .select(`
        *,
        service:services(id, title)
      `)
      .eq('seller_id', seller.id)
      .in('status', ['active', 'pending_payment'])

    // 판매자의 모든 서비스 조회
    const { data: myServices } = await serviceSupabase
      .from('services')
      .select('id, title, thumbnail_url')
      .eq('seller_id', seller.id)
      .eq('status', 'active')
      .is('deleted_at', null)

    // 활성 광고 정보 조회
    const { data: activeAds } = await serviceSupabase
      .from('advertising_subscriptions')
      .select('*')
      .eq('seller_id', seller.id)
      .in('status', ['active', 'pending_payment'])

    // 서비스별 광고 정보 매핑
    const adDetailsMap = new Map(
      activeAds?.map(ad => [
        ad.service_id,
        {
          subscriptionId: ad.id,
          monthlyPrice: ad.monthly_price,
          nextBillingDate: ad.next_billing_date,
          totalImpressions: ad.total_impressions,
          totalClicks: ad.total_clicks,
          ctr: ad.total_impressions > 0 ? (ad.total_clicks / ad.total_impressions) * 100 : 0,
          createdAt: ad.created_at,
          status: ad.status,
          isFreePromotion: ad.is_free_promotion || false,
          promotionEndDate: ad.promotion_end_date || null
        }
      ]) || []
    )

    const servicesWithAdStatus = myServices?.map(service => ({
      id: service.id,
      title: service.title,
      thumbnailUrl: service.thumbnail_url,
      hasActiveAd: adDetailsMap.has(service.id),
      adDetails: adDetailsMap.get(service.id)
    })) || []

    // 통계 계산
    const totalImpressions = subscriptions?.reduce((sum, s) => sum + s.total_impressions, 0) || 0
    const totalClicks = subscriptions?.reduce((sum, s) => sum + s.total_clicks, 0) || 0
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    return NextResponse.json({
      subscriptions: subscriptions?.map(s => ({
        id: s.id,
        serviceId: s.service_id,
        serviceName: s.service?.title || '',
        status: s.status,
        nextBillingDate: s.next_billing_date,
        monthlyPrice: s.monthly_price,
        totalImpressions: s.total_impressions,
        totalClicks: s.total_clicks,
        ctr: s.total_impressions > 0 ? (s.total_clicks / s.total_impressions) * 100 : 0,
        isFreePromotion: s.is_free_promotion || false,
        promotionEndDate: s.promotion_end_date || null
      })) || [],
      services: servicesWithAdStatus,
      stats: {
        totalImpressions,
        totalClicks,
        ctr,
        averagePosition: 0
      }
    })
  } catch (error) {
    console.error('Failed to fetch advertising dashboard:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to fetch advertising dashboard' },
      { status: 500 }
    )
  }
}
