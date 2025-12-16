import { createClient } from '@/lib/supabase/server';
import SellerEarningsClient from './SellerEarningsClient';
import { getSellerWithAccountInfo } from '@/lib/seller/earningsData';

interface OrderInfo {
  id: string;
  order_number: string | null;
  title: string;
  status: string;
  auto_confirm_at: string | null;
}

interface SettlementRow {
  id: string;
  order_id: string;
  order_amount: number;
  pg_fee: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  auto_confirm_at: string | null;
  orders: OrderInfo | OrderInfo[] | null;
}

export default async function SellerEarningsPage() {
  const { seller, profile, user } = await getSellerWithAccountInfo();
  const supabase = await createClient();

  // Get settlements from order_settlements table
  const { data: settlements } = await supabase
    .from('order_settlements')
    .select(
      `
      id,
      order_id,
      order_amount,
      pg_fee,
      platform_fee,
      net_amount,
      status,
      created_at,
      confirmed_at,
      paid_at,
      cancelled_at,
      auto_confirm_at,
      orders!inner(id, order_number, title, status, auto_confirm_at)
    `
    )
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  // Get withdrawal history
  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('amount, status, created_at')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false });

  // Check for pending withdrawal request
  const { data: pendingWithdrawal } = await supabase
    .from('withdrawal_requests')
    .select('id, amount, status, created_at')
    .eq('seller_id', seller.id)
    .eq('status', 'pending')
    .maybeSingle();

  // Calculate balances from settlements
  // confirmed: 구매확정됨, 출금 가능
  // pending: 구매확정 대기 중
  // paid: 출금 완료
  const typedSettlements = (settlements || []) as SettlementRow[];

  // Helper to get order info from settlement
  const getOrderInfo = (s: SettlementRow): OrderInfo | null => {
    if (!s.orders) return null;
    if (Array.isArray(s.orders)) return s.orders[0] || null;
    return s.orders;
  };

  const confirmedTotal = typedSettlements
    .filter((s) => s.status === 'confirmed')
    .reduce((sum, s) => sum + s.net_amount, 0);

  const pendingTotal = typedSettlements
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + s.net_amount, 0);

  const paidTotal = typedSettlements
    .filter((s) => s.status === 'paid')
    .reduce((sum, s) => sum + s.net_amount, 0);

  // Total withdrawn from withdrawal_requests
  const totalWithdrawn =
    withdrawals
      ?.filter((w) => w.status === 'completed')
      .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

  // Available balance = confirmed - withdrawn (not yet paid)
  const availableBalance = confirmedTotal - totalWithdrawn;
  const totalEarned = confirmedTotal + paidTotal;

  const earnings = {
    available_balance: availableBalance,
    pending_balance: pendingTotal,
    total_withdrawn: totalWithdrawn + paidTotal,
    total_earned: totalEarned,
    pending_withdrawal: pendingWithdrawal,
  };

  // Transform settlements for display
  const transformedSettlements = typedSettlements.map((s) => {
    const orderInfo = getOrderInfo(s);
    return {
      id: s.id,
      order_id: s.order_id,
      order_number: orderInfo?.order_number || s.order_id.slice(0, 8),
      title: orderInfo?.title || '주문',
      order_amount: s.order_amount,
      pg_fee: s.pg_fee,
      platform_fee: s.platform_fee,
      net_amount: s.net_amount,
      status: s.status,
      created_at: s.created_at,
      confirmed_at: s.confirmed_at,
      paid_at: s.paid_at,
      auto_confirm_at: orderInfo?.auto_confirm_at || s.auto_confirm_at,
    };
  });

  return (
    <SellerEarningsClient
      earnings={earnings}
      settlements={transformedSettlements}
      sellerData={seller}
      profileData={profile}
    />
  );
}
