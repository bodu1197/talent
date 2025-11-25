import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * 광고 클릭 기록 API
 * POST /api/advertising/track/click
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId } = body;

    // 입력 검증
    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 해당 서비스의 활성 광고 구독 조회
    const { data: subscription } = await supabase
      .from('advertising_subscriptions')
      .select('id, service_id, total_clicks, total_impressions')
      .eq('service_id', serviceId)
      .eq('status', 'active')
      .maybeSingle();

    if (!subscription) {
      // 광고 구독이 없으면 조용히 성공 처리
      return NextResponse.json({ success: true, tracked: false });
    }

    // 가장 최근 노출 기록 찾기 (clicked=false인 것 중)
    const { data: recentImpression } = await supabase
      .from('advertising_impressions')
      .select('id')
      .eq('subscription_id', subscription.id)
      .eq('clicked', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 노출 기록이 있으면 클릭으로 업데이트
    if (recentImpression) {
      const { error: impressionError } = await supabase
        .from('advertising_impressions')
        .update({
          clicked: true,
          clicked_at: new Date().toISOString(),
        })
        .eq('id', recentImpression.id);

      if (impressionError) {
        logger.error('Failed to update impression:', impressionError);
      }
    }

    // 구독 통계 업데이트 (total_clicks 증가)
    const { error: updateError } = await supabase
      .from('advertising_subscriptions')
      .update({
        total_clicks: subscription.total_clicks + 1,
      })
      .eq('id', subscription.id);

    if (updateError) {
      logger.error('Failed to update subscription click stats:', updateError);
      return NextResponse.json({ error: 'Failed to update click stats' }, { status: 500 });
    }

    // CTR 계산
    const newClicks = subscription.total_clicks + 1;
    const ctr =
      subscription.total_impressions > 0 ? (newClicks / subscription.total_impressions) * 100 : 0;

    return NextResponse.json({
      success: true,
      tracked: true,
      clickCount: newClicks,
      impressionCount: subscription.total_impressions,
      ctr: Number(ctr.toFixed(2)),
    });
  } catch (error) {
    logger.error('Click tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
