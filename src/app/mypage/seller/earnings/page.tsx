'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { getSellerEarnings, getEarningsTransactions } from '@/lib/supabase/queries/earnings'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'

export default function SellerEarningsPage() {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadEarningsData()
    }
  }, [user])

  async function loadEarningsData() {
    try {
      setLoading(true)
      setError(null)

      const [earningsData, transactionsData] = await Promise.all([
        getSellerEarnings(user!.id),
        getEarningsTransactions(user!.id, 10)
      ])

      setEarnings(earningsData)
      setTransactions(transactionsData)
    } catch (err: any) {
      console.error('수익 데이터 로드 실패:', err)
      setError(err.message || '수익 데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-8">
          <LoadingSpinner message="수익 정보를 불러오는 중..." />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-8">
          <ErrorState message={error} retry={loadEarningsData} />
        </main>
      </>
    )
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return '출금가능'
      case 'pending': return '대기중'
      case 'completed': return '완료'
      case 'cancelled': return '취소'
      default: return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수익 관리</h1>
          <p className="text-gray-600">판매 수익을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">출금 가능 금액</div>
            <div className="text-2xl font-bold text-brand-primary">{earnings?.available_balance?.toLocaleString() || '0'}원</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">정산 대기중</div>
            <div className="text-2xl font-bold text-yellow-600">{earnings?.pending_balance?.toLocaleString() || '0'}원</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">출금 완료</div>
            <div className="text-2xl font-bold text-gray-900">{earnings?.total_withdrawn?.toLocaleString() || '0'}원</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">총 수익</div>
            <div className="text-2xl font-bold text-green-600">{earnings?.total_earned?.toLocaleString() || '0'}원</div>
          </div>
        </div>

        <div className="mb-6">
          <Link
            href="/mypage/seller/earnings/withdraw"
            className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium inline-block"
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
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tx.transaction_date).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tx.type === 'sale' ? '판매' : tx.type === 'withdraw' ? '출금' : tx.type === 'refund' ? '환불' : '조정'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tx.order_number || '-'}</td>
                    <td className={`px-6 py-4 text-sm font-medium text-right ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(tx.status)}`}>
                        {getStatusLabel(tx.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-receipt text-4xl mb-4 text-gray-300"></i>
                    <p>정산 내역이 없습니다</p>
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
