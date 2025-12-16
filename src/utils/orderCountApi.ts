import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { countOrdersByStatus } from '@/utils/orderCountHelpers';

type UserRole = 'buyer' | 'seller';

/**
 * 주문 상태별 카운트 조회 공통 로직
 * @param role 사용자 역할 ('buyer' 또는 'seller')
 */
export async function getOrdersCountByRole(role: UserRole): Promise<NextResponse> {
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

    // 역할에 따라 필터 컬럼 선택
    const filterColumn = role === 'buyer' ? 'buyer_id' : 'seller_id';

    // 단일 쿼리로 모든 주문 상태 가져오기
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status')
      .eq(filterColumn, user.id);

    if (error) {
      logger.error('Orders count fetch error:', error);
      return NextResponse.json({ error: '주문 카운트를 불러올 수 없습니다' }, { status: 500 });
    }

    // JavaScript로 카운트 계산
    const counts = countOrdersByStatus(orders);

    return NextResponse.json({ counts });
  } catch (error) {
    logger.error(`${role.charAt(0).toUpperCase() + role.slice(1)} orders count API error:`, error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
