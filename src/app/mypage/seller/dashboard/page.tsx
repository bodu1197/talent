import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerDashboardStats, getSellerRecentOrders } from '@/lib/supabase/queries/dashboard'
import SellerDashboardClient from './SellerDashboardClient'

// Server Component - 서버에서 데이터 로드
export default async function SellerDashboardPage() {
  const supabase = await createClient()

  // 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 판매자 정보 가져오기
  const { data: seller } = await supabase
    .from('sellers')
    .select('id, display_name, profile_image, user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  // 대시보드 데이터 서버에서 로드
  // Note: orders.seller_id references users.id, not sellers.id
  const [stats, recentOrders] = await Promise.all([
    getSellerDashboardStats(user.id),
    getSellerRecentOrders(user.id, 5)
  ])

  // 클라이언트 컴포넌트에 데이터 전달
  return <SellerDashboardClient stats={stats} recentOrders={recentOrders} sellerData={seller} />
}
