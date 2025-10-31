import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerProfileClient from './SellerProfileClient'

export default async function SellerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: seller, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  return <SellerProfileClient profile={seller} />
}
