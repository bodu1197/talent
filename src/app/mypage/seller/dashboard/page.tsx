import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSellerDashboardStats, getSellerRecentOrders } from '@/lib/supabase/queries/dashboard';
import SellerDashboardClient from './SellerDashboardClient';

// Server Component - 서버에서 데이터 로드
export default async function SellerDashboardPage() {
  const supabase = await createClient();

  // 사용자 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 프로필 정보 가져오기 (profiles 테이블)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle();

  // 전문가 정보 가져오기
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // 전문가 등록이 안 된 경우에도 대시보드 표시 (등록 유도 UI 표시)
  if (!seller) {
    return <SellerDashboardClient stats={null} recentOrders={[]} profileData={profile} />;
  }

  // 대시보드 데이터 서버에서 로드
  // Note: orders.seller_id references users.id, not sellers.id
  // supabase 인스턴스를 전달하여 인증 컨텍스트 유지
  const [stats, recentOrders] = await Promise.all([
    getSellerDashboardStats(supabase, user.id),
    getSellerRecentOrders(supabase, user.id, 5),
  ]);

  // 클라이언트 컴포넌트에 데이터 전달
  return <SellerDashboardClient stats={stats} recentOrders={recentOrders} profileData={profile} />;
}
