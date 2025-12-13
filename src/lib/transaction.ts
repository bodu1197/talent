/**
 * 트랜잭션 처리 유틸리티
 * Race Condition 방지 및 Idempotency 보장
 */

import { createClient } from '@/lib/supabase/server';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import type { Tables } from '@/types/database';

/**
 * Idempotency Key를 사용한 중복 주문 방지
 * 같은 키로 여러 번 요청해도 하나의 주문만 생성됨
 */
export async function createOrderWithIdempotency(
  supabase: SupabaseClient,
  orderData: {
    buyer_id: string;
    seller_id: string;
    service_id: string;
    amount: number;
    [key: string]: unknown;
  },
  idempotencyKey: string
): Promise<{ data: Tables<'orders'> | null; error: PostgrestError | null; isExisting: boolean }> {
  // 1. Idempotency Key로 기존 주문 확인
  const { data: existingOrder, error: checkError } = await supabase
    .from('orders')
    .select('*')
    .eq('merchant_uid', idempotencyKey)
    .maybeSingle();

  if (checkError) {
    return { data: null, error: checkError, isExisting: false };
  }

  // 2. 이미 존재하는 주문이면 그대로 반환 (멱등성 보장)
  if (existingOrder) {
    return { data: existingOrder, error: null, isExisting: true };
  }

  // 3. 새 주문 생성
  const { data: newOrder, error: createError } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      merchant_uid: idempotencyKey,
    })
    .select()
    .single();

  if (createError) {
    // merchant_uid unique constraint 위반 시 (동시 요청)
    if (createError.code === '23505' && createError.message.includes('merchant_uid')) {
      // 동시 생성 시도로 constraint 위반 → 기존 주문 조회
      const { data: existingOrder2 } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_uid', idempotencyKey)
        .single();

      return { data: existingOrder2, error: null, isExisting: true };
    }

    return { data: null, error: createError, isExisting: false };
  }

  return { data: newOrder, error: null, isExisting: false };
}

/**
 * 결제 기록 생성 (중복 방지)
 */
export async function createPaymentWithIdempotency(
  supabase: SupabaseClient,
  paymentData: {
    order_id: string;
    amount: number;
    payment_method: string;
    payment_id: string;
    [key: string]: unknown;
  }
): Promise<{ data: Tables<'payments'> | null; error: PostgrestError | null; isExisting: boolean }> {
  // 1. payment_id로 기존 결제 확인
  const { data: existingPayment, error: checkError } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_id', paymentData.payment_id)
    .maybeSingle();

  if (checkError) {
    return { data: null, error: checkError, isExisting: false };
  }

  // 2. 이미 존재하는 결제면 그대로 반환
  if (existingPayment) {
    return { data: existingPayment, error: null, isExisting: true };
  }

  // 3. 새 결제 생성
  const { data: newPayment, error: createError } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single();

  if (createError) {
    // payment_id unique constraint 위반 시
    if (createError.code === '23505' && createError.message.includes('payment_id')) {
      const { data: existingPayment2 } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_id', paymentData.payment_id)
        .single();

      return { data: existingPayment2, error: null, isExisting: true };
    }

    return { data: null, error: createError, isExisting: false };
  }

  return { data: newPayment, error: null, isExisting: false };
}

/**
 * Optimistic Locking을 사용한 상태 업데이트
 * updated_at 필드를 version으로 사용
 */
export async function updateOrderStatusWithLocking(
  supabase: SupabaseClient,
  orderId: string,
  newStatus: string,
  expectedUpdatedAt: string
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  const now = new Date().toISOString();

  // updated_at이 예상값과 일치하는 경우에만 업데이트 (Optimistic Lock)
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: newStatus,
      updated_at: now,
    })
    .eq('id', orderId)
    .eq('updated_at', expectedUpdatedAt) // Lock 조건
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows updated - Optimistic Lock 실패
      return {
        success: false,
        error: '주문 상태가 이미 다른 사용자에 의해 변경되었습니다. 새로고침 후 다시 시도해주세요.',
      };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * 광고 크레딧 차감 (Race Condition 방지)
 * PostgreSQL의 Row Lock 사용
 */
export async function deductCreditWithLocking(
  creditId: string,
  amount: number
): Promise<{ success: boolean; remaining: number; error?: string }> {
  const supabase = await createClient();

  // RPC 함수 호출 (PostgreSQL 트랜잭션 + FOR UPDATE)
  const { data, error } = await supabase.rpc('deduct_credit_safe', {
    p_credit_id: creditId,
    p_amount: amount,
  });

  if (error) {
    logger.error('Credit deduction failed', error);
    return { success: false, remaining: 0, error: error.message };
  }

  return {
    success: data.success,
    remaining: data.remaining,
    error: data.error || undefined,
  };
}
