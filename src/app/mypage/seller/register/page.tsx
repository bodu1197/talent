import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerRegisterClient from './SellerRegisterClient'

export default async function SellerRegisterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if already registered as seller
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (seller) {
    redirect('/mypage/seller/dashboard')
  }

  // Get current profile data from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle()

  return <SellerRegisterClient userId={user.id} initialProfile={profile} />
}
