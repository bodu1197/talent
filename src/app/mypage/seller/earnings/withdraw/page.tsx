import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WithdrawClient from './WithdrawClient'

export default async function WithdrawPage() {
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

  return <WithdrawClient sellerId={seller.id} />
}
