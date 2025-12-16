import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 소유권 확인 결과 타입
 */
export interface OwnershipResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: NextResponse;
}

/**
 * 포트폴리오 소유권 확인
 * 1. 포트폴리오 존재 여부 확인
 * 2. 포트폴리오의 seller가 현재 사용자의 seller인지 확인
 */
export async function verifyPortfolioOwnership(
  supabase: SupabaseClient,
  portfolioId: string,
  userId: string
): Promise<OwnershipResult> {
  // 포트폴리오 조회 및 seller_id 가져오기
  const { data: portfolio } = await supabase
    .from('seller_portfolio')
    .select('seller_id')
    .eq('id', portfolioId)
    .single();

  if (!portfolio) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Portfolio not found' }, { status: 404 }),
    };
  }

  // seller 소유권 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('id', portfolio.seller_id)
    .eq('user_id', userId)
    .single();

  if (!seller) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
    };
  }

  return {
    success: true,
    data: { portfolio, seller },
  };
}

/**
 * 서비스 소유권 확인
 * seller가 현재 사용자의 seller인지 확인
 */
export async function verifyServiceOwnership(
  supabase: SupabaseClient,
  serviceId: string,
  userId: string
): Promise<OwnershipResult> {
  const { data: service } = await supabase
    .from('services')
    .select('seller_id')
    .eq('id', serviceId)
    .single();

  if (!service) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Service not found' }, { status: 404 }),
    };
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('id', service.seller_id)
    .eq('user_id', userId)
    .single();

  if (!seller) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
    };
  }

  return {
    success: true,
    data: { service, seller },
  };
}

/**
 * 심부름 요청자 권한 확인
 * 현재 사용자가 심부름의 요청자인지 확인
 */
export async function verifyErrandRequester(
  supabase: SupabaseClient,
  errandId: string,
  profileId: string
): Promise<OwnershipResult> {
  const { data: errand } = await supabase
    .from('errands')
    .select('requester_id')
    .eq('id', errandId)
    .single();

  if (!errand) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Errand not found' }, { status: 404 }),
    };
  }

  if (errand.requester_id !== profileId) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
    };
  }

  return {
    success: true,
    data: { errand },
  };
}

/**
 * 주문 관련 권한 확인 (구매자 또는 판매자)
 */
export async function verifyOrderAccess(
  supabase: SupabaseClient,
  orderId: string,
  userId: string
): Promise<OwnershipResult> {
  const { data: order } = await supabase
    .from('orders')
    .select('buyer_id, seller_id')
    .eq('id', orderId)
    .single();

  if (!order) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Order not found' }, { status: 404 }),
    };
  }

  // 구매자 또는 판매자인지 확인
  if (order.buyer_id !== userId && order.seller_id !== userId) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
    };
  }

  return {
    success: true,
    data: { order },
  };
}

/**
 * 주문 구매자 권한 확인
 * 주문을 조회하고 현재 사용자가 구매자인지 확인
 */
export async function verifyOrderBuyer(
  supabase: SupabaseClient,
  orderId: string,
  userId: string
): Promise<OwnershipResult> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return {
      success: false,
      error: NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 }),
    };
  }

  // 구매자 확인
  if (order.buyer_id !== userId) {
    return {
      success: false,
      error: NextResponse.json({ error: '구매자만 결제 검증을 할 수 있습니다' }, { status: 403 }),
    };
  }

  return {
    success: true,
    data: { order },
  };
}
