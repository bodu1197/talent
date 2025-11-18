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

  // Get seller's service IDs first
  const { data: sellerServices } = await supabase
    .from('services')
    .select('id')
    .eq('seller_id', seller.id)

  const serviceIds = sellerServices?.map(s => s.id) || []

  // Get views statistics - join with services to filter by seller
  const [todayViewsResult, weeklyViewsResult, monthlyViewsResult] = await Promise.all([
    serviceIds.length > 0
      ? supabase.from('service_views').select('*', { count: 'exact', head: true })
          .in('service_id', serviceIds)
          .gte('viewed_at', today.toISOString())
      : { count: 0 },
    serviceIds.length > 0
      ? supabase.from('service_views').select('*', { count: 'exact', head: true })
          .in('service_id', serviceIds)
          .gte('viewed_at', weekAgo.toISOString())
      : { count: 0 },
    serviceIds.length > 0
      ? supabase.from('service_views').select('*', { count: 'exact', head: true })
          .in('service_id', serviceIds)
          .gte('viewed_at', monthStart.toISOString())
      : { count: 0 }
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

  interface TopService {
    id: string
    name: string
    views: number
    orders: number
  }

  let topServices: TopService[] = []
  if (services) {
    const servicesWithStats = await Promise.all(
      services.map(async (service: { id: string; title: string }) => {
        const [viewsResult, ordersResult] = await Promise.all([
          supabase.from('service_views').select('*', { count: 'exact', head: true })
            .eq('service_id', service.id)
            .gte('viewed_at', monthStart.toISOString()),
          supabase.from('orders').select('*', { count: 'exact', head: true })
            .eq('service_id', service.id)
            .gte('created_at', monthStart.toISOString())
        ])

        return {
          id: service.id,
          name: service.title,
          views: viewsResult.count || 0,
          orders: ordersResult.count || 0
        }
      })
    )

    topServices = servicesWithStats.sort((a, b) => b.orders - a.orders).slice(0, 3)
  }

  return <SellerStatisticsClient stats={stats} topServices={topServices} />
}
