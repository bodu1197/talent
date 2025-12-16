import { NextRequest } from 'next/server';
import { getOrdersCountByRole } from '@/utils/orderCountApi';

// GET /api/orders/buyer/count - 구매자 주문 상태별 카운트
export async function GET(_request: NextRequest) {
  return getOrdersCountByRole('buyer');
}
