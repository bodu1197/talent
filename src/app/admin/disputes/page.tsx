'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable from '@/components/admin/common/DataTable'
import Badge from '@/components/admin/common/Badge'
import Modal from '@/components/admin/common/Modal'
import type { AdminDisputeFilter } from '@/types/admin'

export default function AdminDisputesPage() {
  const supabase = useMemo(() => createClient(), [])
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'favor_buyer' | 'favor_seller' | 'partial_refund' | 'escalate' | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [refundAmount, setRefundAmount] = useState(0)

  const [filter, setFilter] = useState<AdminDisputeFilter>({
    status: 'all',
    initiatedBy: 'all',
    reason: 'all',
    dateRange: { from: null, to: null },
    searchKeyword: '',
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchDisputes()
  }, [filter])

  async function fetchDisputes() {
    setLoading(true)
    try {
      let query = supabase
        .from('disputes')
        .select(`
          id,
          reason,
          description,
          status,
          resolution,
          created_at,
          resolved_at,
          order:orders(
            order_number,
            total_amount,
            buyer:users!buyer_id(name, email),
            service:services(
              title,
              seller:seller_profiles!seller_id(
                business_name,
                user:users!user_id(name, email)
              )
            )
          )
        `)

      // Apply filters
      if (filter.status !== 'all') {
        query = query.eq('status', filter.status)
      }

      if (filter.reason !== 'all') {
        query = query.eq('reason', filter.reason)
      }

      if (filter.searchKeyword) {
        query = query.or(`description.ilike.%${filter.searchKeyword}%,reason.ilike.%${filter.searchKeyword}%`)
      }

      // Apply sorting
      if (filter.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filter.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setDisputes(data || [])
    } catch (error) {
      console.error('Error fetching disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!selectedDispute || !actionType) return

    try {
      let updateData: any = {}

      if (actionType === 'favor_buyer') {
        updateData = {
          status: 'resolved',
          resolution: `구매자 승: ${resolutionNote}`,
          resolved_at: new Date().toISOString(),
        }
        // TODO: Process full refund
      } else if (actionType === 'favor_seller') {
        updateData = {
          status: 'resolved',
          resolution: `판매자 승: ${resolutionNote}`,
          resolved_at: new Date().toISOString(),
        }
      } else if (actionType === 'partial_refund') {
        updateData = {
          status: 'resolved',
          resolution: `부분 환불 ${refundAmount.toLocaleString()}원: ${resolutionNote}`,
          resolved_at: new Date().toISOString(),
        }
        // TODO: Process partial refund
      } else if (actionType === 'escalate') {
        updateData = {
          status: 'escalated',
          resolution: `상위 검토로 이관: ${resolutionNote}`,
        }
      }

      const { error } = await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', selectedDispute.id)

      if (error) throw error

      // TODO: Send notifications to both parties
      alert(`분쟁이 처리되었습니다.`)

      setShowActionModal(false)
      setActionType(null)
      setResolutionNote('')
      setRefundAmount(0)
      fetchDisputes()
    } catch (error: any) {
      console.error('Action error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  function openActionModal(dispute: any, type: typeof actionType) {
    setSelectedDispute(dispute)
    setActionType(type)
    if (type === 'partial_refund') {
      setRefundAmount(Math.floor((dispute.order?.total_amount || 0) / 2))
    }
    setShowActionModal(true)
  }

  const columns = [
    {
      key: 'order',
      label: '주문번호',
      render: (dispute: any) => (
        <div>
          <div className="font-medium text-gray-900">{dispute.order?.order_number}</div>
          <div className="text-xs text-gray-500">
            {new Date(dispute.created_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      ),
    },
    {
      key: 'service',
      label: '서비스',
      render: (dispute: any) => (
        <div>
          <div className="text-sm text-gray-900">{dispute.order?.service?.title}</div>
        </div>
      ),
    },
    {
      key: 'parties',
      label: '당사자',
      render: (dispute: any) => (
        <div>
          <div className="text-sm">
            <span className="text-gray-500">구매자:</span>{' '}
            <span className="text-gray-900">{dispute.order?.buyer?.name}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">판매자:</span>{' '}
            <span className="text-gray-900">{dispute.order?.service?.seller?.business_name}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      label: '사유',
      render: (dispute: any) => (
        <div>
          <div className="text-sm text-gray-900">{dispute.reason}</div>
          <div className="text-xs text-gray-500 line-clamp-1">{dispute.description}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: '분쟁 금액',
      render: (dispute: any) => (
        <span className="font-semibold text-[#0f3460]">
          {dispute.order?.total_amount?.toLocaleString()}원
        </span>
      ),
    },
    {
      key: 'status',
      label: '상태',
      render: (dispute: any) => {
        const statusMap = {
          open: { text: '접수', variant: 'warning' as const },
          in_review: { text: '검토중', variant: 'info' as const },
          resolved: { text: '해결', variant: 'success' as const },
          escalated: { text: '이관됨', variant: 'error' as const },
        }
        const status = statusMap[dispute.status as keyof typeof statusMap] || { text: dispute.status, variant: 'gray' as const }
        return <Badge variant={status.variant} size="sm">{status.text}</Badge>
      },
      width: 'w-24',
    },
    {
      key: 'actions',
      label: '액션',
      render: (dispute: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedDispute(dispute)
              setShowDetailModal(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="상세보기"
          >
            <i className="fas fa-eye"></i>
          </button>
        </div>
      ),
      width: 'w-20',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">분쟁 관리</h1>
          <p className="text-gray-600 mt-1">전체 {disputes.length}건의 분쟁</p>
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
              <option value="open">접수</option>
              <option value="in_review">검토중</option>
              <option value="resolved">해결</option>
              <option value="escalated">이관됨</option>
            </select>
          </div>

          {/* Reason Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              분쟁 사유
            </label>
            <select
              value={filter.reason}
              onChange={(e) => setFilter({ ...filter, reason: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="quality">품질 문제</option>
              <option value="delivery">배송 지연</option>
              <option value="mismatch">설명 불일치</option>
              <option value="communication">의사소통 문제</option>
              <option value="other">기타</option>
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
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              value={filter.searchKeyword}
              onChange={(e) => setFilter({ ...filter, searchKeyword: e.target.value })}
              placeholder="사유, 설명 검색"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <DataTable
        data={disputes}
        columns={columns}
        loading={loading}
        emptyMessage="분쟁이 없습니다"
      />

      {/* Dispute Detail Modal */}
      {showDetailModal && selectedDispute && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="분쟁 상세 정보"
          size="xl"
        >
          <div className="space-y-6">
            {/* Dispute Info */}
            <div>
              <h4 className="font-semibold text-lg mb-3">분쟁 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">분쟁 사유</label>
                  <p className="text-gray-900">{selectedDispute.reason}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">상태</label>
                  <div>
                    <Badge variant={
                      selectedDispute.status === 'resolved' ? 'success' :
                      selectedDispute.status === 'in_review' ? 'info' :
                      selectedDispute.status === 'escalated' ? 'error' : 'warning'
                    }>
                      {selectedDispute.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">접수일</label>
                  <p className="text-gray-900">
                    {new Date(selectedDispute.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                {selectedDispute.resolved_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">해결일</label>
                    <p className="text-gray-900">
                      {new Date(selectedDispute.resolved_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">상세 설명</label>
                  <p className="text-gray-900 whitespace-pre-wrap p-4 bg-gray-50 rounded-lg mt-2">
                    {selectedDispute.description}
                  </p>
                </div>
                {selectedDispute.resolution && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">해결 내용</label>
                    <p className="text-gray-900 p-4 bg-green-50 rounded-lg mt-2">
                      {selectedDispute.resolution}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">주문 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">주문번호</label>
                  <p className="text-gray-900 font-medium">{selectedDispute.order?.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">주문 금액</label>
                  <p className="text-gray-900 font-bold text-lg">
                    {selectedDispute.order?.total_amount?.toLocaleString()}원
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">서비스명</label>
                  <p className="text-gray-900">{selectedDispute.order?.service?.title}</p>
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">구매자 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">이름</label>
                  <p className="text-gray-900">{selectedDispute.order?.buyer?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-gray-900">{selectedDispute.order?.buyer?.email}</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">판매자 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">상호명</label>
                  <p className="text-gray-900">{selectedDispute.order?.service?.seller?.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">담당자</label>
                  <p className="text-gray-900">{selectedDispute.order?.service?.seller?.user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-gray-900">{selectedDispute.order?.service?.seller?.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            {(selectedDispute.status === 'open' || selectedDispute.status === 'in_review') && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold mb-3">중재 결정</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openActionModal(selectedDispute, 'favor_buyer')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-user mr-2"></i>
                    구매자 승
                  </button>
                  <button
                    onClick={() => openActionModal(selectedDispute, 'favor_seller')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <i className="fas fa-store mr-2"></i>
                    판매자 승
                  </button>
                  <button
                    onClick={() => openActionModal(selectedDispute, 'partial_refund')}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <i className="fas fa-handshake mr-2"></i>
                    부분 환불
                  </button>
                  <button
                    onClick={() => openActionModal(selectedDispute, 'escalate')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <i className="fas fa-level-up-alt mr-2"></i>
                    상위 검토
                  </button>
                </div>
              </div>
            )}
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
            setResolutionNote('')
            setRefundAmount(0)
          }}
          title={`분쟁 중재 - ${
            actionType === 'favor_buyer' ? '구매자 승' :
            actionType === 'favor_seller' ? '판매자 승' :
            actionType === 'partial_refund' ? '부분 환불' : '상위 검토 이관'
          }`}
          footer={
            <>
              <button
                onClick={() => {
                  setShowActionModal(false)
                  setActionType(null)
                  setResolutionNote('')
                  setRefundAmount(0)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                확인
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-900">중재 결정 안내</p>
              <p className="text-sm text-blue-700 mt-1">
                {actionType === 'favor_buyer' && '구매자 승소 처리 시 전액 환불이 진행됩니다.'}
                {actionType === 'favor_seller' && '판매자 승소 처리 시 환불이 진행되지 않습니다.'}
                {actionType === 'partial_refund' && '양측 모두에게 부분적인 보상이 이루어집니다.'}
                {actionType === 'escalate' && '더 상위 관리자가 검토하도록 이관됩니다.'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>주문번호:</strong> {selectedDispute?.order?.order_number}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>분쟁 금액:</strong> {selectedDispute?.order?.total_amount?.toLocaleString()}원
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>분쟁 사유:</strong> {selectedDispute?.reason}
              </p>
            </div>

            {actionType === 'partial_refund' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  환불 금액
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  전체 금액: {selectedDispute?.order?.total_amount?.toLocaleString()}원
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                중재 결정 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="중재 결정의 근거와 사유를 입력하세요..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                rows={4}
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
