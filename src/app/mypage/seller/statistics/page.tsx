'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface StatisticsData {
  todayViews: number
  weeklyViews: number
  monthlyViews: number
  todayOrders: number
  weeklyOrders: number
  monthlyOrders: number
}

interface ServiceStats {
  id: string
  name: string
  views: number
  orders: number
}

export default function SellerStatisticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatisticsData>({
    todayViews: 0,
    weeklyViews: 0,
    monthlyViews: 0,
    todayOrders: 0,
    weeklyOrders: 0,
    monthlyOrders: 0
  })
  const [topServices, setTopServices] = useState<ServiceStats[]>([])

  useEffect(() => {
    if (user) {
      loadStatistics()
    }
  }, [user])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get seller_id
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user!.id)
        .single()

      if (!seller) {
        setLoading(false)
        return
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      // Get views statistics (if service_views table exists)
      const viewsPromises = [
        supabase.from('service_views').select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .gte('created_at', today.toISOString()),
        supabase.from('service_views').select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .gte('created_at', weekAgo.toISOString()),
        supabase.from('service_views').select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .gte('created_at', monthStart.toISOString())
      ]

      // Get orders statistics
      const ordersPromises = [
        supabase.from('orders').select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .gte('created_at', today.toISOString()),
        supabase.from('orders').select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .gte('created_at', weekAgo.toISOString()),
        supabase.from('orders').select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .gte('created_at', monthStart.toISOString())
      ]

      const [
        todayViewsResult, weeklyViewsResult, monthlyViewsResult,
        todayOrdersResult, weeklyOrdersResult, monthlyOrdersResult
      ] = await Promise.all([...viewsPromises, ...ordersPromises])

      setStats({
        todayViews: todayViewsResult.count || 0,
        weeklyViews: weeklyViewsResult.count || 0,
        monthlyViews: monthlyViewsResult.count || 0,
        todayOrders: todayOrdersResult.count || 0,
        weeklyOrders: weeklyOrdersResult.count || 0,
        monthlyOrders: monthlyOrdersResult.count || 0
      })

      // Get top services by orders
      const { data: services } = await supabase
        .from('services')
        .select(`
          id,
          title,
          orders:orders(count)
        `)
        .eq('seller_id', seller.id)
        .gte('orders.created_at', monthStart.toISOString())
        .limit(5)

      if (services) {
        // Transform and get view counts for each service
        const servicesWithStats = await Promise.all(
          services.map(async (service: any) => {
            const { count: viewCount } = await supabase
              .from('service_views')
              .select('*', { count: 'exact', head: true })
              .eq('service_id', service.id)
              .gte('created_at', monthStart.toISOString())

            return {
              id: service.id,
              name: service.title,
              views: viewCount || 0,
              orders: service.orders?.length || 0
            }
          })
        )

        // Sort by orders and take top 3
        setTopServices(servicesWithStats.sort((a, b) => b.orders - a.orders).slice(0, 3))
      }

    } catch (error) {
      console.error('통계 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-8">
          <LoadingSpinner message="통계를 불러오는 중..." />
        </main>
      </>
    )
  }

  return (
    <>
      <MobileSidebar mode="seller" />
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">통계/분석</h1>
          <p className="text-sm sm:text-base text-gray-600">판매 통계를 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">조회수</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">오늘</span>
                <span className="text-lg font-bold text-gray-900">{stats.todayViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 주</span>
                <span className="text-lg font-bold text-gray-900">{stats.weeklyViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 달</span>
                <span className="text-lg font-bold text-gray-900">{stats.monthlyViews}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">주문 수</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">오늘</span>
                <span className="text-lg font-bold text-brand-primary">{stats.todayOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 주</span>
                <span className="text-lg font-bold text-brand-primary">{stats.weeklyOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 달</span>
                <span className="text-lg font-bold text-brand-primary">{stats.monthlyOrders}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">전환율</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">오늘</span>
                <span className="text-lg font-bold text-green-600">{((stats.todayOrders / stats.todayViews) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 주</span>
                <span className="text-lg font-bold text-green-600">{((stats.weeklyOrders / stats.weeklyViews) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 달</span>
                <span className="text-lg font-bold text-green-600">{((stats.monthlyOrders / stats.monthlyViews) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">인기 서비스 (이번 달)</h2>
          {topServices.length > 0 ? (
            <div className="space-y-4">
              {topServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg card-interactive">
                  <div>
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-600">조회 {service.views} • 주문 {service.orders}</div>
                  </div>
                  <div className="text-lg font-bold text-brand-primary">
                    {service.views > 0 ? ((service.orders / service.views) * 100).toFixed(1) : '0.0'}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-line text-4xl mb-2"></i>
              <p>아직 통계 데이터가 없습니다</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
