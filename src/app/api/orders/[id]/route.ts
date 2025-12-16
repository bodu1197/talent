import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';

// GET /api/orders/[id] - 주문 상세 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 사용자 인증 확인
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // 주문 조회
    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        service:services(id, title, thumbnail_url, seller_id),
        buyer:users!orders_buyer_id_fkey(id, name, email, profile_image)
      `
      )
      .eq('id', id)
      .single();

    // 전문가 정보를 seller_profiles에서 별도 조회 (display_name, business_name 포함)
    if (order) {
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id, user_id, display_name, business_name, profile_image')
        .eq('user_id', order.seller_id)
        .single();

      if (sellerProfile) {
        order.seller = {
          id: sellerProfile.user_id,
          name: sellerProfile.display_name || sellerProfile.business_name || '전문가',
          profile_image: sellerProfile.profile_image,
        };
      }
    }

    if (error) {
      logger.error('Order fetch error:', error);
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
    }

    // 권한 확인 (구매자 또는 전문가만 조회 가능)
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // Supabase 관계 조회가 배열로 반환되는 경우 처리
    if (Array.isArray(order.buyer) && order.buyer.length > 0) {
      order.buyer = order.buyer[0];
    }
    if (Array.isArray(order.service) && order.service.length > 0) {
      order.service = order.service[0];
    }

    return NextResponse.json({ order });
  } catch (error) {
    logger.error('Order API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
