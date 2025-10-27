'use client'

import Sidebar from '@/components/mypage/Sidebar'
import StatCard from '@/components/mypage/StatCard'
import Link from 'next/link'

export default function SellerDashboardPage() {
  // TODO: 실제 데이터는 API에서 가져와야 합니다
  const stats = {
    todayRevenue: '350,000',
    weeklyRevenue: '1,420,000',
    monthlyRevenue: '5,800,000',
    expertGrade: '골드'
  }

  const alerts = [
    { id: 1, type: 'new_order', message: '신규 주문 2건 - 확인 필요', count: 2, href: '/mypage/seller/orders?status=new' },
    { id: 2, type: 'revision', message: '수정 요청 1건 - 대응 필요', count: 1, href: '/mypage/seller/orders?status=revision' },
    { id: 3, type: 'review', message: '리뷰 답변 대기 3건', count: 3, href: '/mypage/seller/reviews' }
  ]

  const recentOrders = [
    {
      id: '12345',
      title: '로고 디자인',
      buyerName: '홍길동',
      status: 'new',
      statusLabel: '신규 주문',
      price: 50000,
      createdAt: '2025-01-27 14:30'
    },
    {
      id: '12344',
      title: '영상 편집',
      buyerName: '김철수',
      status: 'in_progress',
      statusLabel: '진행중',
      price: 150000,
      createdAt: '2025-01-26 10:15'
    }
  ]

  const orderStats = {
    inProgress: 8,
    delivered: 3,
    completedThisMonth: 42
  }

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">판매 대시보드</h1>
          <p className="text-gray-600">전체 판매 현황을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="오늘 매출"
            value={`${stats.todayRevenue}원`}
            icon="fa-won-sign"
            color="blue"
          />
          <StatCard
            title="이번주 매출"
            value={`${stats.weeklyRevenue}원`}
            icon="fa-calendar-week"
            color="green"
          />
          <StatCard
            title="이번달 매출"
            value={`${stats.monthlyRevenue}원`}
            icon="fa-calendar"
            color="purple"
          />
          <StatCard
            title="전문가 등급"
            value={stats.expertGrade}
            icon="fa-trophy"
            color="yellow"
          />
        </div>

        {/* 알림 */}
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
                className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <span className="text-gray-700 font-medium">진행중</span>
                <span className="text-2xl font-bold text-yellow-600">{orderStats.inProgress}건</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">완료 대기</span>
                <span className="text-2xl font-bold text-blue-600">{orderStats.delivered}건</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">이번달 완료</span>
                <span className="text-2xl font-bold text-green-600">{orderStats.completedThisMonth}건</span>
              </div>
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
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#0f3460] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">#{order.id}</span>
                      <span className="text-base font-bold text-gray-900">{order.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{order.buyerName}</span>
                      <span>•</span>
                      <span className={`font-medium ${
                        order.status === 'new' ? 'text-red-500' : 'text-yellow-600'
                      }`}>
                        {order.statusLabel}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-gray-900">{order.price.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/mypage/seller/orders/${order.id}`}
                    className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
                  >
                    {order.status === 'new' ? '주문 확인' : '작업 상태 업데이트'}
                  </Link>
                  <Link
                    href={`/mypage/messages?order=${order.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    메시지 보내기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
