import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET /api/orders/seller/count - 전문가 주문 상태별 카운트
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 단일 쿼리로 모든 주문 상태 가져오기 (5개 쿼리 → 1개 쿼리로 최적화)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status')
      .eq('seller_id', user.id);

    if (error) {
      logger.error('Orders count fetch error:', error);
      return NextResponse.json({ error: '주문 카운트를 불러올 수 없습니다' }, { status: 500 });
    }

    // JavaScript로 카운트 계산 (데이터베이스 쿼리보다 훨씬 빠름)
    const counts = {
      paid: 0,
      in_progress: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      all: orders?.length || 0,
    };

    if (orders) {
      for (const order of orders) {
        if (order.status === 'paid') counts.paid++;
        else if (order.status === 'in_progress') counts.in_progress++;
        else if (order.status === 'delivered') counts.delivered++;
        else if (order.status === 'completed') counts.completed++;
        else if (order.status === 'cancelled') counts.cancelled++;
      }
    }

    return NextResponse.json({ counts });
  } catch (error) {
    logger.error('Seller orders count API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
