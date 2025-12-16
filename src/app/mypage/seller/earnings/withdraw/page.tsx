import { createClient } from '@/lib/supabase/server';
import WithdrawClient from './WithdrawClient';
import { getSellerWithAccountInfo } from '@/lib/seller/earningsData';

export default async function WithdrawPage() {
  const { seller, profile, user } = await getSellerWithAccountInfo();
  const supabase = await createClient();

  // Get completed orders to calculate available balance
  const { data: completedOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('seller_id', user.id)
    .eq('status', 'completed');

  // Get withdrawal history
  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('amount, status')
    .eq('seller_id', seller.id)
    .eq('status', 'completed');

  const totalCompleted =
    completedOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
  const availableBalance = totalCompleted - totalWithdrawn;

  // Check for pending withdrawal
  const { data: pendingWithdrawal } = await supabase
    .from('withdrawal_requests')
    .select('id, amount, created_at')
    .eq('seller_id', seller.id)
    .eq('status', 'pending')
    .maybeSingle();

  return (
    <WithdrawClient
      sellerData={seller}
      profileData={profile}
      availableBalance={availableBalance}
      pendingWithdrawal={pendingWithdrawal}
    />
  );
}
