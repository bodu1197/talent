'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import Link from 'next/link'

interface BuyerCouponsClientProps {
  coupons: any[]
  wallet: any
}

export default function BuyerCouponsClient({ coupons, wallet }: BuyerCouponsClientProps) {
  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <MobileSidebar mode="buyer" />
        <Sidebar mode="buyer" />
        <main className="flex-1 overflow-y-auto w-full flex flex-col items-center">
          <div className="w-full max-w-[1200px] px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">쿠폰/캐시</h1>
          <p className="text-gray-600">보유한 쿠폰과 캐시를 관리하세요</p>
        </div>

        {/* 캐시 잔액 */}
        <div className="bg-[#0f3460] rounded-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">보유 캐시</div>
              <div className="text-4xl font-bold">{wallet?.balance?.toLocaleString() || '0'}원</div>
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
              보유 쿠폰 ({coupons.length})
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
          {coupons.length > 0 ? (
            coupons.map((userCoupon) => {
              const coupon = userCoupon.coupon
              return (
                <div key={userCoupon.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{coupon.name}</h3>
                      <div className="text-sm text-gray-600 mb-1">
                        {coupon.discount_type === 'fixed'
                          ? `${coupon.discount_value.toLocaleString()}원 할인`
                          : `${coupon.discount_value}% 할인${coupon.max_discount ? ` (최대 ${coupon.max_discount.toLocaleString()}원)` : ''}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {coupon.min_amount > 0 ? `${coupon.min_amount.toLocaleString()}원 이상 구매 시 사용 가능` : '제한 없음'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#0f3460] mb-2">
                        {coupon.discount_type === 'fixed'
                          ? `${coupon.discount_value.toLocaleString()}원`
                          : `${coupon.discount_value}%`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(userCoupon.expires_at).toLocaleDateString('ko-KR')}까지
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <i className="fas fa-ticket text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-500">보유 중인 쿠폰이 없습니다</p>
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
