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
  const { data: buyer } = await supabase
    .from('buyers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  // 구매자 레코드가 없으면 자동 생성
  if (!buyer) {
    const { error: createError } = await supabase
      .from('buyers')
      .insert({ user_id: user.id })
      .select('id')
      .single()

    if (createError) {
      throw new Error('구매자 생성 실패: ' + createError.message)
    }
  }

  // 프로필 정보 가져오기 (profiles 테이블)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle()

  // 대시보드 데이터 서버에서 로드
  // Note: orders.buyer_id references users.id, not buyers.id
  const [stats, recentOrders, favorites, benefits] = await Promise.all([
    getBuyerDashboardStats(user.id),
    getBuyerRecentOrders(user.id, 5),
    getBuyerRecentFavorites(user.id, 5),
    getBuyerBenefits(user.id)
  ])

  // Map Supabase array results to expected types
  const mappedFavorites = (favorites as unknown[]).map((fav: unknown) => {
    const favItem = fav as { id: string; created_at: string; service?: unknown[] }
    return {
      id: favItem.id,
      created_at: favItem.created_at,
      service: favItem.service?.[0] ? {
        ...(favItem.service[0] as Record<string, unknown>),
        seller: (favItem.service[0] as { seller?: unknown[] }).seller?.[0] || null
      } : null
    }
  })

  // 클라이언트 컴포넌트에 데이터 전달
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BuyerDashboardClient stats={stats} recentOrders={recentOrders} favorites={mappedFavorites as any} benefits={benefits} profileData={profile} />
}
