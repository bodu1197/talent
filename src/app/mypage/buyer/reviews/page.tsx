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

  // Map Supabase array results to expected types
  const mappedPendingReviews = (pendingReviews as unknown[]).map((order: unknown) => {
    const orderItem = order as Record<string, unknown> & { service?: unknown[]; seller?: unknown[] }
    return {
      ...orderItem,
      service: orderItem.service?.[0] || null,
      seller: orderItem.seller?.[0] || null
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BuyerReviewsClient initialPendingReviews={mappedPendingReviews as any} initialWrittenReviews={writtenReviews} userId={user.id} />
}
