import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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

  // Get or create seller earnings
  let { data: earnings, error: earningsError } = await supabase
    .from('seller_earnings')
    .select('*')
    .eq('seller_id', seller.id)
    .maybeSingle()

  // If no earnings record exists, create one
  if (!earnings) {
    const { data: newEarnings } = await supabase
      .from('seller_earnings')
      .insert({
        seller_id: seller.id,
        available_balance: 0,
        pending_balance: 0,
        total_withdrawn: 0,
        total_earned: 0
      })
      .select()
      .maybeSingle()

    earnings = newEarnings || {
      available_balance: 0,
      pending_balance: 0,
      total_withdrawn: 0,
      total_earned: 0
    }
  }

  // Get earnings transactions
  const { data: transactions } = await supabase
    .from('earnings_transactions')
    .select(`
      *,
      order:orders(id, order_number, title)
    `)
    .eq('seller_id', seller.id)
    .order('transaction_date', { ascending: false })
    .limit(10)

  return <SellerEarningsClient earnings={earnings} transactions={transactions || []} />
}
