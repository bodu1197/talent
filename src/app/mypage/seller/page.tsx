import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BecomeSellerForm from './BecomeSellerForm'

export default async function SellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 이미 판매자인지 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (seller) {
    // 이미 판매자면 대시보드로
    redirect('/mypage/seller/dashboard')
  }

  return <BecomeSellerForm userId={user.id} />
}
