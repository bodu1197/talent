import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerOrders, getSellerOrdersCount } from '@/lib/supabase/queries/orders'
import SellerOrdersClient from './SellerOrdersClient'

// 페이지를 dynamic으로 설정 (캐싱 비활성화)
export const dynamic = 'force-dynamic'
export const revalidate = 0

type OrderStatus = 'all' | 'paid' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
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

  const statusFromUrl = (searchParams.status as OrderStatus) || 'all'

  const [orders, paidCount, inProgressCount, deliveredCount, completedCount, cancelledCount] = await Promise.all([
    getSellerOrders(user.id, statusFromUrl === 'all' ? undefined : statusFromUrl),
    getSellerOrdersCount(user.id, 'paid'),
    getSellerOrdersCount(user.id, 'in_progress'),
    getSellerOrdersCount(user.id, 'delivered'),
    getSellerOrdersCount(user.id, 'completed'),
    getSellerOrdersCount(user.id, 'cancelled')
  ])

  const statusCounts = {
    all: paidCount + inProgressCount + deliveredCount + completedCount + cancelledCount,
    paid: paidCount,
    in_progress: inProgressCount,
    delivered: deliveredCount,
    completed: completedCount,
    cancelled: cancelledCount
  }

  return <SellerOrdersClient
    initialOrders={orders}
    initialStatus={statusFromUrl}
    statusCounts={statusCounts}
  />
}
