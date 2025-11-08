import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerReviewsClient from './SellerReviewsClient'

export default async function SellerReviewsPage() {
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

  // Get seller reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      service:services(id, title, thumbnail_url),
      buyer:users!buyer_id(id, name, profile_image),
      order:orders(id, order_number)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return <SellerReviewsClient reviews={reviews || []} />
}
