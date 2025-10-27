'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable from '@/components/admin/common/DataTable'
import Badge from '@/components/admin/common/Badge'
import Modal from '@/components/admin/common/Modal'
import type { AdminReportFilter } from '@/types/admin'

export default function AdminReportsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'investigate' | 'resolve' | 'reject' | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [resolution, setResolution] = useState('')

  const [filter, setFilter] = useState<AdminReportFilter>({
    status: 'all',
    type: 'all',
    category: 'all',
    dateRange: { from: null, to: null },
    searchKeyword: '',
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchReports()
  }, [filter])

  async function fetchReports() {
    setLoading(true)
    try {
      let query = supabase
        .from('reports')
        .select(`
          id,
          category,
          reason,
          description,
          status,
          priority,
          created_at,
          reporter:users!reporter_id(name, email),
          reported_user:users!reported_user_id(name, email),
          service:services(title),
          review:reviews(rating, comment)
        `)

      // Apply filters
      if (filter.category !== 'all') {
        query = query.eq('category', filter.category)
      }

      if (filter.status !== 'all') {
        query = query.eq('status', filter.status)
      }

      if (filter.type !== 'all') {
        query = query.eq('type', filter.type)
      }

      if (filter.searchKeyword) {
        query = query.or(`description.ilike.%${filter.searchKeyword}%,reason.ilike.%${filter.searchKeyword}%`)
      }

      // Apply sorting
      if (filter.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filter.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else if (filter.sortBy === 'priority_high') {
        query = query.order('priority', { ascending: false })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!selectedReport || !actionType) return

    try {
      if (actionType === 'investigate') {
        const { error } = await supabase
          .from('reports')
          .update({ status: 'investigating' })
          .eq('id', selectedReport.id)

        if (error) throw error

        alert(`신고가 조사 중으로 변경되었습니다.`)
      } else if (actionType === 'resolve') {
        const { error } = await supabase
          .from('reports')
          .update({
            status: 'resolved',
            resolution: resolution,
          })
          .eq('id', selectedReport.id)

        if (error) throw error

        // TODO: Send notification to reporter and reported user
        alert(`신고가 해결 처리되었습니다.`)
      } else if (actionType === 'reject') {
        const { error } = await supabase
          .from('reports')
          .update({
            status: 'rejected',
            resolution: actionNote,
          })
          .eq('id', selectedReport.id)

        if (error) throw error

        alert(`신고가 기각되었습니다.`)
      }

      setShowActionModal(false)
      setActionType(null)
      setActionNote('')
      setResolution('')
      fetchReports()
    } catch (error: any) {
      console.error('Action error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  function openActionModal(report: any, type: typeof actionType) {
    setSelectedReport(report)
    setActionType(type)
    setShowActionModal(true)
  }

  const columns = [
    {
      key: 'category',
      label: '카테고리',
      render: (report: any) => {
        const categoryMap: Record<string, { text: string; variant: 'warning' | 'error' | 'info' }> = {
          user: { text: '사용자', variant: 'info' },
          service: { text: '서비스', variant: 'warning' },
          review: { text: '리뷰', variant: 'warning' },
          order: { text: '주문', variant: 'error' },
          payment: { text: '결제', variant: 'error' },
        }
        const cat = categoryMap[report.category as keyof typeof categoryMap] || { text: report.category, variant: 'info' as const }
        return <Badge variant={cat.variant} size="sm">{cat.text}</Badge>
      },
      width: 'w-24',
    },
    {
      key: 'reason',
      label: '사유',
      render: (report: any) => (
        <div>
          <div className="font-medium text-gray-900">{report.reason}</div>
          <div className="text-xs text-gray-500 line-clamp-1">{report.description}</div>
        </div>
      ),
    },
    {
      key: 'reporter',
      label: '신고자',
      render: (report: any) => (
        <div>
          <div className="text-sm text-gray-900">{report.reporter?.name}</div>
          <div className="text-xs text-gray-500">{report.reporter?.email}</div>
        </div>
      ),
    },
    {
      key: 'reported',
      label: '피신고자',
      render: (report: any) => (
        <div>
          {report.reported_user ? (
            <>
              <div className="text-sm text-gray-900">{report.reported_user?.name}</div>
              <div className="text-xs text-gray-500">{report.reported_user?.email}</div>
            </>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      label: '우선순위',
      render: (report: any) => {
        const priorityMap = {
          low: { text: '낮음', variant: 'gray' as const },
          medium: { text: '보통', variant: 'info' as const },
          high: { text: '높음', variant: 'warning' as const },
          urgent: { text: '긴급', variant: 'error' as const },
        }
        const priority = priorityMap[report.priority as keyof typeof priorityMap] || { text: report.priority, variant: 'gray' as const }
        return <Badge variant={priority.variant} size="sm">{priority.text}</Badge>
      },
      width: 'w-20',
    },
    {
      key: 'status',
      label: '상태',
      render: (report: any) => {
        const statusMap = {
          pending: { text: '대기', variant: 'warning' as const },
          investigating: { text: '조사중', variant: 'info' as const },
          resolved: { text: '해결', variant: 'success' as const },
          rejected: { text: '기각', variant: 'gray' as const },
        }
        const status = statusMap[report.status as keyof typeof statusMap] || { text: report.status, variant: 'gray' as const }
        return <Badge variant={status.variant} size="sm">{status.text}</Badge>
      },
      width: 'w-20',
    },
    {
      key: 'created_at',
      label: '신고일',
      render: (report: any) => (
        <span className="text-gray-600 text-sm">
          {new Date(report.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '액션',
      render: (report: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedReport(report)
              setShowDetailModal(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="상세보기"
          >
            <i className="fas fa-eye"></i>
          </button>
          {report.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openActionModal(report, 'investigate')
              }}
              className="text-orange-600 hover:text-orange-800"
              title="조사 시작"
            >
              <i className="fas fa-search"></i>
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
          <h1 className="text-3xl font-bold text-gray-900">신고 관리</h1>
          <p className="text-gray-600 mt-1">전체 {reports.length}건의 신고</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="user">사용자</option>
              <option value="service">서비스</option>
              <option value="review">리뷰</option>
              <option value="order">주문</option>
              <option value="payment">결제</option>
            </select>
          </div>

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
              <option value="pending">대기</option>
              <option value="investigating">조사중</option>
              <option value="resolved">해결</option>
              <option value="rejected">기각</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              유형
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="user">사용자</option>
              <option value="service">서비스</option>
              <option value="review">리뷰</option>
              <option value="message">메시지</option>
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
              <option value="priority_high">우선순위 높은순</option>
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

      {/* Reports Table */}
      <DataTable
        data={reports}
        columns={columns}
        loading={loading}
        emptyMessage="신고가 없습니다"
      />

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="신고 상세 정보"
          size="xl"
        >
          <div className="space-y-6">
            {/* Report Info */}
            <div>
              <h4 className="font-semibold text-lg mb-3">신고 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">카테고리</label>
                  <p className="text-gray-900">{selectedReport.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">우선순위</label>
                  <div>
                    <Badge variant={
                      selectedReport.priority === 'urgent' ? 'error' :
                      selectedReport.priority === 'high' ? 'warning' : 'info'
                    }>
                      {selectedReport.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">신고일</label>
                  <p className="text-gray-900">
                    {new Date(selectedReport.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">상태</label>
                  <div>
                    <Badge variant={
                      selectedReport.status === 'resolved' ? 'success' :
                      selectedReport.status === 'investigating' ? 'info' :
                      selectedReport.status === 'rejected' ? 'gray' : 'warning'
                    }>
                      {selectedReport.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">사유</label>
                  <p className="text-gray-900">{selectedReport.reason}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">상세 설명</label>
                  <p className="text-gray-900 whitespace-pre-wrap p-4 bg-gray-50 rounded-lg">
                    {selectedReport.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">신고자 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">이름</label>
                  <p className="text-gray-900">{selectedReport.reporter?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-gray-900">{selectedReport.reporter?.email}</p>
                </div>
              </div>
            </div>

            {/* Reported User/Content Info */}
            {selectedReport.reported_user && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-lg mb-3">피신고자 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">이름</label>
                    <p className="text-gray-900">{selectedReport.reported_user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">이메일</label>
                    <p className="text-gray-900">{selectedReport.reported_user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Related Content */}
            {selectedReport.service && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-lg mb-3">관련 서비스</h4>
                <p className="text-gray-900">{selectedReport.service?.title}</p>
              </div>
            )}

            {selectedReport.review && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-lg mb-3">관련 리뷰</h4>
                <div>
                  <p className="text-gray-900">평점: {selectedReport.review?.rating}.0</p>
                  <p className="text-gray-900 mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedReport.review?.comment}
                  </p>
                </div>
              </div>
            )}

            {/* Admin Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold mb-3">관리 액션</h4>
              <div className="flex gap-2">
                {selectedReport.status === 'pending' && (
                  <button
                    onClick={() => openActionModal(selectedReport, 'investigate')}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <i className="fas fa-search mr-2"></i>
                    조사 시작
                  </button>
                )}
                {(selectedReport.status === 'pending' || selectedReport.status === 'investigating') && (
                  <>
                    <button
                      onClick={() => openActionModal(selectedReport, 'resolve')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <i className="fas fa-check mr-2"></i>
                      해결 처리
                    </button>
                    <button
                      onClick={() => openActionModal(selectedReport, 'reject')}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i>
                      기각
                    </button>
                  </>
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
            setActionNote('')
            setResolution('')
          }}
          title={`신고 ${
            actionType === 'investigate' ? '조사 시작' :
            actionType === 'resolve' ? '해결 처리' : '기각'
          }`}
          footer={
            <>
              <button
                onClick={() => {
                  setShowActionModal(false)
                  setActionType(null)
                  setActionNote('')
                  setResolution('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  actionType === 'resolve' ? 'bg-green-500 hover:bg-green-600' :
                  actionType === 'investigate' ? 'bg-orange-500 hover:bg-orange-600' :
                  'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                확인
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {selectedReport?.reporter?.name}님의 신고를{' '}
              {actionType === 'investigate' ? '조사 시작' :
               actionType === 'resolve' ? '해결 처리' : '기각'}
              하시겠습니까?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>카테고리:</strong> {selectedReport?.category}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>사유:</strong> {selectedReport?.reason}
              </p>
            </div>

            {actionType === 'resolve' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  해결 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="해결 조치 내용을 입력하세요..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  rows={4}
                  required
                />
              </div>
            )}

            {actionType === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기각 사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="기각 사유를 입력하세요..."
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
