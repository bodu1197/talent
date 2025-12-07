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

    // 구매자 통계
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', user.id);

    const { count: quotesCount } = await supabase
      .from('quote_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: favoritesCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 판매자 통계 (전문가인 경우)
    let salesCount = 0;
    let servicesCount = 0;
    let earnings = 0;

    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (seller) {
      const { count: sales } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id);
      salesCount = sales || 0;

      const { count: services } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id);
      servicesCount = services || 0;

      // 총 수익 계산 (완료된 주문)
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('total_price')
        .eq('seller_id', seller.id)
        .eq('status', 'completed');

      if (completedOrders) {
        earnings = completedOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
      }
    }

    return NextResponse.json({
      orders: ordersCount || 0,
      quotes: quotesCount || 0,
      reviews: reviewsCount || 0,
      favorites: favoritesCount || 0,
      sales: salesCount,
      services: servicesCount,
      earnings,
    });
  } catch (error) {
    console.error('Market stats error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
