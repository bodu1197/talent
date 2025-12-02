// 광고 시스템 자동 처리 작업 (Cron Jobs)
'use server';

import { SupabaseManager } from '@/lib/supabase/singleton';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Cron 작업용 Service Role 클라이언트 가져오기
 * RLS를 우회하여 시스템 작업 수행
 */
function getAdminClient(): SupabaseClient {
  return SupabaseManager.getServiceRoleClient();
}

/**
 * 크레딧으로 결제 처리 (Cron 전용)
 * advertising.ts의 payWithCredit과 동일하지만 Service Role 사용
 */
async function payWithCreditInternal(
  sellerId: string,
  subscriptionId: string,
  amount: number
): Promise<{ success: boolean; remaining: number }> {
  const supabase = getAdminClient();

  // 현재 크레딧 조회
  const { data: credit, error: creditError } = await supabase
    .from('advertising_credits')
    .select('*')
    .eq('seller_id', sellerId)
    .single();

  if (creditError || !credit) {
    return { success: false, remaining: amount };
  }

  // 만료되지 않은 크레딧만 사용
  const now = new Date();
  const totalAvailable = credit.expires_at && new Date(credit.expires_at) < now ? 0 : credit.amount;

  if (totalAvailable < amount) {
    return { success: false, remaining: amount - totalAvailable };
  }

  // 크레딧 차감
  const { error: updateError } = await supabase
    .from('advertising_credits')
    .update({
      amount: totalAvailable - amount,
      used_amount: credit.used_amount + amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', credit.id);

  if (updateError) {
    logger.error('[Cron] 크레딧 차감 실패', updateError);
    return { success: false, remaining: amount };
  }

  // 거래 기록
  await supabase.from('credit_transactions').insert({
    credit_id: credit.id,
    seller_id: sellerId,
    transaction_type: 'charge',
    amount: -amount,
    balance_after: totalAvailable - amount,
    description: '월간 광고료 결제',
    reference_type: 'subscription',
    reference_id: subscriptionId,
  });

  return { success: true, remaining: 0 };
}

/**
 * 월간 자동 결제 처리 (매일 자정 실행)
 */
export async function processMonthlyBilling() {
  const supabase = getAdminClient();
  const today = new Date().toISOString().split('T')[0];

  logger.info('[Cron] 월간 결제 처리 시작', { today });

  // 오늘 결제일인 구독 조회
  const { data: subscriptions, error } = await supabase
    .from('advertising_subscriptions')
    .select('*')
    .eq('status', 'active')
    .eq('next_billing_date', today);

  if (error) {
    logger.error('[Cron] 구독 조회 실패', error);
    return;
  }

  logger.info('[Cron] 처리할 구독', { count: subscriptions?.length || 0 });

  for (const sub of subscriptions || []) {
    try {
      logger.info('[Cron] 구독 처리 중', { subscriptionId: sub.id });

      // 크레딧으로 결제 시도
      const { success, remaining } = await payWithCreditInternal(
        sub.seller_id,
        sub.id,
        sub.monthly_price
      );

      if (success) {
        logger.info('[Cron] 크레딧 결제 성공', { subscriptionId: sub.id });

        // 다음 결제일 업데이트
        const nextBilling = new Date(sub.next_billing_date);
        nextBilling.setMonth(nextBilling.getMonth() + 1);

        await supabase
          .from('advertising_subscriptions')
          .update({
            last_billed_at: new Date().toISOString(),
            next_billing_date: nextBilling.toISOString().split('T')[0],
          })
          .eq('id', sub.id);

        // 결제 기록
        await supabase.from('advertising_payments').insert({
          subscription_id: sub.id,
          seller_id: sub.seller_id,
          amount: sub.monthly_price,
          payment_method: 'credit',
          status: 'completed',
          paid_at: new Date().toISOString(),
        });
      } else {
        logger.warn('[Cron] 크레딧 부족', { subscriptionId: sub.id, remaining });

        // 크레딧 부족 - 구독 일시정지
        await supabase
          .from('advertising_subscriptions')
          .update({ status: 'pending_payment' })
          .eq('id', sub.id);

        // 전문가에게 알림
        await supabase.from('notifications').insert({
          user_id: sub.seller_id,
          type: 'payment_failed',
          title: '광고 결제 실패',
          content: `크레딧 잔액이 부족하여 광고가 일시 중지되었습니다. ${remaining.toLocaleString()}원이 추가로 필요합니다.`,
          link_url: '/mypage/seller/advertising',
        });
      }
    } catch (error) {
      logger.error('[Cron] 구독 처리 실패', error, { subscriptionId: sub.id });
    }
  }

  logger.info('[Cron] 월간 결제 처리 완료');
}

/**
 * 입금 기한 초과 결제 취소 (매시간 실행)
 */
export async function cancelExpiredBankTransfers() {
  const supabase = getAdminClient();
  const now = new Date().toISOString();

  logger.info('[Cron] 만료된 무통장 입금 처리 시작', { now });

  // 기한 초과된 미입금 결제 조회
  const { data: expiredPayments, error } = await supabase
    .from('advertising_payments')
    .select(
      `
      *,
      subscription:advertising_subscriptions!inner(
        bank_transfer_deadline
      )
    `
    )
    .eq('payment_method', 'bank_transfer')
    .eq('status', 'pending')
    .lt('subscription.bank_transfer_deadline', now);

  if (error) {
    logger.error('[Cron] 만료 결제 조회 실패', error);
    return;
  }

  logger.info('[Cron] 만료된 결제', { count: expiredPayments?.length || 0 });

  for (const payment of expiredPayments || []) {
    try {
      logger.info('[Cron] 결제 취소 중', { paymentId: payment.id });

      // 결제 취소
      await supabase
        .from('advertising_payments')
        .update({ status: 'cancelled' })
        .eq('id', payment.id);

      // 구독 만료
      await supabase
        .from('advertising_subscriptions')
        .update({
          status: 'expired',
          expires_at: now,
        })
        .eq('id', payment.subscription_id);

      // 전문가에게 알림
      await supabase.from('notifications').insert({
        user_id: payment.seller_id,
        type: 'payment_expired',
        title: '광고 결제 기한 만료',
        content: '입금 기한이 지나 광고가 중지되었습니다. 다시 신청해주세요.',
        link_url: '/mypage/seller/advertising',
      });
    } catch (error) {
      logger.error('[Cron] 결제 취소 실패', error, { paymentId: payment.id });
    }
  }

  logger.info('[Cron] 만료된 무통장 입금 처리 완료');
}

/**
 * 크레딧 만료 처리 (매일 자정 실행)
 */
export async function expireCredits() {
  const supabase = getAdminClient();
  const now = new Date().toISOString();

  logger.info('[Cron] 크레딧 만료 처리 시작', { now });

  // 만료된 크레딧 조회
  const { data: expiredCredits, error } = await supabase
    .from('advertising_credits')
    .select('*')
    .gt('amount', 0)
    .lt('expires_at', now);

  if (error) {
    logger.error('[Cron] 만료 크레딧 조회 실패', error);
    return;
  }

  logger.info('[Cron] 만료된 크레딧', { count: expiredCredits?.length || 0 });

  for (const credit of expiredCredits || []) {
    try {
      logger.info('[Cron] 크레딧 만료 처리', { creditId: credit.id, amount: credit.amount });

      const expiredAmount = credit.amount;

      // 크레딧 차감
      await supabase
        .from('advertising_credits')
        .update({
          amount: 0,
          used_amount: credit.used_amount + expiredAmount,
        })
        .eq('id', credit.id);

      // 거래 기록
      await supabase.from('credit_transactions').insert({
        credit_id: credit.id,
        seller_id: credit.seller_id,
        transaction_type: 'expired',
        amount: -expiredAmount,
        balance_after: 0,
        description: '프로모션 크레딧 만료',
        reference_type: 'promotion',
      });

      // 전문가에게 알림
      await supabase.from('notifications').insert({
        user_id: credit.seller_id,
        type: 'credit_expired',
        title: '광고 크레딧 만료',
        content: `프로모션 크레딧 ${expiredAmount.toLocaleString()}원이 만료되었습니다.`,
        link_url: '/mypage/seller/advertising',
      });
    } catch (error) {
      logger.error('[Cron] 크레딧 만료 처리 실패', error, { creditId: credit.id });
    }
  }

  logger.info('[Cron] 크레딧 만료 처리 완료');
}

/**
 * 모든 Cron 작업 실행 (테스트용)
 */
export async function runAllCronJobs() {
  logger.info('[Cron] 모든 작업 시작');

  await processMonthlyBilling();
  await cancelExpiredBankTransfers();
  await expireCredits();

  logger.info('[Cron] 모든 작업 완료');
}
