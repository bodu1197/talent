import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPendingReviews, getBuyerReviews } from '@/lib/supabase/queries/reviews';
import BuyerReviewsClient from './BuyerReviewsClient';
import { Order } from '@/types/common';

// Helper: Extract first element from Supabase array response
function extractFirstElement<T>(arr: unknown): T | null {
  return Array.isArray(arr) && arr.length > 0 ? (arr[0] as T) : null;
}

// Helper: Map pending reviews to expected Order partial type
function mapPendingReviews(pendingReviews: unknown[]): Partial<Order>[] {
  return pendingReviews.map((order) => {
    const orderItem = order as Record<string, unknown>;
    return {
      ...orderItem,
      service: extractFirstElement(orderItem.service),
      seller: extractFirstElement(orderItem.seller),
    } as Partial<Order>;
  });
}

export default async function BuyerReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [pendingReviews, writtenReviews] = await Promise.all([
    getPendingReviews(user.id),
    getBuyerReviews(user.id),
  ]);

  const mappedPendingReviews = mapPendingReviews(pendingReviews as unknown[]);

  return (
    <BuyerReviewsClient
      initialPendingReviews={mappedPendingReviews}
      initialWrittenReviews={writtenReviews}
      userId={user.id}
    />
  );
}
