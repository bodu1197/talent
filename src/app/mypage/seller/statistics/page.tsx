import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerStatisticsClient from './SellerStatisticsClient'

export default async function SellerStatisticsPage() {
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

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get views statistics
  const [todayViewsResult, weeklyViewsResult, monthlyViewsResult] = await Promise.all([
    supabase.from('service_views').select('*', { count: 'exact', head: true })
      .eq('seller_id', seller.id)
      .gte('created_at', today.toISOString()),
    supabase.from('service_views').select('*', { count: 'exact', head: true })
      .eq('seller_id', seller.id)
      .gte('created_at', weekAgo.toISOString()),
    supabase.from('service_views').select('*', { count: 'exact', head: true })
      .eq('seller_id', seller.id)
      .gte('created_at', monthStart.toISOString())
  ])

  // Get orders statistics
  const [todayOrdersResult, weeklyOrdersResult, monthlyOrdersResult] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .eq('seller_id', seller.id)
      .gte('created_at', today.toISOString()),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .eq('seller_id', seller.id)
      .gte('created_at', weekAgo.toISOString()),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .eq('seller_id', seller.id)
      .gte('created_at', monthStart.toISOString())
  ])

  const stats = {
    todayViews: todayViewsResult.count || 0,
    weeklyViews: weeklyViewsResult.count || 0,
    monthlyViews: monthlyViewsResult.count || 0,
    todayOrders: todayOrdersResult.count || 0,
    weeklyOrders: weeklyOrdersResult.count || 0,
    monthlyOrders: monthlyOrdersResult.count || 0
  }

  // Get top services by orders
  const { data: services } = await supabase
    .from('services')
    .select('id, title')
    .eq('seller_id', seller.id)
    .limit(10)

  let topServices: any[] = []
  if (services) {
    const servicesWithStats = await Promise.all(
      services.map(async (service: any) => {
        const [{ count: viewCount }, { count: orderCount }] = await Promise.all([
          supabase.from('service_views').select('*', { count: 'exact', head: true })
            .eq('service_id', service.id)
            .gte('created_at', monthStart.toISOString()),
          supabase.from('orders').select('*', { count: 'exact', head: true })
            .eq('service_id', service.id)
            .gte('created_at', monthStart.toISOString())
        ])

        return {
          id: service.id,
          name: service.title,
          views: viewCount || 0,
          orders: orderCount || 0
        }
      })
    )

    topServices = servicesWithStats.sort((a, b) => b.orders - a.orders).slice(0, 3)
  }

  return <SellerStatisticsClient stats={stats} topServices={topServices} />
}
