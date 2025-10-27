'use client'

import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

export default function SellerEarningsPage() {
  const earnings = {
    available: 350000,
    pending: 150000,
    withdrawn: 1200000,
    total: 1700000
  }

  const mockTransactions = [
    { id: '1', type: 'sale', orderNumber: '12345', amount: 50000, date: '2025-01-25', status: 'available' },
    { id: '2', type: 'sale', orderNumber: '12344', amount: 150000, date: '2025-01-23', status: 'pending' },
    { id: '3', type: 'withdraw', amount: -100000, date: '2025-01-20', status: 'completed' }
  ]

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수익 관리</h1>
          <p className="text-gray-600">판매 수익을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">출금 가능 금액</div>
            <div className="text-2xl font-bold text-[#0f3460]">{earnings.available.toLocaleString()}원</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">정산 대기중</div>
            <div className="text-2xl font-bold text-yellow-600">{earnings.pending.toLocaleString()}원</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">출금 완료</div>
            <div className="text-2xl font-bold text-gray-900">{earnings.withdrawn.toLocaleString()}원</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">총 수익</div>
            <div className="text-2xl font-bold text-green-600">{earnings.total.toLocaleString()}원</div>
          </div>
        </div>

        <div className="mb-6">
          <Link
            href="/mypage/seller/earnings/withdraw"
            className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium inline-block"
          >
            <i className="fas fa-money-bill-wave mr-2"></i>
            출금 신청
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">정산 내역</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">날짜</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">구분</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">주문번호</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">금액</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tx.type === 'sale' ? '판매' : '출금'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.orderNumber || '-'}</td>
                  <td className={`px-6 py-4 text-sm font-medium text-right ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.status === 'available' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.status === 'available' ? '출금가능' : tx.status === 'pending' ? '대기중' : '완료'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
