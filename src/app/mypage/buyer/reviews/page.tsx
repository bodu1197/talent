import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPendingReviews, getBuyerReviews } from '@/lib/supabase/queries/reviews'
import BuyerReviewsClient from './BuyerReviewsClient'

export default async function BuyerReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [pendingReviews, writtenReviews] = await Promise.all([
    getPendingReviews(user.id),
    getBuyerReviews(user.id)
  ])

  return <BuyerReviewsClient initialPendingReviews={pendingReviews} initialWrittenReviews={writtenReviews} userId={user.id} />
}
