'use client'

import Sidebar from '@/components/mypage/Sidebar'

interface WithdrawHistoryClientProps {
  history: any[]
}

export default function WithdrawHistoryClient({ history }: WithdrawHistoryClientProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기중'
      case 'processing': return '처리중'
      case 'completed': return '완료'
      case 'rejected': return '거부됨'
      case 'cancelled': return '취소'
      default: return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

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
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.requested_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.bank_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.account_number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600 text-right">
                      -{item.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-money-bill-wave text-4xl mb-4 text-gray-300"></i>
                    <p>출금 내역이 없습니다</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
