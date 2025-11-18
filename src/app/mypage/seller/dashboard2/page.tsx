import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerDashboardStats, getSellerRecentOrders } from '@/lib/supabase/queries/dashboard'
import Dashboard2Client from './Dashboard2Client'

// Server Component - 서버에서 데이터 로드
export default async function Dashboard2Page() {
  const supabase = await createClient()

  // 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 판매자 정보 가져오기
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  // 대시보드 데이터 서버에서 로드
  const [stats, recentOrders] = await Promise.all([
    getSellerDashboardStats(seller.id),
    getSellerRecentOrders(seller.id, 5)
  ])

  // 클라이언트 컴포넌트에 데이터 전달
  return <Dashboard2Client stats={stats} recentOrders={recentOrders} />
}
