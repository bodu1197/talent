'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import Link from 'next/link'

interface Props {
  stats: {
    serviceName: string
    period: string
    viewCount: number
    favoriteCount: number
    orderCount: number
    revenue: number
    avgRating: number
    reviewCount: number
  }
  dailyViews: Array<{ date: string; views: number }>
  ratingPercentages: number[]
  serviceId?: string
}

export default function ServiceStatisticsClient({ stats, dailyViews, ratingPercentages, serviceId }: Props) {
  return (
    <>

      <Header />

      <div className="flex min-h-screen bg-gray-50 pt-16">

        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />

        <main className="flex-1 overflow-y-auto w-full flex flex-col items-center">

          <div className="w-full max-w-[1200px] px-4 py-4 sm:py-6 lg:py-8">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage/seller/services"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>서비스 관리로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">서비스 통계</h1>
          <p className="text-gray-600">{stats.serviceName} - {stats.period}</p>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">조회수</span>
              <i className="fas fa-eye text-blue-500 text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.viewCount}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">찜</span>
              <i className="fas fa-heart text-red-500 text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.favoriteCount}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">주문 수</span>
              <i className="fas fa-shopping-cart text-green-500 text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.orderCount}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">매출</span>
              <i className="fas fa-sack-dollar text-purple-500 text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.revenue.toLocaleString()}원</div>
          </div>
        </div>

        {/* 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 조회수 추이 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">일별 조회수</h2>
            <div className="space-y-2">
              {dailyViews.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{day.date}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-[#0f3460] h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(day.views / 25) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{day.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 평점 분포 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">평점 분포</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-gray-900">{stats.avgRating}</div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className={`fas fa-star ${star <= Math.floor(stats.avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                  ))}
                </div>
                <div className="text-sm text-gray-600">{stats.reviewCount}개의 리뷰</div>
              </div>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating, index) => {
                const percentage = ratingPercentages[rating - 1] || 0
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-12">{rating}점</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{percentage.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 전환율 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">전환율</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">조회 → 찜</div>
              <div className="text-2xl font-bold text-gray-900">{((stats.favoriteCount / stats.viewCount) * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">조회 → 주문</div>
              <div className="text-2xl font-bold text-gray-900">{((stats.orderCount / stats.viewCount) * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">찜 → 주문</div>
              <div className="text-2xl font-bold text-gray-900">{((stats.orderCount / stats.favoriteCount) * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
          </div>
          <Footer />
        </main>

      </div>

      </>
  )
}
