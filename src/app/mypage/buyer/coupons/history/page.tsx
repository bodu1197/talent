'use client'

import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

export default function CouponHistoryPage() {
  const mockHistory = [
    { id: '1', type: 'coupon', name: '신규 가입 쿠폰', amount: -5000, date: '2025-01-25', order: '12345' },
    { id: '2', type: 'cash', name: '캐시 충전', amount: 10000, date: '2025-01-20', order: null },
    { id: '3', type: 'cash', name: '서비스 구매', amount: -3000, date: '2025-01-18', order: '12344' }
  ]

  return (
    <>
      <Sidebar mode="buyer" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">사용 내역</h1>
          <p className="text-gray-600">쿠폰 및 캐시 사용 내역을 확인하세요</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
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
              {mockHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'coupon' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type === 'coupon' ? '쿠폰' : '캐시'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                  <td className={`px-6 py-4 text-sm font-medium text-right ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}원
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
