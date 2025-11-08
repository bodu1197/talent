'use client'

import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import StatCard from '@/components/mypage/StatCard'
import Header from '@/components/layout/Header'
import Link from 'next/link'

type Stats = {
  newOrders: number
  inProgressOrders: number
  deliveredOrders: number
  monthlyRevenue: number
}

type Order = {
  id: string
  order_number?: string
  title?: string
  status: string
  total_amount?: number
  service?: {
    title: string
  }
  buyer?: {
    name: string
  }
}

type Props = {
  stats: Stats
  recentOrders: Order[]
}

export default function SellerDashboardClient({ stats, recentOrders }: Props) {
  // Generate alerts based on real data
  const alerts = []
  if (stats?.newOrders > 0) {
    alerts.push({
      id: 1,
      type: 'new_order',
      message: `신규 주문 ${stats.newOrders}건 - 확인 필요`,
      count: stats.newOrders,
      href: '/mypage/seller/orders?status=paid'
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return '신규 주문'
      case 'in_progress': return '진행중'
      case 'delivered': return '완료 대기'
      case 'completed': return '완료'
      case 'cancelled': return '취소/환불'
      default: return status
    }
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto">
          <div className="container-1200 py-4 sm:py-6 lg:py-8">
            {/* 페이지 헤더 */}
            <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">판매 대시보드</h1>
              <p className="text-sm sm:text-base text-gray-600">전체 판매 현황을 확인하세요</p>
            </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="신규 주문"
            value={`${stats?.newOrders || 0}건`}
            icon="fa-shopping-cart"
            color="red"
          />
          <StatCard
            title="진행중 주문"
            value={`${stats?.inProgressOrders || 0}건`}
            icon="fa-spinner"
            color="yellow"
          />
          <StatCard
            title="완료 대기"
            value={`${stats?.deliveredOrders || 0}건`}
            icon="fa-box-open"
            color="blue"
          />
          <StatCard
            title="이번달 매출"
            value={`${stats?.monthlyRevenue?.toLocaleString() || '0'}원`}
            icon="fa-won-sign"
            color="green"
          />
        </div>

        {/* 알림 */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-bell text-red-500"></i>
              알림 (우선순위 높은 것)
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors card-interactive"
                >
                  <div className="flex items-center gap-3">
                    <i className="fas fa-exclamation-circle text-red-500"></i>
                    <span className="text-gray-900 font-medium">{alert.message}</span>
                  </div>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 최근 7일 매출 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-chart-line text-blue-500"></i>
              최근 7일 매출
            </h2>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="fas fa-chart-bar text-4xl mb-2"></i>
                <p>차트 영역 (차트 라이브러리 필요)</p>
              </div>
            </div>
          </div>

          {/* 주문 현황 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-chart-pie text-green-500"></i>
              주문 현황
            </h2>
            <div className="space-y-4">
              <Link
                href="/mypage/seller/orders?status=in_progress"
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors card-interactive"
              >
                <span className="text-gray-700 font-medium">진행중</span>
                <span className="text-2xl font-bold text-yellow-600">{stats?.inProgressOrders || 0}건</span>
              </Link>
              <Link
                href="/mypage/seller/orders?status=delivered"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors card-interactive"
              >
                <span className="text-gray-700 font-medium">완료 대기</span>
                <span className="text-2xl font-bold text-blue-600">{stats?.deliveredOrders || 0}건</span>
              </Link>
              <Link
                href="/mypage/seller/orders?status=completed"
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors card-interactive"
              >
                <span className="text-gray-700 font-medium">이번달 완료</span>
                <span className="text-2xl font-bold text-green-600">{stats?.monthlyRevenue ? Math.floor(stats.monthlyRevenue / 50000) : 0}건</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-box text-purple-500"></i>
              최근 주문 (빠른 액션)
            </h2>
            <Link
              href="/mypage/seller/orders"
              className="text-sm text-[#0f3460] hover:underline flex items-center gap-1"
            >
              전체 보기 <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#0f3460] transition-colors card-interactive"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">#{order.order_number || order.id.slice(0, 8)}</span>
                        <span className="text-base font-bold text-gray-900">{order.title || order.service?.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{order.buyer?.name || '구매자'}</span>
                        <span>•</span>
                        <span className={`font-medium ${
                          order.status === 'paid' ? 'text-red-500' : 'text-yellow-600'
                        }`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-gray-900">{order.total_amount?.toLocaleString() || '0'}원</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/mypage/seller/orders/${order.id}`}
                      className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#0a2540] transition-colors text-sm font-medium click-pop btn-ripple"
                    >
                      {order.status === 'paid' ? '주문 확인' : '작업 상태 업데이트'}
                    </Link>
                    <Link
                      href={`/mypage/messages?order=${order.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium click-pop"
                    >
                      메시지 보내기
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                최근 주문이 없습니다
              </div>
            )}
          </div>
        </div>
          </div>
        </main>
      </div>
    </>
  )
}
