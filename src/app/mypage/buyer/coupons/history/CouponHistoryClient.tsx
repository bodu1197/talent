'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import Link from 'next/link'

interface HistoryItem {
  id: string
  type: 'coupon' | 'cash'
  name: string
  amount: number
  date: string
  order: string | null
}

interface CouponHistoryClientProps {
  history: HistoryItem[]
}

export default function CouponHistoryClient({ history }: CouponHistoryClientProps) {
  return (
    <>

      <Header />

      <div className="flex min-h-screen bg-gray-50 pt-16">

        <MobileSidebar mode="buyer" />
        <Sidebar mode="buyer" />

        <main className="flex-1 overflow-y-auto w-full flex flex-col items-center">

          <div className="w-full max-w-[1200px] px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">사용 내역</h1>
          <p className="text-gray-600">쿠폰 및 캐시 사용 내역을 확인하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center">
            <Link
              href="/mypage/buyer/coupons"
              className="flex-1 px-6 py-4 font-medium text-sm border-b-2 border-transparent text-gray-600 hover:text-gray-900 text-center"
            >
              보유 쿠폰
            </Link>
            <Link
              href="/mypage/buyer/coupons/history"
              className="flex-1 px-6 py-4 font-medium text-sm border-b-2 border-[#0f3460] text-[#0f3460] text-center"
            >
              사용 내역
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {history.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">날짜</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">구분</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">내용</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'coupon' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type === 'coupon' ? '쿠폰' : '캐시'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.name}
                      {item.order && (
                        <span className="ml-2 text-xs text-gray-500">
                          (주문 #{item.order})
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium text-right ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <i className="fas fa-history text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-500">사용 내역이 없습니다</p>
            </div>
          )}
        </div>
          </div>
          <Footer />
        </main>

      </div>

      </>
  )
}
