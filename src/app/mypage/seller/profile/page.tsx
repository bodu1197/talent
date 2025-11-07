import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerProfileClient from './SellerProfileClient'

export default async function SellerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 먼저 seller 정보를 가져옴
  const { data: seller, error: sellerError } = await supabase
    .from('sellers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (sellerError) {
    console.error('Seller fetch error:', sellerError)
  }

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  // users 테이블에서 profile_image 가져오기
  const { data: userData } = await supabase
    .from('users')
    .select('profile_image')
    .eq('id', user.id)
    .single()

  // users.profile_image를 seller.profile_image로 병합
  const profileWithImage = {
    ...seller,
    profile_image: userData?.profile_image || seller.profile_image
  }

  return <SellerProfileClient profile={profileWithImage} />
}
