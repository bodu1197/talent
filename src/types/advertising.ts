// 광고 시스템 타입 정의

export interface AdvertisingCredit {
  id: string;
  seller_id: string;
  amount: number;
  initial_amount: number;
  used_amount: number;
  promotion_type: 'launch_promo' | 'referral' | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvertisingSubscription {
  id: string;
  seller_id: string;
  service_id: string;
  monthly_price: number;
  status: 'active' | 'pending_payment' | 'cancelled' | 'expired';
  payment_method: 'credit' | 'card' | 'bank_transfer';
  next_billing_date: string;
  last_billed_at: string | null;
  bank_transfer_deadline: string | null;
  bank_transfer_confirmed: boolean;
  bank_transfer_confirmed_at: string | null;
  bank_transfer_confirmed_by: string | null;
  started_at: string;
  cancelled_at: string | null;
  expires_at: string | null;
  total_impressions: number;
  total_clicks: number;
  total_paid: number;
  created_at: string;
  updated_at: string;
}

export interface AdvertisingPayment {
  id: string;
  subscription_id: string;
  seller_id: string;
  amount: number;
  payment_method: 'credit' | 'card' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  depositor_name: string | null;
  bank_name: string | null;
  deposit_date: string | null;
  deposit_time: string | null;
  receipt_image: string | null;
  pg_transaction_id: string | null;
  card_company: string | null;
  card_number_masked: string | null;
  paid_at: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  admin_memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvertisingImpression {
  id: string;
  subscription_id: string;
  service_id: string;
  category_id: string | null;
  position: number;
  page_number: number;
  user_id: string | null;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  clicked: boolean;
  clicked_at: string | null;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  credit_id: string;
  seller_id: string;
  transaction_type: 'earned' | 'spent' | 'refunded' | 'expired';
  amount: number;
  balance_after: number;
  description: string;
  reference_type: 'subscription' | 'promotion' | 'refund' | null;
  reference_id: string | null;
  created_at: string;
}

// 판매자 대시보드용 타입
export interface AdvertisingDashboard {
  credits: {
    total: number;
    promotional: number;
    purchased: number;
    expiresAt: string | null;
  };
  subscriptions: Array<{
    id: string;
    serviceId: string;
    serviceName: string;
    status: string;
    nextBillingDate: string;
    monthlyPrice: number;
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
  }>;
  stats: {
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
    averagePosition: number;
  };
  recentActivity: Array<{
    date: string;
    impressions: number;
    clicks: number;
  }>;
}

// 결제 요청 타입
export interface BankTransferPaymentRequest {
  subscriptionId: string;
  sellerId: string;
  amount: number;
  depositorName: string;
  bankName: string;
  depositDate: string;
  depositTime: string;
}

// 관리자 입금 확인용
export interface PendingBankTransfer {
  id: string;
  sellerName: string;
  serviceName: string;
  amount: number;
  depositorName: string;
  bankName: string;
  depositDate: string;
  depositTime: string;
  receiptImage: string | null;
  deadline: string;
  createdAt: string;
}
