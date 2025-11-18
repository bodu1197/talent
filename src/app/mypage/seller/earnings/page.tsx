import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerEarningsClient from './SellerEarningsClient'
import { Order } from '@/types/common'

export default async function SellerEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get seller info (id and account details)
  const { data: seller } = await supabase
    .from('sellers')
    .select('id, bank_name, account_number, account_holder')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  // Get profile data (name and profile_image)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle()

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

  // Check for pending withdrawal request
  const { data: pendingWithdrawal } = await supabase
    .from('withdrawal_requests')
    .select('id, amount, status, created_at')
    .eq('seller_id', seller.id)
    .eq('status', 'pending')
    .maybeSingle()

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
    total_earned: totalEarned,
    pending_withdrawal: pendingWithdrawal
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
      services!inner(id, title)
    `)
    .eq('seller_id', user.id)
    .in('status', ['completed', 'delivered'])
    .order('updated_at', { ascending: false })
    .limit(10)

  // Transform the data to match expected type
  const transformedTransactions = (transactions?.map(({ services, ...t }) => ({
    ...t,
    buyer_id: '',
    seller_id: user.id,
    service_id: Array.isArray(services) && services[0] ? services[0].id : '',
    package_id: null,
    payment_method: null,
    payment_id: null,
    paid_at: null,
    started_at: null,
    completed_at: null,
    cancelled_at: null,
    cancel_reason: null,
    platform_fee: 0,
    seller_amount: t.total_amount || 0,
    deliverables: [],
    service: Array.isArray(services) ? services[0] : services
  } as unknown as Order)) || []) as Order[]

  return <SellerEarningsClient earnings={earnings} transactions={transformedTransactions} sellerData={seller} profileData={profile} />
}
