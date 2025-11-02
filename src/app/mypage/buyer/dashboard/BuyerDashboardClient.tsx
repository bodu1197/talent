'use client'

import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import StatCard from '@/components/mypage/StatCard'
import Link from 'next/link'

type Stats = any
type Order = any
type Favorite = any
type Benefits = any

type Props = {
  stats: Stats
  recentOrders: Order[]
  favorites: Favorite[]
  benefits: Benefits
}

export default function BuyerDashboardClient({ stats, recentOrders, favorites, benefits }: Props) {
  // Generate alerts based on real data
  const alerts = []
  if (stats?.deliveredOrders > 0) {
    alerts.push({
      id: 1,
      type: 'delivered',
      message: `작업 완료 도착 ${stats.deliveredOrders}건 - 확인 필요`,
      href: '/mypage/buyer/orders?status=delivered'
    })
  }
  if (stats?.pendingReviews > 0) {
    alerts.push({
      id: 2,
      type: 'review',
      message: `리뷰 작성 가능 ${stats.pendingReviews}건`,
      href: '/mypage/buyer/reviews?tab=pending'
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return '결제완료'
      case 'in_progress': return '진행중'
      case 'delivered': return '도착 확인 대기'
      case 'completed': return '완료'
      case 'cancelled': return '취소/환불'
      default: return status
    }
  }

  const getDaysLeft = (deliveryDate: string | null | undefined) => {
    if (!deliveryDate) return null
    const days = Math.ceil((new Date(deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : null
  }

  return (
    <>
      <MobileSidebar mode="buyer" />
      <Sidebar mode="buyer" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* 페이지 헤더 */}
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">구매 대시보드</h1>
          <p className="text-sm sm:text-base text-gray-600">주문 현황을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="진행중 주문"
            value={`${stats?.inProgressOrders || 0}건`}
            icon="fa-spinner"
            color="yellow"
          />
          <StatCard
            title="도착 확인 대기"
            value={`${stats?.deliveredOrders || 0}건`}
            icon="fa-box-open"
            color="blue"
          />
          <StatCard
            title="작성 가능 리뷰"
            value={`${stats?.pendingReviews || 0}건`}
            icon="fa-star"
            color="purple"
          />
          <StatCard
            title="이번달 구매"
            value={`${stats?.monthlyPurchases || 0}건`}
            icon="fa-shopping-cart"
            color="green"
          />
        </div>

        {/* 알림 */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-bell text-red-500"></i>
              확인 필요
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    <span className="text-gray-900 font-medium">{alert.message}</span>
                  </div>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 진행중인 주문 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-box text-purple-500"></i>
              진행중인 주문
            </h2>
            <Link
              href="/mypage/buyer/orders"
              className="text-sm text-[#0f3460] hover:underline flex items-center gap-1"
            >
              전체 보기 <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const daysLeft = getDaysLeft(order.delivery_date)
                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-[#0f3460] transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* 썸네일 */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {order.service?.thumbnail_url ? (
                          <img src={order.service.thumbnail_url} alt={order.title || order.service.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <i className="fas fa-image text-gray-400 text-2xl"></i>
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500">#{order.order_number || order.id.slice(0, 8)}</span>
                              <span className="text-base font-bold text-gray-900">{order.title || order.service?.title}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              판매자: {order.seller?.name || '판매자'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {getStatusLabel(order.status)}
                          </span>
                          {daysLeft && (
                            <span className="text-sm text-gray-600">D-{daysLeft}일</span>
                          )}
                          <span className="text-sm font-bold text-gray-900">{order.total_amount?.toLocaleString() || '0'}원</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/mypage/buyer/orders/${order.id}`}
                            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#0a2540] transition-colors text-sm font-medium"
                          >
                            {order.status === 'delivered' ? '확인하기' : '상세보기'}
                          </Link>
                          <Link
                            href={`/mypage/messages?order=${order.id}`}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            메시지
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                진행중인 주문이 없습니다
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 찜한 서비스 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <i className="fas fa-heart text-red-500"></i>
                최근 찜한 서비스
              </h2>
              <Link
                href="/mypage/favorites"
                className="text-sm text-[#0f3460] hover:underline"
              >
                전체 보기
              </Link>
            </div>
            <div className="space-y-3">
              {favorites.length > 0 ? (
                favorites.map((item) => (
                  <Link
                    key={item.id}
                    href={`/services/${item.service?.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{item.service?.title}</div>
                      <div className="text-sm text-gray-600">{item.service?.seller?.name}</div>
                    </div>
                    <i className="fas fa-arrow-right text-gray-400"></i>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  찜한 서비스가 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 보유 혜택 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-gift text-purple-500"></i>
              보유 혜택
            </h2>
            <div className="space-y-4">
              <Link
                href="/mypage/buyer/coupons"
                className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-ticket text-purple-600 text-2xl"></i>
                  <div>
                    <div className="font-medium text-gray-900">쿠폰</div>
                    <div className="text-2xl font-bold text-purple-600">{benefits?.coupons || 0}장</div>
                  </div>
                </div>
                <i className="fas fa-arrow-right text-gray-400"></i>
              </Link>

              <Link
                href="/mypage/buyer/coupons/charge"
                className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-wallet text-blue-600 text-2xl"></i>
                  <div>
                    <div className="font-medium text-gray-900">캐시</div>
                    <div className="text-2xl font-bold text-blue-600">{benefits?.cash?.toLocaleString() || '0'}원</div>
                  </div>
                </div>
                <i className="fas fa-arrow-right text-gray-400"></i>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
