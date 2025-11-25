import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getBuyerDashboardStats,
  getBuyerRecentOrders,
  getBuyerRecentFavorites,
  getBuyerBenefits,
} from '@/lib/supabase/queries/dashboard';
import BuyerDashboardClient from './BuyerDashboardClient';

// Helper: Extract first element from Supabase array response
function extractFirst<T>(arr: unknown): T | undefined {
  return Array.isArray(arr) && arr.length > 0 ? (arr[0] as T) : undefined;
}

// Type for mapped favorite
interface MappedFavorite {
  id: string;
  created_at: string;
  service?: Record<string, unknown> & { seller?: unknown };
}

// Helper: Map favorites to expected type
function mapFavorites(favorites: unknown[]): MappedFavorite[] {
  return favorites.map((fav) => {
    const favItem = fav as { id: string; created_at: string; service?: unknown[] };
    const service = extractFirst<Record<string, unknown> & { seller?: unknown[] }>(favItem.service);

    return {
      id: favItem.id,
      created_at: favItem.created_at,
      service: service
        ? {
            ...service,
            seller: extractFirst(service.seller),
          }
        : undefined,
    };
  });
}

// Helper: Ensure buyer record exists
async function ensureBuyerExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<void> {
  const { data: buyer } = await supabase
    .from('buyers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!buyer) {
    const { error: createError } = await supabase
      .from('buyers')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (createError) {
      throw new Error('구매자 생성 실패: ' + createError.message);
    }
  }
}

// Server Component - 서버에서 데이터 로드
export default async function BuyerDashboardPage() {
  const supabase = await createClient();

  // 사용자 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 구매자 정보 가져오기 (없으면 자동 생성)
  await ensureBuyerExists(supabase, user.id);

  // 프로필 정보 가져오기 (profiles 테이블)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle();

  // 대시보드 데이터 서버에서 로드
  const [stats, recentOrders, favorites, benefits] = await Promise.all([
    getBuyerDashboardStats(user.id),
    getBuyerRecentOrders(user.id, 5),
    getBuyerRecentFavorites(user.id, 5),
    getBuyerBenefits(user.id),
  ]);

  const mappedFavorites = mapFavorites(favorites as unknown[]);

  return (
    <BuyerDashboardClient
      stats={stats}
      recentOrders={recentOrders}
      favorites={mappedFavorites as Parameters<typeof BuyerDashboardClient>[0]['favorites']}
      benefits={benefits}
      profileData={profile}
    />
  );
}
