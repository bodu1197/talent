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
    .select(`
      *,
      users!inner(profile_image)
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  // users.profile_image를 seller.profile_image로 병합
  const profileWithImage = {
    ...seller,
    profile_image: seller.users?.profile_image || seller.profile_image
  }

  return <SellerProfileEditClient profile={profileWithImage} />
}
