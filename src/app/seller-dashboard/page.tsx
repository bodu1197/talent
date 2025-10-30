'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import StatCard from '@/components/mypage/StatCard'
import Link from 'next/link'

export default function SellerDashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar mode="seller" />
      <MobileSidebar mode="seller" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* 헤더 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">판매자 대시보드</h1>
          <p className="text-sm md:text-base text-gray-600">
            안녕하세요! 오늘도 좋은 하루 되세요 😊
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="신규 주문"
            value="0"
            icon="📦"
            change="+0%"
            changeType="increase"
            href="/mypage/seller/orders?status=paid"
          />
          <StatCard
            title="진행중인 작업"
            value="0"
            icon="⚙️"
            change="+0%"
            changeType="increase"
          />
          <StatCard
            title="이번달 수익"
            value="₩0"
            icon="💰"
            change="+0%"
            changeType="increase"
          />
          <StatCard
            title="평균 평점"
            value="0.0"
            icon="⭐"
            change="+0.0"
            changeType="increase"
          />
        </div>

        {/* 주문 현황 */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">주문 현황</h2>
            <Link
              href="/mypage/seller/orders"
              className="text-sm text-[#0f3460] hover:underline"
            >
              전체보기 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/mypage/seller/orders?status=in_progress"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#0f3460] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">진행중</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="text-3xl">🔄</div>
              </div>
            </Link>

            <Link
              href="/mypage/seller/orders?status=delivered"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#0f3460] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">완료 대기</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="text-3xl">⏰</div>
              </div>
            </Link>

            <Link
              href="/mypage/seller/orders?status=completed"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#0f3460] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">완료</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </Link>
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">최근 주문</h2>

          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-base">아직 주문이 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">새로운 주문이 들어오면 여기에 표시됩니다</p>
          </div>
        </div>
      </main>
    </div>
  )
}
