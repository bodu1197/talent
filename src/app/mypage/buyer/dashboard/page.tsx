import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBuyerDashboardStats, getBuyerRecentOrders, getBuyerRecentFavorites, getBuyerBenefits } from '@/lib/supabase/queries/dashboard'
import BuyerDashboardClient from './BuyerDashboardClient'

// Server Component - 서버에서 데이터 로드
export default async function BuyerDashboardPage() {
  const supabase = await createClient()

  // 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 구매자 정보 가져오기 (없으면 자동 생성)
  let { data: buyer } = await supabase
    .from('buyers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  // 구매자 레코드가 없으면 자동 생성
  if (!buyer) {
    const { data: newBuyer, error: createError } = await supabase
      .from('buyers')
      .insert({ user_id: user.id })
      .select('id')
      .single()

    if (createError) {
      throw new Error('구매자 생성 실패: ' + createError.message)
    }

    buyer = newBuyer
  }

  // 판매자 정보 확인 (판매자로 등록되어 있는지 체크)
  const { data: seller } = await supabase
    .from('sellers')
    .select('id, display_name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle()

  // 대시보드 데이터 서버에서 로드
  const [stats, recentOrders, favorites, benefits] = await Promise.all([
    getBuyerDashboardStats(buyer.id),
    getBuyerRecentOrders(buyer.id, 5),
    getBuyerRecentFavorites(user.id, 5),
    getBuyerBenefits(user.id)
  ])

  // 클라이언트 컴포넌트에 데이터 전달
  return <BuyerDashboardClient stats={stats} recentOrders={recentOrders} favorites={favorites} benefits={benefits} sellerData={seller} />
}
