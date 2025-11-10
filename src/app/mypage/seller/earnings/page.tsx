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
    .select('id, display_name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  // Calculate earnings from actual orders
  // Note: orders.seller_id references users.id, not sellers.id

  // Get completed orders (available balance)
  const { data: completedOrders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('seller_id', user.id)
    .eq('status', 'completed')

  // Get delivered orders (pending balance - waiting for buyer confirmation)
  const { data: deliveredOrders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('seller_id', user.id)
    .eq('status', 'delivered')

  // Get withdrawal history
  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('amount, status, created_at')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })

  // Calculate balances
  const totalCompleted = completedOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  const totalPending = deliveredOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  const totalWithdrawn = withdrawals?.filter(w => w.status === 'completed').reduce((sum, w) => sum + (w.amount || 0), 0) || 0

  // No commission - 100% to seller
  const availableBalance = totalCompleted - totalWithdrawn
  const pendingBalance = totalPending
  const totalEarned = totalCompleted

  const earnings = {
    available_balance: availableBalance,
    pending_balance: pendingBalance,
    total_withdrawn: totalWithdrawn,
    total_earned: totalEarned
  }

  // Get recent completed orders as transactions
  const { data: transactions } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_amount,
      status,
      created_at,
      updated_at,
      service:services(id, title)
    `)
    .eq('seller_id', user.id)
    .in('status', ['completed', 'delivered'])
    .order('updated_at', { ascending: false })
    .limit(10)

  return <SellerEarningsClient earnings={earnings} transactions={transactions || []} sellerData={seller} />
}
