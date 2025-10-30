'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import StatCard from '@/components/mypage/StatCard'
import Link from 'next/link'

export default function BuyerDashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar mode="buyer" />
      <MobileSidebar mode="buyer" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* 헤더 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">구매자 대시보드</h1>
          <p className="text-sm md:text-base text-gray-600">
            안녕하세요! 필요한 서비스를 찾아보세요 😊
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="진행중인 주문"
            value="0"
            icon="fa-box"
            color="blue"
          />
          <StatCard
            title="완료 대기"
            value="0"
            icon="fa-clock"
            color="yellow"
          />
          <StatCard
            title="작성 가능 리뷰"
            value="0"
            icon="fa-pen"
            color="purple"
          />
          <StatCard
            title="보유 캐시"
            value="₩0"
            icon="fa-won-sign"
            color="green"
          />
        </div>

        {/* 최근 주문 */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">최근 주문</h2>
            <Link
              href="/mypage/buyer/orders"
              className="text-sm text-[#0f3460] hover:underline"
            >
              전체보기 →
            </Link>
          </div>

          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-base">아직 주문 내역이 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">서비스를 구매하면 여기에 표시됩니다</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors"
            >
              서비스 둘러보기
            </Link>
          </div>
        </div>

        {/* 찜한 서비스 */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">찜한 서비스</h2>
            <Link
              href="/mypage/buyer/favorites"
              className="text-sm text-[#0f3460] hover:underline"
            >
              전체보기 →
            </Link>
          </div>

          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">❤️</div>
            <p className="text-base">찜한 서비스가 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">마음에 드는 서비스를 찜해보세요</p>
          </div>
        </div>

        {/* 혜택 */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">나의 혜택</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/mypage/buyer/coupons"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#0f3460] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">사용 가능 쿠폰</p>
                  <p className="text-2xl font-bold text-gray-900">0장</p>
                </div>
                <div className="text-3xl">🎟️</div>
              </div>
            </Link>

            <Link
              href="/mypage/buyer/coupons/charge"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#0f3460] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">보유 캐시</p>
                  <p className="text-2xl font-bold text-gray-900">₩0</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
