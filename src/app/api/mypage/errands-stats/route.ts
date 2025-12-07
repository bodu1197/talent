import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 요청자 통계 - 진행중인 심부름
    const { count: requestsCount } = await supabase
      .from('errands')
      .select('*', { count: 'exact', head: true })
      .eq('requester_id', user.id)
      .in('status', ['pending', 'accepted', 'in_progress']);

    // 요청자 통계 - 전체 이력
    const { count: historyCount } = await supabase
      .from('errands')
      .select('*', { count: 'exact', head: true })
      .eq('requester_id', user.id);

    // 라이더 통계
    let deliveriesCount = 0;
    let earnings = 0;

    const { data: helper } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (helper) {
      // 진행중인 배달
      const { count: deliveries } = await supabase
        .from('errands')
        .select('*', { count: 'exact', head: true })
        .eq('helper_id', helper.id)
        .in('status', ['accepted', 'in_progress']);
      deliveriesCount = deliveries || 0;

      // 총 수익 (완료된 배달)
      const { data: completedDeliveries } = await supabase
        .from('errands')
        .select('reward')
        .eq('helper_id', helper.id)
        .eq('status', 'completed');

      if (completedDeliveries) {
        earnings = completedDeliveries.reduce((sum, d) => sum + (d.reward || 0), 0);
      }
    }

    return NextResponse.json({
      requests: requestsCount || 0,
      history: historyCount || 0,
      deliveries: deliveriesCount,
      earnings,
    });
  } catch (error) {
    console.error('Errands stats error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
