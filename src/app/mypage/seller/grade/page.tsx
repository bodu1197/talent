import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerGradeClient from './SellerGradeClient'

export default async function SellerGradePage() {
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

  return <SellerGradeClient />
}
