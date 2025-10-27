'use client'

import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

export default function BuyerCouponsPage() {
  const mockCoupons = [
    {
      id: '1',
      name: '신규 가입 축하 쿠폰',
      discount: 5000,
      minAmount: 30000,
      expiresAt: '2025-03-31',
      type: 'fixed'
    },
    {
      id: '2',
      name: '10% 할인 쿠폰',
      discount: 10,
      minAmount: 50000,
      expiresAt: '2025-02-28',
      type: 'percent'
    }
  ]

  const cashBalance = 5000

  return (
    <>
      <Sidebar mode="buyer" />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">쿠폰/캐시</h1>
          <p className="text-gray-600">보유한 쿠폰과 캐시를 관리하세요</p>
        </div>

        {/* 캐시 잔액 */}
        <div className="bg-gradient-to-r from-[#0f3460] to-[#1a4b7d] rounded-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">보유 캐시</div>
              <div className="text-4xl font-bold">{cashBalance.toLocaleString()}원</div>
            </div>
            <Link
              href="/mypage/buyer/coupons/charge"
              className="px-6 py-3 bg-white text-[#0f3460] rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              충전하기
            </Link>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center">
            <Link
              href="/mypage/buyer/coupons"
              className="flex-1 px-6 py-4 font-medium text-sm border-b-2 border-[#0f3460] text-[#0f3460] text-center"
            >
              보유 쿠폰 ({mockCoupons.length})
            </Link>
            <Link
              href="/mypage/buyer/coupons/history"
              className="flex-1 px-6 py-4 font-medium text-sm border-b-2 border-transparent text-gray-600 hover:text-gray-900 text-center"
            >
              사용 내역
            </Link>
          </div>
        </div>

        {/* 쿠폰 목록 */}
        <div className="space-y-4">
          {mockCoupons.map((coupon) => (
            <div key={coupon.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{coupon.name}</h3>
                  <div className="text-sm text-gray-600 mb-1">
                    {coupon.type === 'fixed'
                      ? `${coupon.discount.toLocaleString()}원 할인`
                      : `${coupon.discount}% 할인`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {coupon.minAmount.toLocaleString()}원 이상 구매 시 사용 가능
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#0f3460] mb-2">
                    {coupon.type === 'fixed'
                      ? `${coupon.discount.toLocaleString()}원`
                      : `${coupon.discount}%`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {coupon.expiresAt}까지
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
