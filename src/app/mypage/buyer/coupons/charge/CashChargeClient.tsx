'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

export default function CashChargeClient() {
  const [amount, setAmount] = useState(10000)

  const presetAmounts = [10000, 30000, 50000, 100000, 300000, 500000]

  return (
    <>

      <Header />

      <div className="flex min-h-screen bg-gray-50 pt-16">

        <Sidebar mode="buyer" />

        <main className="flex-1 overflow-y-auto w-full">

          <div className="container-1200 px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <Link href="/mypage/buyer/coupons" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <i className="fas fa-arrow-left"></i>
            <span>쿠폰/캐시로</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">캐시 충전</h1>
          <p className="text-gray-600">원하는 금액을 충전하세요</p>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">충전 금액 선택</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    amount === preset
                      ? 'bg-[#0f3460] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.toLocaleString()}원
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직접 입력</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">결제 수단</h2>
            <div className="space-y-2">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#0f3460] transition-colors">
                <input type="radio" name="payment" className="w-4 h-4 text-[#0f3460]" defaultChecked />
                <span className="ml-3">신용카드</span>
              </label>
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#0f3460] transition-colors">
                <input type="radio" name="payment" className="w-4 h-4 text-[#0f3460]" />
                <span className="ml-3">계좌이체</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>충전 금액</span>
              <span className="text-[#0f3460]">{amount.toLocaleString()}원</span>
            </div>
          </div>

          <button className="w-full px-6 py-4 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium text-lg">
            <i className="fas fa-credit-card mr-2"></i>
            {amount.toLocaleString()}원 충전하기
          </button>
        </div>
          </div>
          <Footer />
        </main>

      </div>

      </>
  )
}
