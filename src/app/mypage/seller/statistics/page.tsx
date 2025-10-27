'use client'

import Sidebar from '@/components/mypage/Sidebar'

export default function SellerStatisticsPage() {
  const stats = {
    todayViews: 42,
    weeklyViews: 312,
    monthlyViews: 1240,
    todayOrders: 2,
    weeklyOrders: 8,
    monthlyOrders: 24
  }

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">통계/분석</h1>
          <p className="text-gray-600">판매 통계를 확인하세요</p>
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
                <span className="text-lg font-bold text-[#0f3460]">{stats.todayOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 주</span>
                <span className="text-lg font-bold text-[#0f3460]">{stats.weeklyOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 달</span>
                <span className="text-lg font-bold text-[#0f3460]">{stats.monthlyOrders}</span>
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">인기 서비스</h2>
          <div className="space-y-4">
            {[
              { name: '로고 디자인', views: 342, orders: 15 },
              { name: '영상 편집', views: 521, orders: 23 },
              { name: '명함 디자인', views: 189, orders: 8 }
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-600">조회 {service.views} • 주문 {service.orders}</div>
                </div>
                <div className="text-lg font-bold text-[#0f3460]">
                  {((service.orders / service.views) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
