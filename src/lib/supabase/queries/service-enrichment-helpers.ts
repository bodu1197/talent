import type { SupabaseClient } from '@supabase/supabase-js';

type Service = {
  id: string;
  price?: number | null;
  orders_count?: number | null;
  is_advertised?: boolean;
  price_min?: number;
  price_max?: number;
  rating?: number;
  review_count?: number;
  seller?: {
    user_id?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      profile_image?: string | null;
    };
  } | null;
  [key: string]: unknown;
};

/**
 * Fetch active advertising service IDs
 */
export async function fetchAdvertisedServiceIds(
  serviceRoleClient: SupabaseClient
): Promise<string[]> {
  const { data: advertisingData } = await serviceRoleClient
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  return advertisingData?.map((ad) => ad.service_id) || [];
}

/**
 * Mark services with advertising status
 */
export function markAdvertisedServices(services: Service[], advertisedServiceIds: string[]): void {
  for (const service of services) {
    service.is_advertised = advertisedServiceIds.includes(service.id);
  }
}

/**
 * Calculate review statistics for services
 */
export async function enrichServicesWithReviewStats(
  supabase: SupabaseClient,
  services: Service[]
): Promise<void> {
  if (services.length === 0) return;

  const serviceIds = services.map((s) => s.id);
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('service_id, rating')
    .in('service_id', serviceIds)
    .eq('is_visible', true);

  // Build rating map
  const ratingMap = new Map<string, { sum: number; count: number }>();
  if (reviewStats) {
    for (const review of reviewStats as {
      service_id: string;
      rating: number;
    }[]) {
      const current = ratingMap.get(review.service_id) || {
        sum: 0,
        count: 0,
      };
      ratingMap.set(review.service_id, {
        sum: current.sum + review.rating,
        count: current.count + 1,
      });
    }
  }

  // Apply stats to services
  for (const service of services) {
    service.price_min = service.price || 0;
    service.price_max = service.price || undefined;

    const stats = ratingMap.get(service.id);
    if (stats && stats.count > 0) {
      service.rating = stats.sum / stats.count;
      service.review_count = stats.count;
    } else {
      service.rating = 0;
      service.review_count = 0;
    }
  }
}

/**
 * Enrich services with seller user information
 */
export async function enrichServicesWithUserInfo(
  supabase: SupabaseClient,
  services: Service[]
): Promise<void> {
  if (services.length === 0) return;

  const userIds = services.map((s) => s.seller?.user_id).filter(Boolean) as string[];

  if (userIds.length === 0) return;

  const { data: usersData } = await supabase
    .from('profiles')
    .select('user_id, name, email, profile_image')
    .in('user_id', userIds);

  if (!usersData) return;

  for (const service of services) {
    if (service.seller?.user_id) {
      const user = usersData.find((u) => u.user_id === service.seller!.user_id);
      if (user) {
        service.seller.user = {
          id: user.user_id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image,
        };
      }
    }
  }
}
