'use client'

import Sidebar from '@/components/mypage/Sidebar'

export default function WithdrawHistoryPage() {
  const mockHistory = [
    { id: '1', amount: 100000, bank: 'KB국민은행', account: '***1234', date: '2025-01-20', status: 'completed' },
    { id: '2', amount: 200000, bank: '신한은행', account: '***5678', date: '2025-01-15', status: 'completed' },
    { id: '3', amount: 150000, bank: 'KB국민은행', account: '***1234', date: '2025-01-10', status: 'completed' }
  ]

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">출금 내역</h1>
          <p className="text-gray-600">출금 이력을 확인하세요</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">날짜</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">은행</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">계좌</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">금액</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.bank}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.account}</td>
                  <td className="px-6 py-4 text-sm font-medium text-red-600 text-right">-{item.amount.toLocaleString()}원</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      완료
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
