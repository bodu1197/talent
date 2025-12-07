import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Activity {
  id: string;
  type: 'order' | 'errand' | 'sale' | 'delivery';
  title: string;
  time: string;
  created_at: string;
}

// 시간 차이를 한글로 표시
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 4) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${Math.floor(diffMonth / 12)}년 전`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const activities: Activity[] = [];

    // 구매 주문
    const { data: buyOrders } = await supabase
      .from('orders')
      .select('id, created_at, service:services(title)')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (buyOrders) {
      buyOrders.forEach((order) => {
        const service = Array.isArray(order.service) ? order.service[0] : order.service;
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: service?.title || '주문',
          time: formatTimeAgo(new Date(order.created_at)),
          created_at: order.created_at,
        });
      });
    }

    // 판매 주문 (전문가인 경우)
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (seller) {
      const { data: sellOrders } = await supabase
        .from('orders')
        .select('id, created_at, service:services(title)')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (sellOrders) {
        sellOrders.forEach((order) => {
          const service = Array.isArray(order.service) ? order.service[0] : order.service;
          activities.push({
            id: `sale-${order.id}`,
            type: 'sale',
            title: `${service?.title || '서비스'} 판매`,
            time: formatTimeAgo(new Date(order.created_at)),
            created_at: order.created_at,
          });
        });
      }
    }

    // 심부름 요청
    const { data: errandRequests } = await supabase
      .from('errands')
      .select('id, created_at, title')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (errandRequests) {
      errandRequests.forEach((errand) => {
        activities.push({
          id: `errand-${errand.id}`,
          type: 'errand',
          title: errand.title || '심부름 요청',
          time: formatTimeAgo(new Date(errand.created_at)),
          created_at: errand.created_at,
        });
      });
    }

    // 심부름 배달 (라이더인 경우)
    const { data: helper } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (helper) {
      const { data: deliveries } = await supabase
        .from('errands')
        .select('id, created_at, title')
        .eq('helper_id', helper.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (deliveries) {
        deliveries.forEach((errand) => {
          activities.push({
            id: `delivery-${errand.id}`,
            type: 'delivery',
            title: `${errand.title || '심부름'} 배달`,
            time: formatTimeAgo(new Date(errand.created_at)),
            created_at: errand.created_at,
          });
        });
      }
    }

    // 최신순 정렬
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      activities: activities.slice(0, 5),
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
