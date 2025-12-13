import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WithdrawClient from './WithdrawClient';

export default async function WithdrawPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get seller info (id and account details)
  const { data: seller } = await supabase
    .from('sellers')
    .select('id, bank_name, account_number, account_holder')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!seller) {
    redirect('/mypage/seller/register');
  }

  // Get profile data (name and profile_image)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle();

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
