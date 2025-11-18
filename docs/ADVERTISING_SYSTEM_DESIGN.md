# 광고 시스템 설계 문서

## 📋 시스템 개요

완벽하게 공평한 랜덤 노출을 보장하는 단순 광고 시스템

## 💰 가격 정책

### 단일 광고 플랜
- **가격**: 월 100,000원
- **혜택**: 카테고리 1페이지 완전 랜덤 노출
- **노출 확률**: 모든 광고가 동일 (100% 공평)
- **배지**: 없음 (일반 서비스와 구분 없이 자연스럽게 노출)

### 💳 결제 방법
1. **광고 크레딧 사용** (우선 차감)
2. **무통장 입금** (계좌 이체)
3. **카드 자동 결제** (등록 시)

### 🎁 런칭 프로모션
- **기간**: 홈페이지 배포 후 6개월
- **혜택**: 모든 판매자에게 600,000원 광고 크레딧 무료 지급
- **사용**: 기본 광고 6개월 무료 사용 가능

## 🎯 완전 공평 랜덤 노출 알고리즘

### 핵심 원칙
1. **완벽한 랜덤성**: Fisher-Yates Shuffle 알고리즘 사용
2. **100% 공평**: 모든 광고 서비스가 완전히 동등한 확률
3. **가중치 없음**: 추가 비용 없이 모두에게 공평한 기회
4. **자연스러움**: 광고임을 표시하지 않아 사용자 경험 최적화

### 노출 방식

#### 1페이지 구조
```
┌─────────────────────────────────────┐
│  광고 서비스 + 일반 서비스 혼합      │
│  (완전 랜덤 섞임 - 구분 불가)        │
│                                     │
│  1. 서비스 A (광고)                 │
│  2. 서비스 B (일반)                 │
│  3. 서비스 C (광고)                 │
│  4. 서비스 D (광고)                 │
│  5. 서비스 E (일반)                 │
│  ...                                │
│  (12-15개 노출)                     │
└─────────────────────────────────────┘
```

## 📊 데이터베이스 스키마

### 1. advertising_credits (광고 크레딧)
```sql
CREATE TABLE advertising_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id),

  -- 잔액 정보
  amount INTEGER NOT NULL DEFAULT 0, -- 현재 잔액 (원)
  initial_amount INTEGER NOT NULL DEFAULT 0, -- 초기 지급액
  used_amount INTEGER NOT NULL DEFAULT 0, -- 사용한 금액

  -- 프로모션 정보
  promotion_type TEXT, -- 'launch_promo', 'referral', null
  expires_at TIMESTAMP WITH TIME ZONE, -- 만료일 (프로모션용)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_advertising_credits_seller_id ON advertising_credits(seller_id);
CREATE INDEX idx_advertising_credits_expires_at ON advertising_credits(expires_at);
```

### 2. advertising_subscriptions (광고 구독)
```sql
CREATE TABLE advertising_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id),
  service_id UUID NOT NULL REFERENCES services(id),

  -- 구독 정보 (단일 플랜)
  monthly_price INTEGER NOT NULL DEFAULT 100000, -- 월 10만원 고정
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'pending_payment', 'cancelled', 'expired'

  -- 결제 방법
  payment_method TEXT NOT NULL, -- 'credit', 'card', 'bank_transfer'
  next_billing_date DATE NOT NULL,
  last_billed_at TIMESTAMP WITH TIME ZONE,

  -- 무통장 입금 정보
  bank_transfer_deadline TIMESTAMP WITH TIME ZONE, -- 입금 기한
  bank_transfer_confirmed BOOLEAN DEFAULT false, -- 입금 확인 여부
  bank_transfer_confirmed_at TIMESTAMP WITH TIME ZONE,
  bank_transfer_confirmed_by UUID REFERENCES admins(id), -- 확인한 관리자

  -- 구독 기간
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- 통계
  total_impressions INTEGER DEFAULT 0, -- 총 노출 수
  total_clicks INTEGER DEFAULT 0, -- 총 클릭 수
  total_paid INTEGER DEFAULT 0, -- 총 결제 금액

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(service_id) -- 서비스당 하나의 활성 구독만
);

CREATE INDEX idx_ad_subscriptions_seller_id ON advertising_subscriptions(seller_id);
CREATE INDEX idx_ad_subscriptions_service_id ON advertising_subscriptions(service_id);
CREATE INDEX idx_ad_subscriptions_status ON advertising_subscriptions(status);
CREATE INDEX idx_ad_subscriptions_next_billing ON advertising_subscriptions(next_billing_date);
CREATE INDEX idx_ad_subscriptions_bank_transfer ON advertising_subscriptions(bank_transfer_confirmed) WHERE payment_method = 'bank_transfer';
```

### 3. advertising_payments (광고 결제 내역)
```sql
CREATE TABLE advertising_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES advertising_subscriptions(id),
  seller_id UUID NOT NULL REFERENCES users(id),

  -- 결제 정보
  amount INTEGER NOT NULL, -- 결제 금액
  payment_method TEXT NOT NULL, -- 'credit', 'card', 'bank_transfer'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'

  -- 무통장 입금 정보
  depositor_name TEXT, -- 입금자명
  bank_name TEXT, -- 입금 은행
  deposit_date DATE, -- 입금일
  deposit_time TIME, -- 입금 시간
  receipt_image TEXT, -- 입금증 이미지 URL

  -- 카드 결제 정보
  pg_transaction_id TEXT, -- PG사 거래 ID
  card_company TEXT,
  card_number_masked TEXT,

  -- 처리 정보
  paid_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES admins(id), -- 확인한 관리자 (무통장 입금)
  admin_memo TEXT, -- 관리자 메모

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ad_payments_subscription_id ON advertising_payments(subscription_id);
CREATE INDEX idx_ad_payments_seller_id ON advertising_payments(seller_id);
CREATE INDEX idx_ad_payments_status ON advertising_payments(status);
CREATE INDEX idx_ad_payments_payment_method ON advertising_payments(payment_method);
```

### 4. advertising_impressions (노출 기록)
```sql
CREATE TABLE advertising_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES advertising_subscriptions(id),
  service_id UUID NOT NULL REFERENCES services(id),

  -- 노출 정보
  category_id UUID REFERENCES categories(id),
  position INTEGER NOT NULL, -- 노출 순서 (1, 2, 3...)
  page_number INTEGER DEFAULT 1, -- 페이지 번호

  -- 사용자 정보
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,

  -- 클릭 여부
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ad_impressions_subscription_id ON advertising_impressions(subscription_id);
CREATE INDEX idx_ad_impressions_service_id ON advertising_impressions(service_id);
CREATE INDEX idx_ad_impressions_created_at ON advertising_impressions(created_at);
```

### 5. credit_transactions (크레딧 거래 내역)
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID NOT NULL REFERENCES advertising_credits(id),
  seller_id UUID NOT NULL REFERENCES users(id),

  -- 거래 정보
  transaction_type TEXT NOT NULL, -- 'earned', 'spent', 'refunded', 'expired'
  amount INTEGER NOT NULL, -- 양수: 지급, 음수: 사용
  balance_after INTEGER NOT NULL, -- 거래 후 잔액

  -- 상세 정보
  description TEXT NOT NULL,
  reference_type TEXT, -- 'subscription', 'promotion', 'refund'
  reference_id UUID, -- subscription_id 등

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_credit_id ON credit_transactions(credit_id);
CREATE INDEX idx_credit_transactions_seller_id ON credit_transactions(seller_id);
```

## 💳 결제 프로세스

### 1. 크레딧 우선 사용
```typescript
// 크레딧이 있으면 자동으로 크레딧부터 차감
async function payWithCredit(
  sellerId: string,
  subscriptionId: string,
  amount: number
): Promise<{ success: boolean; remaining: number }> {
  const { data: credits } = await supabase
    .from('advertising_credits')
    .select('*')
    .eq('seller_id', sellerId)
    .gt('amount', 0)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('expires_at', { ascending: true, nullsFirst: false });

  let remaining = amount;

  for (const credit of credits || []) {
    if (remaining <= 0) break;

    const useAmount = Math.min(credit.amount, remaining);

    await supabase
      .from('advertising_credits')
      .update({
        amount: credit.amount - useAmount,
        used_amount: credit.used_amount + useAmount
      })
      .eq('id', credit.id);

    await supabase.from('credit_transactions').insert({
      credit_id: credit.id,
      seller_id: sellerId,
      transaction_type: 'spent',
      amount: -useAmount,
      balance_after: credit.amount - useAmount,
      description: '광고 구독 월 결제',
      reference_type: 'subscription',
      reference_id: subscriptionId
    });

    remaining -= useAmount;
  }

  return { success: remaining === 0, remaining };
}
```

### 2. 무통장 입금 프로세스

#### Step 1: 판매자가 무통장 입금 선택
```typescript
async function requestBankTransferPayment(
  sellerId: string,
  subscriptionId: string,
  amount: number
) {
  const deadline = addDays(new Date(), 3); // 3일 내 입금

  // 결제 내역 생성
  const { data: payment } = await supabase
    .from('advertising_payments')
    .insert({
      subscription_id: subscriptionId,
      seller_id: sellerId,
      amount,
      payment_method: 'bank_transfer',
      status: 'pending'
    })
    .select()
    .single();

  // 구독 상태 업데이트
  await supabase
    .from('advertising_subscriptions')
    .update({
      status: 'pending_payment',
      payment_method: 'bank_transfer',
      bank_transfer_deadline: deadline
    })
    .eq('id', subscriptionId);

  // 판매자에게 입금 안내 알림
  await sendBankTransferInstructions(sellerId, payment.id, amount, deadline);

  return payment;
}
```

#### Step 2: 입금 안내 알림
```typescript
async function sendBankTransferInstructions(
  sellerId: string,
  paymentId: string,
  amount: number,
  deadline: Date
) {
  const bankInfo = {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME, // "국민은행"
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT, // "123-456-789012"
    accountHolder: process.env.NEXT_PUBLIC_BANK_HOLDER, // "돌파구"
  };

  const message = `
[광고 구독 결제 안내]

입금 금액: ${amount.toLocaleString()}원
입금 계좌: ${bankInfo.bankName} ${bankInfo.accountNumber}
예금주: ${bankInfo.accountHolder}
입금 기한: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString()}

입금자명: [판매자명-결제ID-${paymentId.slice(0, 8)}]
예) 홍길동-결제ID-abc12345

※ 입금 후 자동으로 처리되며, 확인까지 최대 1시간 소요됩니다.
※ 입금자명을 정확히 입력해주세요.
  `;

  await supabase.from('notifications').insert({
    user_id: sellerId,
    type: 'payment_bank_transfer',
    title: '광고 구독 결제 - 무통장 입금 안내',
    content: message,
    link_url: `/seller/advertising/payments/${paymentId}`
  });
}
```

#### Step 3: 판매자가 입금증 업로드 (선택)
```typescript
async function uploadPaymentReceipt(
  paymentId: string,
  receiptImage: File,
  depositInfo: {
    depositorName: string;
    bankName: string;
    depositDate: string;
    depositTime: string;
  }
) {
  // 입금증 이미지 업로드
  const fileName = `receipts/${paymentId}.jpg`;
  const { data: uploadData } = await supabase.storage
    .from('payments')
    .upload(fileName, receiptImage);

  // 결제 정보 업데이트
  await supabase
    .from('advertising_payments')
    .update({
      depositor_name: depositInfo.depositorName,
      bank_name: depositInfo.bankName,
      deposit_date: depositInfo.depositDate,
      deposit_time: depositInfo.depositTime,
      receipt_image: uploadData.path
    })
    .eq('id', paymentId);

  // 관리자에게 확인 요청 알림
  await notifyAdminForPaymentConfirmation(paymentId);
}
```

#### Step 4: 관리자가 입금 확인
```typescript
async function confirmBankTransferPayment(
  paymentId: string,
  adminId: string,
  memo?: string
) {
  const now = new Date().toISOString();

  // 결제 확인 처리
  const { data: payment } = await supabase
    .from('advertising_payments')
    .update({
      status: 'completed',
      paid_at: now,
      confirmed_at: now,
      confirmed_by: adminId,
      admin_memo: memo
    })
    .eq('id', paymentId)
    .select()
    .single();

  // 구독 활성화
  await supabase
    .from('advertising_subscriptions')
    .update({
      status: 'active',
      last_billed_at: now,
      next_billing_date: addMonths(new Date(), 1),
      bank_transfer_confirmed: true,
      bank_transfer_confirmed_at: now,
      bank_transfer_confirmed_by: adminId,
      total_paid: supabase.sql`total_paid + ${payment.amount}`
    })
    .eq('id', payment.subscription_id);

  // 판매자에게 확인 완료 알림
  await supabase.from('notifications').insert({
    user_id: payment.seller_id,
    type: 'payment_confirmed',
    title: '광고 결제 확인 완료',
    content: `${payment.amount.toLocaleString()}원 입금이 확인되었습니다. 광고가 활성화되었습니다.`,
    link_url: '/seller/advertising'
  });
}
```

#### Step 5: 입금 기한 초과 시 자동 취소
```typescript
// Cron Job - 매시간 실행
async function cancelExpiredBankTransfers() {
  const now = new Date().toISOString();

  // 기한 초과된 미입금 결제 조회
  const { data: expiredPayments } = await supabase
    .from('advertising_payments')
    .select('*, subscription:advertising_subscriptions(*)')
    .eq('payment_method', 'bank_transfer')
    .eq('status', 'pending')
    .lt('subscription.bank_transfer_deadline', now);

  for (const payment of expiredPayments || []) {
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
        expires_at: now
      })
      .eq('id', payment.subscription_id);

    // 판매자에게 알림
    await supabase.from('notifications').insert({
      user_id: payment.seller_id,
      type: 'payment_expired',
      title: '광고 결제 기한 만료',
      content: '입금 기한이 지나 광고가 중지되었습니다. 다시 신청해주세요.',
      link_url: '/seller/advertising'
    });
  }
}
```

### 3. 카드 자동 결제 (선택)
```typescript
async function setupCardAutoPayment(
  sellerId: string,
  subscriptionId: string,
  cardInfo: any
) {
  // PG사 연동 (PortOne)
  const billingKey = await registerBillingKey(sellerId, cardInfo);

  await supabase
    .from('advertising_subscriptions')
    .update({
      payment_method: 'card',
      // billing_key는 암호화하여 저장
    })
    .eq('id', subscriptionId);
}

// 월간 자동 결제
async function processCardAutoPayment(
  subscriptionId: string,
  amount: number
) {
  // PortOne 정기결제 API 호출
  const result = await portone.payment.schedule({
    subscriptionId,
    amount
  });

  if (result.success) {
    await supabase
      .from('advertising_payments')
      .insert({
        subscription_id: subscriptionId,
        amount,
        payment_method: 'card',
        status: 'completed',
        pg_transaction_id: result.transactionId,
        paid_at: new Date().toISOString()
      });
  }
}
```

## 🏦 무통장 입금 관리자 페이지

### 입금 확인 대기 목록
```typescript
interface BankTransferConfirmationList {
  pendingPayments: Array<{
    id: string;
    sellerName: string;
    serviceName: string;
    amount: number;
    depositorName: string;
    bankName: string;
    depositDate: string;
    depositTime: string;
    receiptImage: string | null;
    deadline: Date;
    createdAt: Date;
  }>;
}
```

### UI 예시
```
┌─────────────────────────────────────────────────────────┐
│  무통장 입금 확인 대기                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔔 확인 대기 중: 3건                                   │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ 홍길동 판매자 - 웹사이트 개발 서비스           │     │
│  │ 결제 금액: 100,000원                          │     │
│  │ 입금자명: 홍길동-abc12345                     │     │
│  │ 입금일시: 2025-01-12 14:30                    │     │
│  │ 입금 은행: 국민은행                           │     │
│  │ 입금 기한: 2025-01-15 23:59                   │     │
│  │ [입금증 보기]                                 │     │
│  │                                               │     │
│  │ [확인 완료] [거절]                            │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ 김철수 판매자 - 디자인 서비스                 │     │
│  │ ...                                           │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📈 판매자 대시보드

### 광고 결제 페이지
```
┌─────────────────────────────────────────────────┐
│  광고 결제                                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  💰 현재 크레딧: 400,000원                     │
│                                                 │
│  결제 금액: 100,000원                          │
│                                                 │
│  ✅ 크레딧으로 결제 (400,000원 보유)           │
│     → 잔액: 300,000원                          │
│                                                 │
│  ─────── 또는 ───────                          │
│                                                 │
│  ○ 무통장 입금                                 │
│     입금 계좌: 국민은행 123-456-789012         │
│     예금주: 돌파구                             │
│     입금자명: [이름-결제ID-xxxxx]              │
│     입금 기한: 3일 이내                        │
│                                                 │
│  ○ 카드 자동 결제 (등록 필요)                  │
│     [카드 등록하기]                            │
│                                                 │
│  [결제하기]                                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🚀 구현 순서

1. **Phase 1**: 데이터베이스 마이그레이션 생성 ✅
2. **Phase 2**: 크레딧 시스템 구현
3. **Phase 3**: 무통장 입금 시스템 구현
4. **Phase 4**: 구독 및 결제 API 구현
5. **Phase 5**: 랜덤 노출 알고리즘 통합
6. **Phase 6**: 판매자 광고 대시보드 UI
7. **Phase 7**: 관리자 입금 확인 페이지
8. **Phase 8**: 자동 결제 Cron Jobs

## 📝 핵심 특징

✅ **완벽한 공평성**: 모든 광고가 100% 동일한 확률
✅ **단순한 가격**: 월 10만원 단일 플랜
✅ **배지 없음**: 자연스러운 노출
✅ **다양한 결제**: 크레딧 / 무통장 입금 / 카드
✅ **초기 지원**: 6개월 무료 (60만원 크레딧)
✅ **투명한 통계**: 모든 노출/클릭 추적
