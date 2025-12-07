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

    // 구매 건수
    const { count: buyCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', user.id);

    // 판매 건수 (전문가인 경우)
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let sellCount = 0;
    if (seller) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id);
      sellCount = count || 0;
    }

    // 심부름 요청 건수
    const { count: errandRequestCount } = await supabase
      .from('errands')
      .select('*', { count: 'exact', head: true })
      .eq('requester_id', user.id);

    // 심부름 배달 건수 (라이더인 경우)
    const { data: helper } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let deliveryCount = 0;
    if (helper) {
      const { count } = await supabase
        .from('errands')
        .select('*', { count: 'exact', head: true })
        .eq('helper_id', helper.id)
        .eq('status', 'completed');
      deliveryCount = count || 0;
    }

    return NextResponse.json({
      market: {
        buy: buyCount || 0,
        sell: sellCount,
      },
      errands: {
        request: errandRequestCount || 0,
        delivery: deliveryCount,
      },
    });
  } catch (error) {
    console.error('Hub stats error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
