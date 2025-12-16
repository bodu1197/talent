import { requireSellerAuth } from '@/lib/seller/page-auth';
import { getWithdrawalHistory } from '@/lib/supabase/queries/earnings';
import WithdrawHistoryClient from './WithdrawHistoryClient';

export default async function WithdrawHistoryPage() {
  // 판매자 인증 확인
  const { seller } = await requireSellerAuth();

  const withdrawHistory = await getWithdrawalHistory(seller.id, 20);

  return <WithdrawHistoryClient history={withdrawHistory} />;
}
