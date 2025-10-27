'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface SettlementStats {
  availableAmount: number
  pendingAmount: number
  totalSettled: number
  thisMonthEarnings: number
}

interface Settlement {
  id: string
  amount: number
  status: string
  requested_at: string
  settled_at: string | null
  bank_name: string
  account_number: string
}

export default function SettlementsPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [stats, setStats] = useState<SettlementStats>({
    availableAmount: 0,
    pendingAmount: 0,
    totalSettled: 0,
    thisMonthEarnings: 0,
  })
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    if (user?.id) {
      supabase.from('users').update({ last_mode: 'seller' }).eq('id', user.id)
      fetchSettlementData()
    }
  }, [user])

  const fetchSettlementData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // 완료된 주문에서 정산 가능 금액 계산
      const { data: orders } = await supabase
        .from('orders')
        .select('seller_amount, status, created_at')
        .eq('seller_id', user.id)
        .eq('status', 'completed')

      const availableAmount = orders?.reduce((sum, o) => sum + (o.seller_amount || 0), 0) || 0

      // 이번 달 수익
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const thisMonthEarnings =
        orders
          ?.filter((o) => new Date(o.created_at) >= thisMonth)
          .reduce((sum, o) => sum + (o.seller_amount || 0), 0) || 0

      // 정산 내역
      const { data: settlementsData } = await supabase
        .from('settlements')
        .select('*')
        .eq('seller_id', user.id)
        .order('requested_at', { ascending: false })

      const pendingAmount =
        settlementsData
          ?.filter((s) => s.status === 'pending')
          .reduce((sum, s) => sum + s.amount, 0) || 0

      const totalSettled =
        settlementsData
          ?.filter((s) => s.status === 'completed')
          .reduce((sum, s) => sum + s.amount, 0) || 0

      setStats({
        availableAmount,
        pendingAmount,
        totalSettled,
        thisMonthEarnings,
      })
      setSettlements(settlementsData || [])
    } catch (error) {
      console.error('정산 데이터 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { text: string; class: string } } = {
      pending: { text: '대기중', class: 'bg-yellow-100 text-yellow-800' },
      processing: { text: '처리중', class: 'bg-blue-100 text-blue-800' },
      completed: { text: '완료', class: 'bg-green-100 text-green-800' },
      failed: { text: '실패', class: 'bg-red-100 text-red-800' },
    }
    const badge = badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>{badge.text}</span>
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">수익/정산 관리</h1>
          <p className="text-gray-600">정산 신청하고 수익을 확인하세요.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3460]"></div>
          </div>
        ) : (
          <>
            {/* 정산 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-600 text-xl"></i>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1 text-green-600">
                  {stats.availableAmount.toLocaleString()}원
                </div>
                <div className="text-sm text-gray-600">정산 가능 금액</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-yellow-600 text-xl"></i>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1 text-yellow-600">
                  {stats.pendingAmount.toLocaleString()}원
                </div>
                <div className="text-sm text-gray-600">정산 대기</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-won-sign text-[#0f3460] text-xl"></i>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stats.thisMonthEarnings.toLocaleString()}원</div>
                <div className="text-sm text-gray-600">이번 달 수익</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-gray-600 text-xl"></i>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stats.totalSettled.toLocaleString()}원</div>
                <div className="text-sm text-gray-600">총 정산 금액</div>
              </div>
            </div>

            {/* 정산 신청 버튼 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">정산 신청</h3>
                  <p className="text-sm text-gray-600">최소 정산 금액: 10,000원</p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  disabled={stats.availableAmount < 10000}
                  className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <i className="fas fa-money-bill-wave mr-2"></i>
                  정산 신청하기
                </button>
              </div>
            </div>

            {/* 정산 내역 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">정산 내역</h2>
              </div>

              {settlements.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <i className="fas fa-inbox text-4xl mb-3"></i>
                  <p>정산 내역이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {settlements.map((settlement) => (
                    <div key={settlement.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(settlement.status)}
                            <span className="text-sm text-gray-500">
                              {new Date(settlement.requested_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {settlement.bank_name} {settlement.account_number}
                          </div>
                          {settlement.settled_at && (
                            <div className="text-sm text-gray-500 mt-1">
                              정산 완료: {new Date(settlement.settled_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-[#0f3460]">
                            {settlement.amount.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
