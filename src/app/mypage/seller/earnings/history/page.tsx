import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWithdrawalHistory } from '@/lib/supabase/queries/earnings'
import WithdrawHistoryClient from './WithdrawHistoryClient'

export default async function WithdrawHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  const withdrawHistory = await getWithdrawalHistory(seller.id, 20)

  return <WithdrawHistoryClient history={withdrawHistory} />
}
