import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BecomeSellerClient from './BecomeSellerClient'

export default async function BecomeSellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 이미 판매자인지 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('id, verified')
    .eq('user_id', user.id)
    .maybeSingle()

  if (seller) {
    // 이미 판매자면 대시보드로
    redirect('/mypage/seller/dashboard')
  }

  return <BecomeSellerClient userId={user.id} />
}
