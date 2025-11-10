'use client'

import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import { createClient } from '@/lib/supabase/client'

interface SellerEarningsClientProps {
  earnings: any
  transactions: any[]
  sellerData: {
    id: string
    display_name: string
    profile_image?: string | null
    bank_name: string
    account_number: string
    account_holder: string
  }
}

export default function SellerEarningsClient({ earnings, transactions, sellerData }: SellerEarningsClientProps) {
  const [loading, setLoading] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || parseInt(withdrawAmount) <= 0) {
      alert('출금 금액을 입력해주세요.')
      return
    }

    const amount = parseInt(withdrawAmount)
    if (amount > earnings.available_balance) {
      alert('출금 가능 금액을 초과했습니다.')
      return
    }

    if (amount < 10000) {
      alert('최소 출금 금액은 10,000원입니다.')
      return
    }

    if (!confirm(`${amount.toLocaleString()}원을 출금 신청하시겠습니까?\n\n입금 계좌: ${sellerData.bank_name} ${sellerData.account_number}\n예금주: ${sellerData.account_holder}`)) {
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      console.log('Seller data:', sellerData)
      console.log('Withdrawal request data:', {
        seller_id: sellerData.id,
        amount: amount,
        bank_name: sellerData.bank_name,
        account_number: sellerData.account_number,
        account_holder: sellerData.account_holder,
        status: 'pending'
      })

      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          seller_id: sellerData.id,
          amount: amount,
          bank_name: sellerData.bank_name,
          account_number: sellerData.account_number,
          account_holder: sellerData.account_holder,
          status: 'pending',
          requested_at: new Date().toISOString()
        })

      if (error) {
        console.error('Withdrawal insert error:', error)
        throw error
      }

      alert('출금 신청이 완료되었습니다.\n영업일 기준 1-3일 내 처리됩니다.')
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      window.location.reload()
    } catch (error: any) {
      console.error('Withdrawal request error:', error)
      alert('출금 신청에 실패했습니다.\n' + error.message)
    } finally {
      setLoading(false)
    }
  }
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return '정산 대기'
      case 'completed': return '정산 완료'
      case 'cancelled': return '취소'
      default: return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-16 lg:pt-[86px] absolute inset-0 top-[86px]">
      <div className="flex w-full max-w-[1200px]">
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" sellerData={sellerData} />
        <main className="flex-1 overflow-y-auto">
          <div className="py-8 px-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">수익 관리</h1>
          <p className="text-gray-600 mt-1 text-sm">판매 수익을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">출금 가능 금액</div>
            <div className="text-2xl font-bold text-[#0f3460]">{earnings?.available_balance?.toLocaleString() || '0'}원</div>
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

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={earnings.available_balance <= 0}
            className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <i className="fas fa-money-bill-wave mr-2"></i>
            출금 신청
          </button>
          {earnings.available_balance <= 0 && (
            <p className="text-sm text-gray-500 self-center">출금 가능 금액이 없습니다</p>
          )}
        </div>

        {/* 출금 신청 모달 */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">출금 신청</h3>

              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">출금 가능 금액</p>
                  <p className="text-2xl font-bold text-[#0f3460]">{earnings.available_balance.toLocaleString()}원</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 font-medium mb-2">입금 계좌 정보</p>
                  <p className="text-sm text-gray-600">은행: {sellerData.bank_name}</p>
                  <p className="text-sm text-gray-600">계좌번호: {sellerData.account_number}</p>
                  <p className="text-sm text-gray-600">예금주: {sellerData.account_holder}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출금 금액 (최소 10,000원)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="출금 금액을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    min="10000"
                    max={earnings.available_balance}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false)
                    setWithdrawAmount('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  onClick={handleWithdrawRequest}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors disabled:bg-gray-400"
                >
                  {loading ? '처리 중...' : '출금 신청'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                      {new Date(tx.updated_at || tx.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tx.service?.title || '판매 수익'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      #{tx.order_number || tx.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-green-600">
                      +{(tx.total_amount || 0).toLocaleString()}원
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
          </div>
        </main>
      </div>
    </div>
  )
}
