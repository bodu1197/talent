'use client'

import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

export default function BuyerQuotesPage() {
  const mockQuotes = [
    {
      id: '1',
      title: '로고 디자인 견적 요청',
      category: '디자인',
      status: 'pending',
      statusLabel: '대기중',
      createdAt: '2025-01-26',
      responseCount: 0
    },
    {
      id: '2',
      title: '웹사이트 제작 견적',
      category: 'IT/프로그래밍',
      status: 'received',
      statusLabel: '답변 도착',
      createdAt: '2025-01-20',
      responseCount: 3
    }
  ]

  return (
    <>
      <Sidebar mode="buyer" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">견적 요청 내역</h1>
              <p className="text-gray-600">맞춤 견적 요청을 관리하세요</p>
            </div>
            <Link
              href="/quotes/new"
              className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              견적 요청하기
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {mockQuotes.map((quote) => (
            <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{quote.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quote.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {quote.statusLabel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {quote.category} • {quote.createdAt}
                  </div>
                </div>
                {quote.responseCount > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#0f3460]">{quote.responseCount}</div>
                    <div className="text-sm text-gray-600">답변</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/mypage/buyer/quotes/${quote.id}`}
                  className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
                >
                  상세보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
