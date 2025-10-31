import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerProfileEditClient from './SellerProfileEditClient'

export default async function SellerProfileEditPage() {
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

  return <SellerProfileEditClient profile={seller} />
}
