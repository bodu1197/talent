'use client'

import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import Link from 'next/link'
import { Quote } from '@/types/common'

interface BuyerQuotesClientProps {
  quotes: Quote[]
}

export default function BuyerQuotesClient({ quotes }: BuyerQuotesClientProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기중'
      case 'received': return '답변 도착'
      case 'selected': return '선택 완료'
      case 'cancelled': return '취소됨'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-16 lg:pt-[86px] absolute inset-0 top-[86px]">
      <div className="flex w-full max-w-[1200px]">
        <MobileSidebar mode="buyer" />
        <Sidebar mode="buyer" />
        <main className="flex-1 overflow-y-auto">
          <div className="py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">견적 요청 내역</h1>
              <p className="text-gray-600 mt-1 text-sm">맞춤 견적 요청을 관리하세요</p>
            </div>
            <Link
              href="/quotes/new"
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              견적 요청하기
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{quote.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (quote.response_count || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {(quote.response_count || 0) > 0 ? '답변 도착' : getStatusLabel(quote.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {quote.category?.name || '기타'} • {new Date(quote.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  {(quote.response_count || 0) > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand-primary">{quote.response_count}</div>
                      <div className="text-sm text-gray-600">답변</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/mypage/buyer/quotes/${quote.id}`}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <i className="fas fa-file-alt text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-500 mb-4">등록한 견적 요청이 없습니다</p>
              <Link
                href="/quotes/new"
                className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
              >
                <i className="fas fa-plus mr-2"></i>
                견적 요청하기
              </Link>
            </div>
          )}
        </div>
          </div>
        </main>
      </div>
    </div>
  )
}
