import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerOrderDetailClient from './SellerOrderDetailClient'

// 페이지를 dynamic으로 설정 (캐싱 비활성화)
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  return <SellerOrderDetailClient orderId={id} />
}
