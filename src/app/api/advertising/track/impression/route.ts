import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * 광고 노출 기록 API
 * POST /api/advertising/track/impression
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, categoryId, position, page } = body;

    // 입력 검증
    if (!serviceId || !categoryId) {
      return NextResponse.json(
        { error: 'serviceId and categoryId are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // 해당 서비스의 활성 광고 구독 조회
    const { data: subscription } = await supabase
      .from('advertising_subscriptions')
      .select('id, service_id, total_impressions')
      .eq('service_id', serviceId)
      .eq('status', 'active')
      .maybeSingle();

    if (!subscription) {
      // 광고 구독이 없으면 조용히 성공 처리 (오류 방지)
      return NextResponse.json({ success: true, tracked: false });
    }

    // 노출 기록 생성
    const { error: impressionError } = await supabase
      .from('advertising_impressions')
      .insert({
        subscription_id: subscription.id,
        service_id: serviceId,
        category_id: categoryId,
        position: position || 1,
        page_number: page || 1,
        // 사용자 정보는 선택사항 (추후 확장 가능)
      });

    if (impressionError) {
      console.error('Failed to create impression:', impressionError);
      return NextResponse.json(
        { error: 'Failed to create impression' },
        { status: 500 }
      );
    }

    // 구독 통계 업데이트 (total_impressions 증가)
    const { error: updateError } = await supabase
      .from('advertising_subscriptions')
      .update({
        total_impressions: subscription.total_impressions + 1
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Failed to update subscription stats:', updateError);
      // 통계 업데이트 실패해도 노출 기록은 성공했으므로 계속 진행
    }

    return NextResponse.json({
      success: true,
      tracked: true,
      impressionCount: subscription.total_impressions + 1
    });

  } catch (error) {
    console.error('Impression tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
