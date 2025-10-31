import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ServiceStatisticsClient from './ServiceStatisticsClient'

export default async function ServiceStatisticsPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  const serviceId = searchParams.id

  // TODO: 실제로는 API에서 데이터를 가져와야 합니다
  const stats = {
    serviceName: '로고 디자인 작업',
    period: '최근 30일',
    viewCount: 342,
    favoriteCount: 28,
    orderCount: 15,
    revenue: 750000,
    avgRating: 4.8,
    reviewCount: 12
  }

  const dailyViews = [
    { date: '01/20', views: 12 },
    { date: '01/21', views: 18 },
    { date: '01/22', views: 15 },
    { date: '01/23', views: 22 },
    { date: '01/24', views: 19 },
    { date: '01/25', views: 25 },
    { date: '01/26', views: 20 }
  ]

  return <ServiceStatisticsClient stats={stats} dailyViews={dailyViews} serviceId={serviceId} />
}
