import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerEarnings, getEarningsTransactions } from '@/lib/supabase/queries/earnings'
import SellerEarningsClient from './SellerEarningsClient'

export default async function SellerEarningsPage() {
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

  const [earnings, transactions] = await Promise.all([
    getSellerEarnings(seller.id),
    getEarningsTransactions(seller.id, 10)
  ])

  return <SellerEarningsClient initialEarnings={earnings} initialTransactions={transactions} sellerId={seller.id} />
}
