'use client'

import { useState, useEffect } from 'react'
import { getServiceRevisions, getServiceRevisionsCount, approveServiceRevision, rejectServiceRevision } from '@/lib/supabase/queries/admin'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import EmptyState from '@/components/common/EmptyState'

type RevisionStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminServiceRevisionsPage() {
  const [revisions, setRevisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<RevisionStatus>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    loadRevisions()
    loadStatusCounts()
  }, [statusFilter])

  async function loadRevisions() {
    try {
      setLoading(true)
      setError(null)
      const data = await getServiceRevisions({
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        searchQuery
      })
      setRevisions(data)
    } catch (err: any) {
      console.error('수정 요청 조회 실패:', err)
      setError(err?.message || '수정 요청 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function loadStatusCounts() {
    try {
      const [allCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
        getServiceRevisionsCount(),
        getServiceRevisionsCount('pending'),
        getServiceRevisionsCount('approved'),
        getServiceRevisionsCount('rejected')
      ])

      setStatusCounts({
        all: allCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      })
    } catch (err) {
      console.error('상태별 카운트 조회 실패:', err)
    }
  }

  async function handleApprove(revisionId: string) {
    if (!confirm('이 수정 요청을 승인하시겠습니까? 서비스가 업데이트됩니다.')) return

    try {
      await approveServiceRevision(revisionId)
      alert('수정 요청이 승인되었습니다.')
      loadRevisions()
      loadStatusCounts()
    } catch (err: any) {
      console.error('승인 실패:', err)
      alert('승인에 실패했습니다: ' + err.message)
    }
  }

  async function handleReject(revisionId: string) {
    const reason = prompt('반려 사유를 입력해주세요:')
    if (!reason) return

    try {
      await rejectServiceRevision(revisionId, reason)
      alert('수정 요청이 반려되었습니다.')
      loadRevisions()
      loadStatusCounts()
    } catch (err: any) {
      console.error('반려 실패:', err)
      alert('반려에 실패했습니다: ' + err.message)
    }
  }

  const filteredRevisions = revisions.filter(revision => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return revision.title?.toLowerCase().includes(query) ||
             revision.service?.title?.toLowerCase().includes(query) ||
             revision.seller?.user?.name?.toLowerCase().includes(query) ||
             revision.seller?.business_name?.toLowerCase().includes(query)
    }
    return true
  })

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '검토중'
      case 'approved': return '승인됨'
      case 'rejected': return '반려됨'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const tabs = [
    { value: 'all' as RevisionStatus, label: '전체', count: statusCounts.all },
    { value: 'pending' as RevisionStatus, label: '검토중', count: statusCounts.pending },
    { value: 'approved' as RevisionStatus, label: '승인됨', count: statusCounts.approved },
    { value: 'rejected' as RevisionStatus, label: '반려됨', count: statusCounts.rejected }
  ]

  if (loading) {
    return <LoadingSpinner message="수정 요청 목록을 불러오는 중..." />
  }

  if (error) {
    return <ErrorState message={error} retry={loadRevisions} />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">서비스 수정 요청 관리</h1>
        <p className="text-gray-600 mt-1">판매자의 서비스 수정 요청을 검토하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'border-[#0f3460] text-[#0f3460]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === tab.value
                    ? 'bg-[#0f3460] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="서비스명 또는 판매자명으로 검색"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <i className="fas fa-redo-alt mr-2"></i>
            초기화
          </button>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-600">
        총 <span className="font-bold text-gray-900">{filteredRevisions.length}</span>개의 수정 요청
      </div>

      {/* 수정 요청 목록 */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredRevisions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    원본 서비스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수정 내용
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    판매자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRevisions.map((revision) => (
                  <tr key={revision.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {revision.service?.thumbnail_url && (
                          <img
                            src={revision.service.thumbnail_url}
                            alt={revision.service.title}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <a
                            href={`/services/${revision.service_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#0f3460] hover:underline"
                          >
                            {revision.service?.title}
                            <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                          </a>
                          <div className="text-xs text-gray-500">
                            현재 상태: {revision.service?.status}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {revision.thumbnail_url && (
                        <img
                          src={revision.thumbnail_url}
                          alt={revision.title}
                          className="w-10 h-10 rounded object-cover mb-2"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{revision.title}</div>
                      {revision.description && (
                        <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {revision.description}
                        </div>
                      )}
                      {revision.revision_note && (
                        <div className="text-xs text-blue-600 mt-1">
                          <i className="fas fa-info-circle mr-1"></i>
                          {revision.revision_note}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{revision.seller?.user?.name || revision.seller?.business_name}</div>
                      <div className="text-xs text-gray-500">{revision.seller?.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {revision.price?.toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(revision.status)}`}>
                        {getStatusLabel(revision.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(revision.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {revision.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(revision.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleReject(revision.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                          >
                            반려
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          {revision.reviewed_at && (
                            <div>
                              검토일: {new Date(revision.reviewed_at).toLocaleDateString('ko-KR')}
                            </div>
                          )}
                          {revision.admin_note && (
                            <div className="mt-1 text-red-600">
                              {revision.admin_note}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <EmptyState
              icon="fa-box"
              title="수정 요청이 없습니다"
              description="검색 조건에 맞는 수정 요청이 없습니다"
            />
          </div>
        )}
      </div>
    </div>
  )
}
