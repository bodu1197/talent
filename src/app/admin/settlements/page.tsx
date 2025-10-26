'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable from '@/components/admin/common/DataTable'
import Badge from '@/components/admin/common/Badge'
import Modal from '@/components/admin/common/Modal'
import type { AdminSettlementFilter } from '@/types/admin'

export default function AdminSettlementsPage() {
  const supabase = createClient()
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSettlement, setSelectedSettlement] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete' | null>(null)
  const [actionReason, setActionReason] = useState('')

  const [filter, setFilter] = useState<AdminSettlementFilter>({
    status: 'all',
    dateRange: { from: null, to: null },
    amountRange: [0, 100000000],
    searchKeyword: '',
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchSettlements()
  }, [filter])

  async function fetchSettlements() {
    setLoading(true)
    try {
      let query = supabase
        .from('settlements')
        .select(`
          id,
          amount,
          status,
          bank_name,
          account_number,
          account_holder,
          requested_at,
          processed_at,
          seller:seller_profiles!seller_id(
            id,
            business_name,
            user:users!user_id(name, email)
          )
        `)

      // Apply filters
      if (filter.status !== 'all') {
        query = query.eq('status', filter.status)
      }

      if (filter.dateRange.from) {
        query = query.gte('requested_at', filter.dateRange.from)
      }

      if (filter.dateRange.to) {
        query = query.lte('requested_at', filter.dateRange.to)
      }

      if (filter.searchKeyword) {
        query = query.or(`account_holder.ilike.%${filter.searchKeyword}%,bank_name.ilike.%${filter.searchKeyword}%`)
      }

      // Apply sorting
      if (filter.sortBy === 'newest') {
        query = query.order('requested_at', { ascending: false })
      } else if (filter.sortBy === 'oldest') {
        query = query.order('requested_at', { ascending: true })
      } else if (filter.sortBy === 'highest_amount') {
        query = query.order('amount', { ascending: false })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setSettlements(data || [])
    } catch (error) {
      console.error('Error fetching settlements:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!selectedSettlement || !actionType) return

    try {
      if (actionType === 'approve') {
        const { error } = await supabase
          .from('settlements')
          .update({ status: 'approved' })
          .eq('id', selectedSettlement.id)

        if (error) throw error

        alert(`정산 요청이 승인되었습니다.`)
      } else if (actionType === 'reject') {
        const { error } = await supabase
          .from('settlements')
          .update({ status: 'rejected' })
          .eq('id', selectedSettlement.id)

        if (error) throw error

        // TODO: Send notification with reason
        alert(`정산 요청이 거절되었습니다.`)
      } else if (actionType === 'complete') {
        const { error } = await supabase
          .from('settlements')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', selectedSettlement.id)

        if (error) throw error

        // TODO: Integrate with bank API for actual transfer
        alert(`${selectedSettlement.amount?.toLocaleString()}원이 정산 완료되었습니다.`)
      }

      setShowActionModal(false)
      setActionType(null)
      setActionReason('')
      fetchSettlements()
    } catch (error: any) {
      console.error('Action error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  function openActionModal(settlement: any, type: typeof actionType) {
    setSelectedSettlement(settlement)
    setActionType(type)
    setShowActionModal(true)
  }

  const columns = [
    {
      key: 'seller',
      label: '판매자',
      render: (settlement: any) => (
        <div>
          <div className="font-medium text-gray-900">{settlement.seller?.business_name}</div>
          <div className="text-xs text-gray-500">{settlement.seller?.user?.name}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: '정산 금액',
      render: (settlement: any) => (
        <span className="font-semibold text-[#0f3460] text-lg">
          {settlement.amount?.toLocaleString()}원
        </span>
      ),
    },
    {
      key: 'bank_info',
      label: '계좌 정보',
      render: (settlement: any) => (
        <div>
          <div className="text-sm text-gray-900">{settlement.bank_name}</div>
          <div className="text-xs text-gray-500">
            {settlement.account_number} ({settlement.account_holder})
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      render: (settlement: any) => {
        const statusMap = {
          pending: { text: '대기중', variant: 'warning' as const },
          approved: { text: '승인됨', variant: 'info' as const },
          rejected: { text: '거절됨', variant: 'error' as const },
          completed: { text: '완료', variant: 'success' as const },
        }
        const status = statusMap[settlement.status as keyof typeof statusMap] || { text: settlement.status, variant: 'gray' as const }
        return <Badge variant={status.variant}>{status.text}</Badge>
      },
    },
    {
      key: 'requested_at',
      label: '요청일',
      render: (settlement: any) => (
        <span className="text-gray-600">
          {new Date(settlement.requested_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '액션',
      render: (settlement: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedSettlement(settlement)
              setShowDetailModal(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="상세보기"
          >
            <i className="fas fa-eye"></i>
          </button>
          {settlement.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openActionModal(settlement, 'approve')
                }}
                className="text-green-600 hover:text-green-800"
                title="승인"
              >
                <i className="fas fa-check"></i>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openActionModal(settlement, 'reject')
                }}
                className="text-red-600 hover:text-red-800"
                title="거절"
              >
                <i className="fas fa-times"></i>
              </button>
            </>
          )}
          {settlement.status === 'approved' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openActionModal(settlement, 'complete')
              }}
              className="text-green-600 hover:text-green-800"
              title="정산 완료"
            >
              <i className="fas fa-check-circle"></i>
            </button>
          )}
        </div>
      ),
      width: 'w-32',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">정산 관리</h1>
          <p className="text-gray-600 mt-1">전체 {settlements.length}건의 정산 요청</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="pending">대기중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거절됨</option>
              <option value="completed">완료</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="highest_amount">금액 높은순</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작일
            </label>
            <input
              type="date"
              value={filter.dateRange.from ? (typeof filter.dateRange.from === 'string' ? filter.dateRange.from : filter.dateRange.from.toISOString().split('T')[0]) : ''}
              onChange={(e) => setFilter({
                ...filter,
                dateRange: { ...filter.dateRange, from: e.target.value ? new Date(e.target.value) : null }
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료일
            </label>
            <input
              type="date"
              value={filter.dateRange.to ? (typeof filter.dateRange.to === 'string' ? filter.dateRange.to : filter.dateRange.to.toISOString().split('T')[0]) : ''}
              onChange={(e) => setFilter({
                ...filter,
                dateRange: { ...filter.dateRange, to: e.target.value ? new Date(e.target.value) : null }
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>
        </div>

        <div className="mt-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              value={filter.searchKeyword}
              onChange={(e) => setFilter({ ...filter, searchKeyword: e.target.value })}
              placeholder="예금주, 은행명 검색"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <DataTable
        data={settlements}
        columns={columns}
        loading={loading}
        emptyMessage="정산 요청이 없습니다"
      />

      {/* Settlement Detail Modal */}
      {showDetailModal && selectedSettlement && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="정산 상세 정보"
          size="lg"
        >
          <div className="space-y-6">
            {/* Settlement Info */}
            <div>
              <h4 className="font-semibold text-lg mb-3">정산 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">정산 금액</label>
                  <p className="text-gray-900 font-bold text-2xl">
                    {selectedSettlement.amount?.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">상태</label>
                  <div>
                    <Badge variant={
                      selectedSettlement.status === 'completed' ? 'success' :
                      selectedSettlement.status === 'approved' ? 'info' :
                      selectedSettlement.status === 'rejected' ? 'error' : 'warning'
                    }>
                      {selectedSettlement.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">요청일</label>
                  <p className="text-gray-900">
                    {new Date(selectedSettlement.requested_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                {selectedSettlement.processed_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">처리일</label>
                    <p className="text-gray-900">
                      {new Date(selectedSettlement.processed_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">계좌 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">은행명</label>
                  <p className="text-gray-900">{selectedSettlement.bank_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">예금주</label>
                  <p className="text-gray-900">{selectedSettlement.account_holder}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">계좌번호</label>
                  <p className="text-gray-900 font-mono">{selectedSettlement.account_number}</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">판매자 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">상호명</label>
                  <p className="text-gray-900">{selectedSettlement.seller?.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">담당자</label>
                  <p className="text-gray-900">{selectedSettlement.seller?.user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-gray-900">{selectedSettlement.seller?.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold mb-3">관리 액션</h4>
              <div className="flex gap-2">
                {selectedSettlement.status === 'pending' && (
                  <>
                    <button
                      onClick={() => openActionModal(selectedSettlement, 'approve')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <i className="fas fa-check mr-2"></i>
                      승인
                    </button>
                    <button
                      onClick={() => openActionModal(selectedSettlement, 'reject')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i>
                      거절
                    </button>
                  </>
                )}
                {selectedSettlement.status === 'approved' && (
                  <button
                    onClick={() => openActionModal(selectedSettlement, 'complete')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-money-bill-wave mr-2"></i>
                    정산 완료 처리
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && actionType && (
        <Modal
          isOpen={showActionModal}
          onClose={() => {
            setShowActionModal(false)
            setActionType(null)
            setActionReason('')
          }}
          title={`정산 ${
            actionType === 'approve' ? '승인' :
            actionType === 'reject' ? '거절' : '완료 처리'
          }`}
          footer={
            <>
              <button
                onClick={() => {
                  setShowActionModal(false)
                  setActionType(null)
                  setActionReason('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  actionType === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                확인
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {selectedSettlement?.seller?.business_name}의 정산 요청 {selectedSettlement?.amount?.toLocaleString()}원을{' '}
              {actionType === 'approve' ? '승인' :
               actionType === 'reject' ? '거절' : '완료 처리'}
              하시겠습니까?
            </p>

            {actionType === 'complete' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium text-yellow-800">정산 완료 안내</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      이 작업은 실제 은행 송금이 완료된 후에만 진행하세요.
                      <br />
                      계좌: {selectedSettlement?.bank_name} {selectedSettlement?.account_number}
                      <br />
                      예금주: {selectedSettlement?.account_holder}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {actionType === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거절 사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="거절 사유를 입력하세요..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  rows={4}
                  required
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
