'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatCard from '@/components/admin/common/StatCard'
import Badge from '@/components/admin/common/Badge'
import type { DashboardStats } from '@/types/admin'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), [])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    activeBuyers: 0,
    activeSellers: 0,
    verifiedSellers: 0,
    totalServices: 0,
    pendingServices: 0,
    activeServices: 0,
    suspendedServices: 0,
    totalOrders: 0,
    todayOrders: 0,
    thisWeekOrders: 0,
    thisMonthOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todayRevenue: 0,
    thisWeekRevenue: 0,
    thisMonthRevenue: 0,
    totalRevenue: 0,
    platformFeeRevenue: 0,
    pendingReports: 0,
    activeDisputes: 0,
    pendingSettlements: 0,
    pendingReviews: 0,
  })

  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      // Fetch all stats in parallel
      const [
        { count: totalUsers },
        { count: activeBuyers },
        { count: activeSellers },
        { count: totalServices },
        { count: pendingServices },
        { count: activeServices },
        { count: totalOrders },
        { count: inProgressOrders },
        { count: completedOrders },
        { data: ordersData },
        { count: pendingReports },
        { count: activeDisputes },
        { count: pendingSettlements },
        { data: recentOrdersData },
        { data: recentReportsData },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'buyer'),
        supabase.from('users').select('*', { count: 'exact', head: true }).in('user_type', ['seller', 'both']),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['paid', 'in_progress', 'delivered']),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('orders').select('total_amount, platform_fee, created_at'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_review']),
        supabase.from('settlements').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase
          .from('orders')
          .select('id, order_number, total_amount, status, created_at, buyer:users!buyer_id(name), service:services(title)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('reports')
          .select('id, category, status, created_at, reporter:users!reporter_id(name)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      // Calculate revenue stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thisWeekStart = new Date(today)
      thisWeekStart.setDate(today.getDate() - 7)
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

      const todayRevenue = ordersData
        ?.filter((o: any) => new Date(o.created_at) >= today)
        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0

      const thisWeekRevenue = ordersData
        ?.filter((o: any) => new Date(o.created_at) >= thisWeekStart)
        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0

      const thisMonthRevenue = ordersData
        ?.filter((o: any) => new Date(o.created_at) >= thisMonthStart)
        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0

      const totalRevenue = ordersData?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0

      const platformFeeRevenue = ordersData?.reduce((sum: number, o: any) => sum + (o.platform_fee || 0), 0) || 0

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        activeBuyers: activeBuyers || 0,
        activeSellers: activeSellers || 0,
        verifiedSellers: 0,
        totalServices: totalServices || 0,
        pendingServices: pendingServices || 0,
        activeServices: activeServices || 0,
        suspendedServices: 0,
        totalOrders: totalOrders || 0,
        todayOrders: 0,
        thisWeekOrders: 0,
        thisMonthOrders: 0,
        inProgressOrders: inProgressOrders || 0,
        completedOrders: completedOrders || 0,
        cancelledOrders: 0,
        todayRevenue,
        thisWeekRevenue,
        thisMonthRevenue,
        totalRevenue,
        platformFeeRevenue,
        pendingReports: pendingReports || 0,
        activeDisputes: activeDisputes || 0,
        pendingSettlements: pendingSettlements || 0,
        pendingReviews: 0,
      })

      setRecentOrders(recentOrdersData || [])
      setRecentReports(recentReportsData || [])
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3460]"></div>
          <p className="mt-4 text-gray-600">데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-1">플랫폼 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* KPI Cards - Row 1: User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 회원"
          value={stats.totalUsers}
          icon="fa-users"
          color="blue"
          subtitle={`구매자 ${stats.activeBuyers} / 판매자 ${stats.activeSellers}`}
        />
        <StatCard
          title="오늘 매출"
          value={`${(stats.todayRevenue / 10000).toFixed(0)}만원`}
          icon="fa-won-sign"
          color="green"
          subtitle={`이번 달 ${(stats.thisMonthRevenue / 10000).toFixed(0)}만원`}
        />
        <StatCard
          title="진행중 주문"
          value={stats.inProgressOrders}
          icon="fa-shopping-cart"
          color="purple"
          subtitle={`전체 ${stats.totalOrders}건`}
        />
        <StatCard
          title="대기중 신고"
          value={stats.pendingReports}
          icon="fa-flag"
          color="red"
          subtitle={`분쟁 ${stats.activeDisputes}건`}
        />
      </div>

      {/* KPI Cards - Row 2: Service & Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="승인 대기 서비스"
          value={stats.pendingServices}
          icon="fa-clock"
          color="yellow"
          subtitle={`활성 ${stats.activeServices}건`}
        />
        <StatCard
          title="완료된 주문"
          value={stats.completedOrders}
          icon="fa-check-circle"
          color="green"
          subtitle={`전체 주문의 ${stats.totalOrders ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%`}
        />
        <StatCard
          title="정산 대기"
          value={stats.pendingSettlements}
          icon="fa-credit-card"
          color="blue"
          subtitle="판매자 정산 요청"
        />
        <StatCard
          title="플랫폼 수수료"
          value={`${(stats.platformFeeRevenue / 10000).toFixed(0)}만원`}
          icon="fa-chart-line"
          color="purple"
          subtitle="누적 수수료 수익"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 액션</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/services?status=pending"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f3460] hover:bg-[#0f3460]/5 transition-all text-center"
          >
            <i className="fas fa-check-circle text-2xl text-[#0f3460] mb-2"></i>
            <div className="font-semibold text-gray-900">서비스 승인</div>
            <div className="text-sm text-gray-500">{stats.pendingServices}건 대기</div>
          </Link>
          <Link
            href="/admin/reports?status=pending"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-center"
          >
            <i className="fas fa-flag text-2xl text-red-500 mb-2"></i>
            <div className="font-semibold text-gray-900">신고 처리</div>
            <div className="text-sm text-gray-500">{stats.pendingReports}건 대기</div>
          </Link>
          <Link
            href="/admin/disputes?status=open"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-center"
          >
            <i className="fas fa-gavel text-2xl text-orange-500 mb-2"></i>
            <div className="font-semibold text-gray-900">분쟁 중재</div>
            <div className="text-sm text-gray-500">{stats.activeDisputes}건 진행중</div>
          </Link>
          <Link
            href="/admin/settlements?status=pending"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center"
          >
            <i className="fas fa-money-bill-wave text-2xl text-green-500 mb-2"></i>
            <div className="font-semibold text-gray-900">정산 승인</div>
            <div className="text-sm text-gray-500">{stats.pendingSettlements}건 대기</div>
          </Link>
        </div>
      </div>

      {/* Recent Orders & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">최근 주문</h2>
            <Link href="/admin/orders" className="text-sm text-[#0f3460] hover:underline">
              전체보기 →
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <i className="fas fa-inbox text-4xl mb-3"></i>
                <p>최근 주문이 없습니다</p>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="p-4 hover:bg-gray-50 transition-colors block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{order.order_number}</span>
                    <Badge variant={order.status === 'completed' ? 'success' : 'info'} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{order.service?.title}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{order.buyer?.name}</span>
                    <span className="font-semibold text-[#0f3460]">
                      {order.total_amount?.toLocaleString()}원
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">최근 신고</h2>
            <Link href="/admin/reports" className="text-sm text-[#0f3460] hover:underline">
              전체보기 →
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentReports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <i className="fas fa-shield-alt text-4xl mb-3"></i>
                <p>최근 신고가 없습니다</p>
              </div>
            ) : (
              recentReports.map((report: any) => (
                <Link
                  key={report.id}
                  href={`/admin/reports/${report.id}`}
                  className="p-4 hover:bg-gray-50 transition-colors block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="warning" size="sm">
                      {report.category}
                    </Badge>
                    <Badge variant={report.status === 'pending' ? 'error' : 'gray'} size="sm">
                      {report.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">신고자: {report.reporter?.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(report.created_at).toLocaleString('ko-KR')}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
