import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerReviews } from '@/lib/supabase/queries/reviews'
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

  const reviews = await getSellerReviews(user.id)

  return <SellerReviewsClient reviews={reviews} />
}
