'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { getBuyerQuotes } from '@/lib/supabase/queries/quotes'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'

export default function BuyerQuotesPage() {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadQuotes()
    }
  }, [user])

  async function loadQuotes() {
    try {
      setLoading(true)
      setError(null)
      const data = await getBuyerQuotes(user!.id)
      setQuotes(data)
    } catch (err: any) {
      console.error('견적 조회 실패:', err)
      setError(err.message || '견적 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar mode="buyer" />
        <main className="flex-1 overflow-y-auto p-8">
          <LoadingSpinner message="견적 목록을 불러오는 중..." />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar mode="buyer" />
        <main className="flex-1 overflow-y-auto p-8">
          <ErrorState message={error} retry={loadQuotes} />
        </main>
      </>
    )
  }

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
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium"
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
                        quote.response_count > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {quote.response_count > 0 ? '답변 도착' : getStatusLabel(quote.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {quote.category?.name || '기타'} • {new Date(quote.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  {quote.response_count > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand-primary">{quote.response_count}</div>
                      <div className="text-sm text-gray-600">답변</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/mypage/buyer/quotes/${quote.id}`}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-sm font-medium"
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
                className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium"
              >
                <i className="fas fa-plus mr-2"></i>
                견적 요청하기
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
