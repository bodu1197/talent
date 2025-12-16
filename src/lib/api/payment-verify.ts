import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { requireAuthWithRateLimit } from '@/lib/api/auth';
import { validateUUID } from '@/lib/api/validation';
import { verifyOrderBuyer } from '@/lib/api/ownership';
import { paymentVerifyRateLimit } from '@/lib/rate-limit';

type SupabaseClientType = SupabaseClient<Database>;

export interface PaymentVerifyAuthResult {
  success: true;
  user: { id: string };
  supabase: SupabaseClientType;
  body: { payment_id: string; order_id: string; payment_request_id?: string };
}

export interface PaymentVerifyErrorResult {
  success: false;
  error: NextResponse | Response;
}

export type PaymentVerifyResult = PaymentVerifyAuthResult | PaymentVerifyErrorResult;

/**
 * 결제 검증 API의 인증 및 기본 검증 로직
 */
export async function verifyPaymentAuth(request: NextRequest): Promise<PaymentVerifyResult> {
  // 사용자 인증 및 Rate Limiting 확인
  const authResult = await requireAuthWithRateLimit(paymentVerifyRateLimit);
  if (!authResult.success) {
    return { success: false, error: authResult.error! };
  }

  const { user, supabase } = authResult;
  if (!user || !supabase) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }),
    };
  }

  const body = await request.json();
  const { payment_id, order_id, payment_request_id } = body;

  // 입력 검증
  if (!payment_id || !order_id) {
    return {
      success: false,
      error: NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 }),
    };
  }

  // UUID 형식 검증
  const uuidError = validateUUID(order_id, '주문 ID');
  if (uuidError) {
    return { success: false, error: uuidError };
  }

  return {
    success: true,
    user,
    supabase,
    body: { payment_id, order_id, payment_request_id },
  };
}

export interface OrderVerificationResult {
  success: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
}

export interface OrderVerificationErrorResult {
  success: false;
  error: NextResponse | Response;
}

export type OrderVerificationResultType = OrderVerificationResult | OrderVerificationErrorResult;

/**
 * 주문 조회 및 결제 상태 검증
 */
export async function verifyOrderForPayment(
  supabase: SupabaseClientType,
  order_id: string,
  user_id: string
): Promise<OrderVerificationResultType> {
  // 주문 정보 조회 및 구매자 확인
  const orderResult = await verifyOrderBuyer(supabase, order_id, user_id);
  if (!orderResult.success) {
    return { success: false, error: orderResult.error! };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = orderResult.data!.order as any;

  // 이미 결제된 주문인지 확인
  if (order.status === 'paid' || order.status === 'in_progress') {
    return {
      success: false,
      error: NextResponse.json({ error: '이미 결제된 주문입니다' }, { status: 400 }),
    };
  }

  return { success: true, order };
}
