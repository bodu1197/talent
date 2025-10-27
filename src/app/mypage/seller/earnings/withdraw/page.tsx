'use client'

import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

export default function WithdrawPage() {
  const [amount, setAmount] = useState(0)
  const availableAmount = 350000

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <Link href="/mypage/seller/earnings" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <i className="fas fa-arrow-left"></i>
            <span>수익 관리로</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">출금 신청</h1>
          <p className="text-gray-600">수익금을 출금하세요</p>
        </div>

        <div className="max-w-2xl">
          <div className="bg-gradient-to-r from-[#0f3460] to-[#1a4b7d] rounded-lg p-6 mb-6 text-white">
            <div className="text-sm opacity-90 mb-2">출금 가능 금액</div>
            <div className="text-4xl font-bold">{availableAmount.toLocaleString()}원</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">출금 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">출금 금액 *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  max={availableAmount}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  placeholder="출금할 금액을 입력하세요"
                />
                <button
                  onClick={() => setAmount(availableAmount)}
                  className="mt-2 text-sm text-[#0f3460] hover:underline"
                >
                  전액 출금
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">은행 *</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent">
                  <option>은행 선택</option>
                  <option>KB국민은행</option>
                  <option>신한은행</option>
                  <option>우리은행</option>
                  <option>하나은행</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">계좌번호 *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  placeholder="'-' 없이 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">예금주 *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle text-yellow-600 mt-1"></i>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">출금 안내</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>출금 신청 후 3영업일 이내에 입금됩니다</li>
                  <li>최소 출금 금액은 10,000원입니다</li>
                  <li>출금 수수료는 무료입니다</li>
                </ul>
              </div>
            </div>
          </div>

          <button className="w-full px-6 py-4 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium text-lg">
            <i className="fas fa-money-bill-wave mr-2"></i>
            {amount.toLocaleString()}원 출금 신청
          </button>
        </div>
      </main>
    </>
  )
}
