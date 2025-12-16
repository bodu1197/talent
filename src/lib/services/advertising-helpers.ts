/**
 * 광고 서비스 관련 헬퍼 함수
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * 활성 광고 서비스 ID 조회 (Service Role 클라이언트로 RLS 우회)
 */
export async function getActiveAdvertisedServiceIds(): Promise<Set<string>> {
  const serviceRoleClient = createServiceRoleClient();
  const { data: advertisingData } = await serviceRoleClient
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  return new Set(advertisingData?.map((ad) => ad.service_id) || []);
}
