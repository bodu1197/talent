'use client'

import { useState, useEffect } from 'react'
import {
  getAdminServices,
  getAdminServicesCount,
  getServiceRevisions,
  getServiceRevisionsCount
} from '@/lib/supabase/queries/admin'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import EmptyState from '@/components/common/EmptyState'

type ServiceStatus = 'all' | 'active' | 'inactive' | 'pending' | 'revisions'

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [revisions, setRevisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ServiceStatus>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    revisions: 0
  })

  useEffect(() => {
    loadServices()
    loadStatusCounts()
  }, [statusFilter])

  async function loadServices() {
    try {
      setLoading(true)
      setError(null)

      if (statusFilter === 'revisions') {
        // 수정 요청 목록 조회
        const data = await getServiceRevisions({ status: 'pending' })
        setRevisions(data)
      } else {
        // 일반 서비스 목록 조회
        const data = await getAdminServices({
          status: statusFilter === 'all' ? undefined : statusFilter,
          searchQuery
        })
        setServices(data)
      }
    } catch (err: any) {
      console.error('서비스 조회 실패:', err)
      console.error('오류 상세:', JSON.stringify(err, null, 2))
      const errorMessage = err?.message || err?.error_description || err?.hint || '서비스 목록을 불러오는데 실패했습니다'
      setError(`오류: ${errorMessage}\n\n상세: ${JSON.stringify(err, null, 2)}`)
    } finally {
      setLoading(false)
    }
  }

  async function loadStatusCounts() {
    try {
      const [allCount, activeCount, inactiveCount, pendingCount, revisionsCount] = await Promise.all([
        getAdminServicesCount(),
        getAdminServicesCount('active'),
        getAdminServicesCount('inactive'),
        getAdminServicesCount('pending'),
        getServiceRevisionsCount('pending')
      ])

      setStatusCounts({
        all: allCount,
        active: activeCount,
        inactive: inactiveCount,
        pending: pendingCount,
        revisions: revisionsCount
      })
    } catch (err) {
      console.error('상태별 카운트 조회 실패:', err)
    }
  }

  async function handleApprove(serviceId: string) {
    if (!confirm('이 서비스를 승인하시겠습니까?')) return

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error } = await supabase
        .from('services')
        .update({ status: 'active' })
        .eq('id', serviceId)

      if (error) throw error

      alert('서비스가 승인되었습니다.')
      loadServices()
      loadStatusCounts()
    } catch (err: any) {
      console.error('승인 실패:', err)
      alert('승인에 실패했습니다: ' + err.message)
    }
  }

  async function handleReject(serviceId: string) {
    const reason = prompt('반려 사유를 입력해주세요:')
    if (!reason) return

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error } = await supabase
        .from('services')
        .update({
          status: 'suspended',
          // rejection_reason 필드가 있다면 추가
        })
        .eq('id', serviceId)

      if (error) throw error

      alert('서비스가 반려되었습니다.')
      loadServices()
      loadStatusCounts()
    } catch (err: any) {
      console.error('반려 실패:', err)
      alert('반려에 실패했습니다: ' + err.message)
    }
  }

  const filteredServices = services.filter(service => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return service.title?.toLowerCase().includes(query) ||
             service.seller?.user?.name?.toLowerCase().includes(query) ||
             service.seller?.business_name?.toLowerCase().includes(query)
    }
    return true
  })

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '활성'
      case 'inactive': return '비활성'
      case 'pending': return '검토중'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const tabs = [
    { value: 'all' as ServiceStatus, label: '전체', count: statusCounts.all },
    { value: 'active' as ServiceStatus, label: '활성', count: statusCounts.active },
    { value: 'inactive' as ServiceStatus, label: '비활성', count: statusCounts.inactive },
    { value: 'pending' as ServiceStatus, label: '검토중', count: statusCounts.pending },
    { value: 'revisions' as ServiceStatus, label: '수정 요청', count: statusCounts.revisions }
  ]

  if (loading) {
    return <LoadingSpinner message="서비스 목록을 불러오는 중..." />
  }

  if (error) {
    return <ErrorState message={error} retry={loadServices} />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">서비스 관리</h1>
        <p className="text-gray-600 mt-1">전체 서비스를 관리하세요</p>
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
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === tab.value
                    ? 'bg-brand-primary text-white'
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
        총 <span className="font-bold text-gray-900">{statusFilter === 'revisions' ? revisions.length : filteredServices.length}</span>개의 {statusFilter === 'revisions' ? '수정 요청' : '서비스'}
      </div>

      {/* 서비스 목록 또는 수정 요청 목록 */}
      {statusFilter === 'revisions' ? (
        // 수정 요청 목록
        <div className="bg-white rounded-lg border border-gray-200">
          {revisions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      원본 서비스
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수정 제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      판매자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수정 요청일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수정 사유
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revisions.map((revision) => (
                    <tr key={revision.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <a
                            href={`/services/${revision.service_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#0f3460] hover:underline"
                          >
                            {revision.service?.title || '서비스 제목 없음'}
                            <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{revision.title}</div>
                        {revision.thumbnail_url && (
                          <img
                            src={revision.thumbnail_url}
                            alt="수정된 썸네일"
                            className="w-10 h-10 rounded object-cover mt-1"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{revision.seller?.user?.name || revision.seller?.business_name}</div>
                        <div className="text-xs text-gray-500">{revision.seller?.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(revision.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {revision.revision_note || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={`/admin/services/revisions/${revision.id}`}
                          className="px-4 py-2 bg-[#0f3460] text-white rounded hover:bg-[#1a4d8f] transition-colors font-medium inline-block"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          상세보기 및 승인/반려
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12">
              <EmptyState
                icon="fa-edit"
                title="수정 요청이 없습니다"
                description="현재 대기중인 수정 요청이 없습니다"
              />
            </div>
          )}
        </div>
      ) : (
        // 일반 서비스 목록
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredServices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      서비스
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
                      등록일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      통계
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {service.thumbnail_url && (
                            <img
                              src={service.thumbnail_url}
                              alt={service.title}
                              className="w-10 h-10 rounded object-cover mr-3"
                            />
                          )}
                          <a
                            href={`/services/${service.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#0f3460] hover:underline"
                          >
                            {service.title}
                            <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{service.seller?.user?.name || service.seller?.business_name}</div>
                        <div className="text-xs text-gray-500">{service.seller?.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.price?.toLocaleString()}원
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(service.status)}`}>
                          {getStatusLabel(service.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(service.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2 text-xs">
                          <span><i className="fas fa-eye"></i> {service.view_count || 0}</span>
                          <span><i className="fas fa-heart text-red-500"></i> {service.favorite_count || 0}</span>
                          <span><i className="fas fa-shopping-cart"></i> {service.order_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {service.status === 'pending' ? (
                          <a
                            href={`/admin/services/pending/${service.id}`}
                            className="px-4 py-2 bg-[#0f3460] text-white rounded hover:bg-[#1a4d8f] transition-colors font-medium inline-block"
                          >
                            <i className="fas fa-eye mr-2"></i>
                            상세보기 및 승인/반려
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
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
                title="서비스가 없습니다"
                description="검색 조건에 맞는 서비스가 없습니다"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
