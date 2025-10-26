'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable from '@/components/admin/common/DataTable'
import Badge from '@/components/admin/common/Badge'
import Modal from '@/components/admin/common/Modal'
import type { AdminOrderFilter } from '@/types/admin'

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'cancel' | 'refund' | 'force_complete' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [refundAmount, setRefundAmount] = useState(0)

  const [filter, setFilter] = useState<AdminOrderFilter>({
    status: 'all',
    dateRange: { from: null, to: null },
    amountRange: [0, 10000000],
    hasDispute: 'all',
    searchKeyword: '',
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchOrders()
  }, [filter])

  async function fetchOrders() {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          platform_fee,
          created_at,
          updated_at,
          buyer:users!buyer_id(name, email),
          service:services(
            title,
            seller:seller_profiles!seller_id(
              business_name,
              user:users!user_id(name, email)
            )
          )
        `)

      // Apply filters
      if (filter.status !== 'all') {
        query = query.eq('status', filter.status)
      }

      // Removed paymentStatus filter - not in type definition

      if (filter.dateRange.from) {
        query = query.gte('created_at', filter.dateRange.from)
      }

      if (filter.dateRange.to) {
        query = query.lte('created_at', filter.dateRange.to)
      }

      if (filter.searchKeyword) {
        query = query.or(`order_number.ilike.%${filter.searchKeyword}%`)
      }

      // Apply sorting
      if (filter.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filter.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else if (filter.sortBy === 'highest_amount') {
        query = query.order('total_amount', { ascending: false })
      } else if (filter.sortBy === 'lowest_amount') {
        query = query.order('total_amount', { ascending: true })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!selectedOrder || !actionType) return

    try {
      if (actionType === 'cancel') {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', selectedOrder.id)

        if (error) throw error

        // TODO: Process refund if payment was made
        alert(`주문 ${selectedOrder.order_number}이(가) 취소되었습니다.`)
      } else if (actionType === 'refund') {
        // TODO: Integrate with payment gateway for actual refund
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'refunded',
            payment_status: 'refunded',
          })
          .eq('id', selectedOrder.id)

        if (error) throw error

        alert(`${refundAmount.toLocaleString()}원이 환불 처리되었습니다.`)
      } else if (actionType === 'force_complete') {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', selectedOrder.id)

        if (error) throw error

        alert(`주문 ${selectedOrder.order_number}이(가) 강제 완료되었습니다.`)
      }

      setShowActionModal(false)
      setActionType(null)
      setActionReason('')
      setRefundAmount(0)
      fetchOrders()
    } catch (error: any) {
      console.error('Action error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  function openActionModal(order: any, type: typeof actionType) {
    setSelectedOrder(order)
    setActionType(type)
    if (type === 'refund') {
      setRefundAmount(order.total_amount)
    }
    setShowActionModal(true)
  }

  const columns = [
    {
      key: 'order_number',
      label: '주문번호',
      render: (order: any) => (
        <div>
          <div className="font-medium text-gray-900">{order.order_number}</div>
          <div className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleString('ko-KR')}
          </div>
        </div>
      ),
    },
    {
      key: 'service',
      label: '서비스',
      render: (order: any) => (
        <div>
          <div className="text-sm text-gray-900">{order.service?.title}</div>
          <div className="text-xs text-gray-500">
            판매자: {order.service?.seller?.business_name}
          </div>
        </div>
      ),
    },
    {
      key: 'buyer',
      label: '구매자',
      render: (order: any) => (
        <div>
          <div className="text-sm text-gray-900">{order.buyer?.name}</div>
          <div className="text-xs text-gray-500">{order.buyer?.email}</div>
        </div>
      ),
    },
    {
      key: 'total_amount',
      label: '금액',
      render: (order: any) => (
        <div>
          <div className="font-semibold text-[#0f3460]">
            {order.total_amount?.toLocaleString()}원
          </div>
          <div className="text-xs text-gray-500">
            수수료: {order.platform_fee?.toLocaleString()}원
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: '주문상태',
      render: (order: any) => {
        const statusMap = {
          pending: { text: '대기중', variant: 'gray' as const },
          paid: { text: '결제완료', variant: 'info' as const },
          in_progress: { text: '진행중', variant: 'warning' as const },
          delivered: { text: '전달됨', variant: 'success' as const },
          completed: { text: '완료', variant: 'success' as const },
          cancelled: { text: '취소됨', variant: 'error' as const },
          refunded: { text: '환불됨', variant: 'error' as const },
        }
        const status = statusMap[order.status as keyof typeof statusMap] || { text: order.status, variant: 'gray' as const }
        return <Badge variant={status.variant}>{status.text}</Badge>
      },
    },
    {
      key: 'payment_status',
      label: '결제상태',
      render: (order: any) => {
        const statusMap = {
          pending: { text: '대기', variant: 'gray' as const },
          paid: { text: '완료', variant: 'success' as const },
          failed: { text: '실패', variant: 'error' as const },
          refunded: { text: '환불', variant: 'warning' as const },
        }
        const status = statusMap[order.payment_status as keyof typeof statusMap] || { text: order.payment_status, variant: 'gray' as const }
        return <Badge variant={status.variant} size="sm">{status.text}</Badge>
      },
    },
    {
      key: 'actions',
      label: '액션',
      render: (order: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedOrder(order)
              setShowDetailModal(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="상세보기"
          >
            <i className="fas fa-eye"></i>
          </button>
          {(order.status === 'paid' || order.status === 'in_progress') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openActionModal(order, 'refund')
              }}
              className="text-orange-600 hover:text-orange-800"
              title="환불"
            >
              <i className="fas fa-undo"></i>
            </button>
          )}
        </div>
      ),
      width: 'w-24',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
          <p className="text-gray-600 mt-1">전체 {orders.length}건의 주문</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Order Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주문 상태
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="pending">대기중</option>
              <option value="paid">결제완료</option>
              <option value="in_progress">진행중</option>
              <option value="delivered">전달됨</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소됨</option>
              <option value="refunded">환불됨</option>
            </select>
          </div>

          {/* Has Dispute Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              분쟁 여부
            </label>
            <select
              value={filter.hasDispute}
              onChange={(e) => setFilter({ ...filter, hasDispute: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="true">분쟁 있음</option>
              <option value="false">분쟁 없음</option>
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
              <option value="lowest_amount">금액 낮은순</option>
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
              placeholder="주문번호 검색"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        emptyMessage="주문이 없습니다"
      />

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="주문 상세 정보"
          size="xl"
        >
          <div className="space-y-6">
            {/* Order Info */}
            <div>
              <h4 className="font-semibold text-lg mb-3">주문 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">주문번호</label>
                  <p className="text-gray-900 font-medium">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">주문일시</label>
                  <p className="text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">주문 상태</label>
                  <div>
                    <Badge variant={
                      selectedOrder.status === 'completed' ? 'success' :
                      selectedOrder.status === 'cancelled' ? 'error' :
                      selectedOrder.status === 'in_progress' ? 'warning' : 'info'
                    }>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">결제 상태</label>
                  <div>
                    <Badge variant={selectedOrder.payment_status === 'paid' ? 'success' : 'warning'}>
                      {selectedOrder.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">서비스 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">서비스명</label>
                  <p className="text-gray-900">{selectedOrder.service?.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">판매자</label>
                  <p className="text-gray-900">{selectedOrder.service?.seller?.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">담당자</label>
                  <p className="text-gray-900">{selectedOrder.service?.seller?.user?.name}</p>
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">구매자 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">이름</label>
                  <p className="text-gray-900">{selectedOrder.buyer?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-gray-900">{selectedOrder.buyer?.email}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">결제 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">주문 금액</label>
                  <p className="text-gray-900 font-semibold text-xl">
                    {selectedOrder.total_amount?.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">플랫폼 수수료</label>
                  <p className="text-gray-900 font-semibold">
                    {selectedOrder.platform_fee?.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold mb-3">관리 액션</h4>
              <div className="flex gap-2">
                {(selectedOrder.status === 'paid' || selectedOrder.status === 'in_progress') && (
                  <>
                    <button
                      onClick={() => openActionModal(selectedOrder, 'refund')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <i className="fas fa-undo mr-2"></i>
                      환불 처리
                    </button>
                    <button
                      onClick={() => openActionModal(selectedOrder, 'force_complete')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <i className="fas fa-check mr-2"></i>
                      강제 완료
                    </button>
                  </>
                )}
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => openActionModal(selectedOrder, 'cancel')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <i className="fas fa-times mr-2"></i>
                    주문 취소
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
            setRefundAmount(0)
          }}
          title={`주문 ${
            actionType === 'cancel' ? '취소' :
            actionType === 'refund' ? '환불' : '강제 완료'
          }`}
          footer={
            <>
              <button
                onClick={() => {
                  setShowActionModal(false)
                  setActionType(null)
                  setActionReason('')
                  setRefundAmount(0)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                확인
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              주문번호 <strong>{selectedOrder?.order_number}</strong>을(를){' '}
              {actionType === 'cancel' ? '취소' :
               actionType === 'refund' ? '환불' : '강제 완료'}
              하시겠습니까?
            </p>

            {actionType === 'refund' && (
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
                  최대 환불 가능 금액: {selectedOrder?.total_amount?.toLocaleString()}원
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="조치 사유를 입력하세요..."
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
