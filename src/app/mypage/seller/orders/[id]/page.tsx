import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/supabase/queries/orders'
import SellerOrderDetailClient from './SellerOrderDetailClient'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SellerOrderDetailPage({ params }: PageProps) {
  const { id } = await params
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

  const order = await getOrderById(id)

  if (!order) {
    redirect('/mypage/seller/orders')
  }

  return <SellerOrderDetailClient order={order} orderId={id} />
}
