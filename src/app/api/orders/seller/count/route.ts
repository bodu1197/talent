import { NextRequest } from 'next/server';
import { getOrdersCountByRole } from '@/utils/orderCountApi';

// GET /api/orders/seller/count - 전문가 주문 상태별 카운트
export async function GET(_request: NextRequest) {
  return getOrdersCountByRole('seller');
}
