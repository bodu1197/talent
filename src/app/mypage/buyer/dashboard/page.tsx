'use client'

import Sidebar from '@/components/mypage/Sidebar'
import StatCard from '@/components/mypage/StatCard'
import Link from 'next/link'

export default function BuyerDashboardPage() {
  // TODO: 실제 데이터는 API에서 가져와야 합니다
  const stats = {
    inProgressOrders: 2,
    deliveredOrders: 1,
    pendingReviews: 3,
    monthlyPurchases: 5
  }

  const alerts = [
    { id: 1, type: 'delivered', message: '작업 완료 도착 1건 - 확인 필요', href: '/mypage/buyer/orders?status=delivered' },
    { id: 2, type: 'review', message: '리뷰 작성 가능 3건', href: '/mypage/buyer/reviews?tab=pending' },
    { id: 3, type: 'message', message: '새 메시지 2건', href: '/mypage/messages' }
  ]

  const inProgressOrders = [
    {
      id: '12345',
      title: '로고 디자인',
      sellerName: '디자인스튜디오',
      status: 'in_progress',
      statusLabel: '작업중',
      daysLeft: 3,
      price: 50000,
      thumbnailUrl: null
    },
    {
      id: '12344',
      title: '영상 편집',
      sellerName: '비디오프로',
      status: 'delivered',
      statusLabel: '도착 확인 대기',
      daysLeft: null,
      price: 150000,
      thumbnailUrl: null
    }
  ]

  const favorites = [
    { id: 1, title: '로고 제작', seller: '디자인A' },
    { id: 2, title: '명함 디자인', seller: '인쇄소B' }
  ]

  const benefits = {
    coupons: 3,
    cash: 5000
  }

  return (
    <>
      <Sidebar mode="buyer" />
      <main className="flex-1 p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">구매 대시보드</h1>
          <p className="text-gray-600">주문 현황을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="진행중 주문"
            value={`${stats.inProgressOrders}건`}
            icon="fa-spinner"
            color="yellow"
          />
          <StatCard
            title="도착 확인 대기"
            value={`${stats.deliveredOrders}건`}
            icon="fa-box-open"
            color="blue"
          />
          <StatCard
            title="작성 가능 리뷰"
            value={`${stats.pendingReviews}건`}
            icon="fa-star"
            color="purple"
          />
          <StatCard
            title="이번달 구매"
            value={`${stats.monthlyPurchases}건`}
            icon="fa-shopping-cart"
            color="green"
          />
        </div>

        {/* 알림 */}
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
            {inProgressOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#0f3460] transition-colors"
              >
                <div className="flex gap-4">
                  {/* 썸네일 */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {order.thumbnailUrl ? (
                      <img src={order.thumbnailUrl} alt={order.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <i className="fas fa-image text-gray-400 text-2xl"></i>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500">#{order.id}</span>
                          <span className="text-base font-bold text-gray-900">{order.title}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          판매자: {order.sellerName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.statusLabel}
                      </span>
                      {order.daysLeft && (
                        <span className="text-sm text-gray-600">D-{order.daysLeft}일</span>
                      )}
                      <span className="text-sm font-bold text-gray-900">{order.price.toLocaleString()}원</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/mypage/buyer/orders/${order.id}`}
                        className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
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
            ))}
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
                href="/mypage/buyer/favorites"
                className="text-sm text-[#0f3460] hover:underline"
              >
                전체 보기
              </Link>
            </div>
            <div className="space-y-3">
              {favorites.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.seller}</div>
                  </div>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                </div>
              ))}
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
                    <div className="text-2xl font-bold text-purple-600">{benefits.coupons}장</div>
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
                    <div className="text-2xl font-bold text-blue-600">{benefits.cash.toLocaleString()}원</div>
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
