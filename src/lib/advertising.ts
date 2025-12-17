// 광고 시스템 핵심 로직 - Server Actions
'use server';

import { SupabaseManager } from '@/lib/supabase/singleton';
import { cryptoShuffleArray } from './utils/crypto-shuffle';
import { logger } from '@/lib/logger';

const LAUNCH_PROMO_AMOUNT = 600000; // 런칭 프로모션 60만원
const LAUNCH_PROMO_DURATION_MONTHS = 6;

// ===== 헬퍼 함수 =====

/**
 * Service Role 클라이언트 (RLS 우회)
 */
function getAdminClient() {
  return SupabaseManager.getServiceRoleClient();
}

/**
 * 현재 인증된 사용자 가져오기
 */
async function getCurrentUser() {
  const supabase = await SupabaseManager.getServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('인증이 필요합니다');
  }

  return user;
}

/**
 * UUID 검증
 */
function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * 금액 검증
 */
function validateAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0 && amount <= 10000000;
}

/**
 * 관리자 권한 확인
 */
async function requireAdmin(userId: string) {
  const supabase = getAdminClient();

  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', userId).single();

  if (!admin) {
    throw new Error('관리자 권한이 필요합니다');
  }

  return admin;
}

// ===== 크레딧 관리 =====

/**
 * 런칭 프로모션 크레딧 지급 (60만원, 6개월)
 * 관리자만 호출 가능
 */
export async function grantLaunchPromotion(sellerId: string) {
  // 인증 및 권한 검증
  const user = await getCurrentUser();
  await requireAdmin(user.id);

  // 입력 검증
  if (!validateUUID(sellerId)) {
    throw new Error('유효하지 않은 전문가 ID입니다');
  }

  const supabase = getAdminClient();

  // 이미 프로모션 받았는지 확인
  const { data: existing } = await supabase
    .from('advertising_credits')
    .select('id')
    .eq('seller_id', sellerId)
    .eq('promotion_type', 'launch_promo')
    .single();

  if (existing) {
    throw new Error('이미 런칭 프로모션을 받은 전문가입니다');
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + LAUNCH_PROMO_DURATION_MONTHS);

  // 크레딧 생성
  const { data: credit, error: creditError } = await supabase
    .from('advertising_credits')
    .insert({
      seller_id: sellerId,
      amount: LAUNCH_PROMO_AMOUNT,
      initial_amount: LAUNCH_PROMO_AMOUNT,
      promotion_type: 'launch_promo',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (creditError) throw creditError;

  // 거래 기록
  await supabase.from('credit_transactions').insert({
    credit_id: credit.id,
    seller_id: sellerId,
    transaction_type: 'earned',
    amount: LAUNCH_PROMO_AMOUNT,
    balance_after: LAUNCH_PROMO_AMOUNT,
    description: '런칭 프로모션 - 6개월 무료 광고 크레딧 (60만원)',
    reference_type: 'promotion',
  });

  return credit;
}

/**
 * 전문가의 총 크레딧 조회
 */
export async function getTotalCredits(sellerId: string): Promise<number> {
  // 입력 검증
  if (!validateUUID(sellerId)) {
    throw new Error('유효하지 않은 전문가 ID입니다');
  }

  const supabase = getAdminClient();

  const { data: credits } = await supabase
    .from('advertising_credits')
    .select('amount')
    .eq('seller_id', sellerId)
    .gt('amount', 0)
    .or('expires_at.is.null,expires_at.gt.now()');

  return credits?.reduce((sum, c) => sum + c.amount, 0) || 0;
}

/**
 * 크레딧으로 결제
 */
export async function payWithCredit(
  sellerId: string,
  subscriptionId: string,
  amount: number
): Promise<{ success: boolean; remaining: number }> {
  // 입력 검증
  if (!validateUUID(sellerId)) throw new Error('유효하지 않은 전문가 ID');
  if (!validateUUID(subscriptionId)) throw new Error('유효하지 않은 구독 ID');
  if (!validateAmount(amount)) throw new Error('유효하지 않은 금액');

  const supabase = getAdminClient();

  // 사용 가능한 크레딧 조회 (만료일 가까운 것부터)
  const { data: credits } = await supabase
    .from('advertising_credits')
    .select('*')
    .eq('seller_id', sellerId)
    .gt('amount', 0)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('expires_at', { ascending: true, nullsFirst: false });

  if (!credits || credits.length === 0) {
    return { success: false, remaining: amount };
  }

  let remaining = amount;

  for (const credit of credits) {
    if (remaining <= 0) break;

    const useAmount = Math.min(credit.amount, remaining);

    // 크레딧 차감
    await supabase
      .from('advertising_credits')
      .update({
        amount: credit.amount - useAmount,
        used_amount: credit.used_amount + useAmount,
      })
      .eq('id', credit.id);

    // 거래 기록
    await supabase.from('credit_transactions').insert({
      credit_id: credit.id,
      seller_id: sellerId,
      transaction_type: 'spent',
      amount: -useAmount,
      balance_after: credit.amount - useAmount,
      description: '광고 구독 월 결제 (10만원)',
      reference_type: 'subscription',
      reference_id: subscriptionId,
    });

    remaining -= useAmount;
  }

  return { success: remaining === 0, remaining };
}

// ===== 구독 관리 =====

/**
 * 광고 구독 시작
 * @param userId - 사용자 ID (users.id, advertising 테이블의 seller_id로 사용됨)
 */
export async function startAdvertisingSubscription(
  userId: string,
  serviceId: string,
  paymentMethod: 'card' | 'bank_transfer',
  months: number,
  supplyAmount: number // 공급가액 (VAT 별도)
) {
  // 인증 검증
  const user = await getCurrentUser();

  // 입력 검증
  if (!validateUUID(userId)) throw new Error('유효하지 않은 사용자 ID');
  if (!validateUUID(serviceId)) throw new Error('유효하지 않은 서비스 ID');
  if (!Number.isInteger(months) || months < 1 || months > 12) {
    throw new Error('계약 기간은 1~12개월만 가능합니다');
  }
  if (!validateAmount(supplyAmount)) throw new Error('유효하지 않은 금액');

  // 본인 확인
  if (userId !== user.id) {
    throw new Error('본인의 서비스만 광고 등록할 수 있습니다');
  }

  const supabase = getAdminClient();

  // sellers 테이블에서 seller.id 조회
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!seller) {
    throw new Error('전문가 정보를 찾을 수 없습니다');
  }

  // 서비스 소유권 확인 (services.seller_id는 sellers.id를 참조)
  const { data: service } = await supabase
    .from('services')
    .select('seller_id')
    .eq('id', serviceId)
    .single();

  if (!service || service.seller_id !== seller.id) {
    throw new Error('본인의 서비스만 광고 등록할 수 있습니다');
  }

  // 이미 활성 광고가 있는지 확인 (seller.id 사용)
  const { data: existingAd } = await supabase
    .from('advertising_subscriptions')
    .select('id, status')
    .eq('seller_id', seller.id)
    .eq('service_id', serviceId)
    .in('status', ['active', 'pending_payment'])
    .maybeSingle();

  if (existingAd) {
    if (existingAd.status === 'pending_payment') {
      throw new Error('이미 결제 대기 중인 광고가 있습니다');
    }
    throw new Error('이미 광고가 진행 중인 서비스입니다');
  }

  // VAT 계산 (10%)
  const taxAmount = Math.round(supplyAmount * 0.1);
  const totalAmount = supplyAmount + taxAmount;

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + months);

  const monthlyPrice = Math.round(supplyAmount / months);

  // 구독 생성 (seller.id 사용 - FK 제약조건)
  const { data: subscription, error: subError } = await supabase
    .from('advertising_subscriptions')
    .insert({
      seller_id: seller.id, // sellers.id를 사용 (FK 제약조건)
      service_id: serviceId,
      monthly_price: monthlyPrice,
      payment_method: paymentMethod,
      next_billing_date: nextBillingDate.toISOString().split('T')[0],
      status: paymentMethod === 'bank_transfer' ? 'pending_payment' : 'active',
    })
    .select()
    .single();

  if (subError) throw subError;

  // 무통장 입금 처리
  if (paymentMethod === 'bank_transfer') {
    const payment = await requestBankTransferPayment(
      subscription.id,
      seller.id,
      supplyAmount,
      taxAmount,
      totalAmount,
      months
    );
    return { subscription, payment };
  }

  return { subscription, payment: null };
}

/**
 * 구독 취소
 */
export async function cancelSubscription(subscriptionId: string) {
  // 인증 검증
  const user = await getCurrentUser();

  // 입력 검증
  if (!validateUUID(subscriptionId)) {
    throw new Error('유효하지 않은 구독 ID');
  }

  const supabase = getAdminClient();

  // 구독 소유권 확인 - seller_id로 sellers 테이블 조회
  const { data: subscription } = await supabase
    .from('advertising_subscriptions')
    .select('seller_id')
    .eq('id', subscriptionId)
    .single();

  if (!subscription) {
    throw new Error('구독 정보를 찾을 수 없습니다');
  }

  // sellers 테이블에서 user_id 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('user_id')
    .eq('id', subscription.seller_id)
    .single();

  if (!seller || seller.user_id !== user.id) {
    throw new Error('본인의 구독만 취소할 수 있습니다');
  }

  return await supabase
    .from('advertising_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);
}

// ===== 무통장 입금 =====

/**
 * 무통장 입금 요청
 * @param sellerId - 전문가 ID (sellers.id)
 */
export async function requestBankTransferPayment(
  subscriptionId: string,
  sellerId: string,
  supplyAmount: number,
  taxAmount: number,
  totalAmount: number,
  months: number = 1
) {
  // 입력 검증
  if (!validateUUID(subscriptionId)) throw new Error('유효하지 않은 구독 ID');
  if (!validateUUID(sellerId)) throw new Error('유효하지 않은 전문가 ID');
  if (!validateAmount(totalAmount)) throw new Error('유효하지 않은 금액');

  const supabase = getAdminClient();

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3); // 3일 내 입금

  // sellers 테이블에서 user_id 조회
  const { data: seller } = await supabase
    .from('sellers')
    .select('user_id')
    .eq('id', sellerId)
    .single();

  if (!seller) throw new Error('전문가 정보를 찾을 수 없습니다');

  // 결제 내역 생성 (sellers.id 사용)
  const { data: payment } = await supabase
    .from('advertising_payments')
    .insert({
      subscription_id: subscriptionId,
      seller_id: sellerId, // sellers.id를 사용 (FK 제약조건)
      amount: totalAmount,
      supply_amount: supplyAmount,
      tax_amount: taxAmount,
      payment_method: 'bank_transfer',
      status: 'pending',
    })
    .select()
    .single();

  // 구독 상태 업데이트
  await supabase
    .from('advertising_subscriptions')
    .update({
      status: 'pending_payment',
      bank_transfer_deadline: deadline.toISOString(),
    })
    .eq('id', subscriptionId);

  // 전문가에게 입금 안내 알림 (users.id 사용)
  await supabase.from('notifications').insert({
    user_id: seller.user_id, // users.id 사용
    type: 'payment_bank_transfer',
    title: '광고 구독 결제 - 무통장 입금 안내',
    content: `
입금 금액 (VAT 포함): ${totalAmount.toLocaleString()}원 (${months}개월)
- 공급가액: ${supplyAmount.toLocaleString()}원
- 부가세(10%): ${taxAmount.toLocaleString()}원
입금 계좌: ${process.env.NEXT_PUBLIC_BANK_NAME} ${process.env.NEXT_PUBLIC_BANK_ACCOUNT}
예금주: ${process.env.NEXT_PUBLIC_BANK_HOLDER}
입금 기한: ${deadline.toLocaleString()}

입금자명: [이름-${payment!.id.slice(0, 8)}]
※ 입금 확인 후 세금계산서가 자동 발행됩니다.
    `.trim(),
    link_url: `/mypage/seller/advertising/payments/${payment!.id}`,
  });

  return payment;
}

/**
 * 관리자: 입금 확인
 */
export async function confirmBankTransferPayment(
  paymentId: string,
  adminId: string,
  memo?: string
) {
  // 인증 및 권한 검증
  const user = await getCurrentUser();
  await requireAdmin(user.id);

  // 입력 검증
  if (!validateUUID(paymentId)) {
    throw new Error('유효하지 않은 결제 ID');
  }

  const supabase = getAdminClient();
  const now = new Date().toISOString();

  // 결제 정보 조회
  const { data: payment } = await supabase
    .from('advertising_payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment) throw new Error('결제 정보를 찾을 수 없습니다');

  // 결제 확인 처리
  await supabase
    .from('advertising_payments')
    .update({
      status: 'completed',
      paid_at: now,
      confirmed_at: now,
      confirmed_by: adminId,
      admin_memo: memo,
    })
    .eq('id', paymentId);

  // 구독 활성화
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  await supabase
    .from('advertising_subscriptions')
    .update({
      status: 'active',
      last_billed_at: now,
      next_billing_date: nextBilling.toISOString().split('T')[0],
      bank_transfer_confirmed: true,
      bank_transfer_confirmed_at: now,
      bank_transfer_confirmed_by: adminId,
    })
    .eq('id', payment.subscription_id);

  // 세금계산서 자동 발행
  await issueTaxInvoice(payment.id, adminId);

  // 전문가의 user_id 조회
  const { data: sellerForNotification } = await supabase
    .from('sellers')
    .select('user_id')
    .eq('id', payment.seller_id)
    .single();

  // 전문가에게 확인 완료 알림
  if (sellerForNotification) {
    await supabase.from('notifications').insert({
      user_id: sellerForNotification.user_id,
      type: 'payment_confirmed',
      title: '광고 결제 확인 완료',
      content: `${payment.amount.toLocaleString()}원 입금이 확인되었습니다. 광고가 활성화되었으며 세금계산서가 발행되었습니다.`,
      link_url: '/mypage/seller/tax-invoices',
    });
  }

  return payment;
}

/**
 * 세금계산서 발행
 */
export async function issueTaxInvoice(paymentId: string, _issuedBy: string) {
  const supabase = getAdminClient();

  // 결제 정보 조회
  const { data: payment } = await supabase
    .from('advertising_payments')
    .select(
      `
      *,
      subscription:advertising_subscriptions(
        id,
        service:services(title)
      )
    `
    )
    .eq('id', paymentId)
    .single();

  if (!payment) throw new Error('결제 정보를 찾을 수 없습니다');

  // 공급자 정보 조회 (우리 회사)
  const { data: companyInfo } = await supabase
    .from('company_info')
    .select('*')
    .eq('is_active', true)
    .single();

  if (!companyInfo) throw new Error('회사 정보가 설정되지 않았습니다');

  // 공급받는자 정보 조회 (전문가) - payment.seller_id는 sellers.id
  const { data: buyerInfo } = await supabase
    .from('sellers')
    .select(
      'business_number, business_name, ceo_name, business_address, business_type, business_item, business_email'
    )
    .eq('id', payment.seller_id)
    .single();

  if (!buyerInfo?.business_number) {
    throw new Error('전문가 사업자 정보가 등록되지 않았습니다');
  }

  // 승인번호 생성 (YYYYMMDD-시퀀스)
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replaceAll('-', '');

  const { data: existingInvoices } = await supabase
    .from('tax_invoices')
    .select('invoice_number')
    .like('invoice_number', `${dateStr}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1);

  let sequence: number;
  if (existingInvoices && existingInvoices.length > 0) {
    const lastNumber = existingInvoices[0].invoice_number.split('-')[1];
    sequence = Number.parseInt(lastNumber) + 1;
  } else {
    sequence = 1;
  }

  const invoiceNumber = `${dateStr}-${sequence.toString().padStart(4, '0')}`;

  // 서비스명 가져오기
  const serviceName = payment.subscription?.service?.title || '광고 서비스';

  // 세금계산서 생성
  const { data: taxInvoice, error } = await supabase
    .from('tax_invoices')
    .insert({
      invoice_number: invoiceNumber,
      payment_id: paymentId,
      subscription_id: payment.subscription_id,
      issue_date: today.toISOString().split('T')[0],
      issue_type: 'regular',
      status: 'issued',

      // 공급자 정보
      supplier_business_number: companyInfo.business_number,
      supplier_company_name: companyInfo.company_name,
      supplier_ceo_name: companyInfo.ceo_name,
      supplier_address: companyInfo.address,
      supplier_business_type: companyInfo.business_type,
      supplier_business_item: companyInfo.business_item,

      // 공급받는자 정보
      buyer_business_number: buyerInfo.business_number,
      buyer_company_name: buyerInfo.business_name ?? '',
      buyer_ceo_name: buyerInfo.ceo_name ?? '',
      buyer_address: buyerInfo.business_address ?? '',
      buyer_business_type: buyerInfo.business_type,
      buyer_business_item: buyerInfo.business_item,
      buyer_email: buyerInfo.business_email,

      // 금액 정보
      supply_amount: payment.supply_amount,
      tax_amount: payment.tax_amount,
      total_amount: payment.amount,

      // 품목 정보
      item_name: `${serviceName} 광고`,
      item_spec: `광고 서비스`,
      item_quantity: 1,
      item_unit_price: payment.supply_amount,

      remarks: `승인번호: ${invoiceNumber}`,
    })
    .select()
    .single();

  if (error) throw error;

  // 결제 테이블에 세금계산서 ID 연결
  await supabase
    .from('advertising_payments')
    .update({ tax_invoice_id: taxInvoice.id })
    .eq('id', paymentId);

  return taxInvoice;
}

// ===== 완전 공평 랜덤 노출 알고리즘 =====

/**
 * Fisher-Yates Shuffle (완벽한 랜덤)
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  return cryptoShuffleArray(shuffled);
}

/**
 * 카테고리 페이지 서비스 조회 (광고 + 일반 혼합, 완전 랜덤)
 */
export async function getServicesForCategoryPage(
  categoryId: string,
  page: number = 1,
  pageSize: number = 12
) {
  // 입력 검증
  if (!validateUUID(categoryId)) {
    throw new Error('유효하지 않은 카테고리 ID');
  }

  if (!Number.isInteger(page) || page < 1) {
    throw new Error('유효하지 않은 페이지 번호');
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error('유효하지 않은 페이지 크기');
  }

  const supabase = getAdminClient();

  // 1. 해당 카테고리의 모든 활성 서비스 조회
  const { data: allServices } = await supabase
    .from('services')
    .select(
      `
      *,
      seller:users!services_seller_id_fkey(id, name),
      active_subscription:advertising_subscriptions!left(
        id,
        status,
        expires_at
      ),
      service_categories!inner(category_id)
    `
    )
    .eq('service_categories.category_id', categoryId)
    .eq('status', 'active')
    .is('deleted_at', null);

  if (!allServices) return { services: [], total: 0, page, pageSize, totalPages: 0 };

  // 2. 활성 광고 구분
  const servicesWithAdStatus = allServices.map((service) => ({
    ...service,
    is_advertised: !!(
      service.active_subscription?.status === 'active' &&
      new Date(service.active_subscription.expires_at) > new Date()
    ),
  }));

  // 3. 완전 랜덤 섞기 (Fisher-Yates Shuffle)
  const shuffled = fisherYatesShuffle(servicesWithAdStatus);

  // 4. 페이징 처리
  const start = (page - 1) * pageSize;
  const pageServices = shuffled.slice(start, start + pageSize);

  // 5. 광고 노출 기록 (비동기)
  const advertisedServices = pageServices.filter((s) => s.is_advertised);
  for (let index = 0; index < advertisedServices.length; index++) {
    const service = advertisedServices[index];
    recordImpression(
      service.active_subscription.id,
      service.id,
      categoryId,
      start + index + 1,
      page
    ).catch((err) => logger.error('Operation error:', err));
  }

  return {
    services: pageServices,
    total: shuffled.length,
    page,
    pageSize,
    totalPages: Math.ceil(shuffled.length / pageSize),
  };
}

/**
 * 노출 기록
 */
async function recordImpression(
  subscriptionId: string,
  serviceId: string,
  categoryId: string,
  position: number,
  page: number
) {
  const supabase = getAdminClient();

  await supabase.from('advertising_impressions').insert({
    subscription_id: subscriptionId,
    service_id: serviceId,
    category_id: categoryId,
    position,
    page_number: page,
  });

  // 구독 통계 업데이트
  const { data: sub } = await supabase
    .from('advertising_subscriptions')
    .select('total_impressions')
    .eq('id', subscriptionId)
    .single();

  if (sub) {
    await supabase
      .from('advertising_subscriptions')
      .update({ total_impressions: sub.total_impressions + 1 })
      .eq('id', subscriptionId);
  }
}

/**
 * 클릭 기록
 */
export async function recordClick(impressionId: string) {
  // 입력 검증
  if (!validateUUID(impressionId)) {
    throw new Error('유효하지 않은 노출 ID');
  }

  const supabase = getAdminClient();
  const now = new Date().toISOString();

  // 노출 기록 업데이트
  const { data: impression } = await supabase
    .from('advertising_impressions')
    .update({
      clicked: true,
      clicked_at: now,
    })
    .eq('id', impressionId)
    .select()
    .single();

  if (impression) {
    // 구독 통계 업데이트
    const { data: sub } = await supabase
      .from('advertising_subscriptions')
      .select('total_clicks')
      .eq('id', impression.subscription_id)
      .single();

    if (sub) {
      await supabase
        .from('advertising_subscriptions')
        .update({ total_clicks: sub.total_clicks + 1 })
        .eq('id', impression.subscription_id);
    }
  }

  return impression;
}
