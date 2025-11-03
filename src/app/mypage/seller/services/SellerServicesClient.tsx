'use client'

import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'
import EmptyState from '@/components/common/EmptyState'
import { createClient } from '@/lib/supabase/client'

type ServiceStatus = 'all' | 'active' | 'inactive' | 'pending'

interface Props {
  initialServices: any[]
  statusFilter: ServiceStatus
  statusCounts: {
    all: number
    active: number
    inactive: number
    pending: number
  }
}

export default function SellerServicesClient({ initialServices, statusFilter, statusCounts }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [services, setServices] = useState(initialServices)

  async function handleDismissRejection(revisionId: string) {
    if (!confirm('이 반려 메시지를 삭제하시겠습니까?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('service_revisions')
        .delete()
        .eq('id', revisionId)

      if (error) throw error

      // UI 업데이트
      setServices(services.map((service: any) => {
        if (service.rejectedRevision?.id === revisionId) {
          const { rejectedRevision, ...rest } = service
          return rest
        }
        return service
      }))

      alert('반려 메시지가 삭제되었습니다.')
    } catch (err: any) {
      console.error('반려 메시지 삭제 실패:', err)
      alert('삭제에 실패했습니다: ' + err.message)
    }
  }

  async function handleToggleStatus(serviceId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const message = newStatus === 'active'
      ? '서비스를 활성화하시겠습니까? 고객에게 다시 노출됩니다.'
      : '서비스를 일시정지하시겠습니까? 고객에게 노출되지 않습니다.'

    if (!confirm(message)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('services')
        .update({ status: newStatus })
        .eq('id', serviceId)

      if (error) throw error

      // UI 업데이트
      setServices(services.map((service: any) =>
        service.id === serviceId ? { ...service, status: newStatus } : service
      ))

      alert(newStatus === 'active' ? '서비스가 활성화되었습니다.' : '서비스가 일시정지되었습니다.')
    } catch (err: any) {
      console.error('상태 변경 실패:', err)
      alert('상태 변경에 실패했습니다: ' + err.message)
    }
  }

  async function handleDeleteService(serviceId: string, serviceTitle: string) {
    if (!confirm(`"${serviceTitle}" 서비스를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.\n- 진행 중인 주문이 있는 경우 삭제할 수 없습니다.\n- 모든 통계 데이터가 함께 삭제됩니다.`)) return

    try {
      const supabase = createClient()

      // 1. 진행 중인 주문 확인
      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('service_id', serviceId)
        .in('status', ['paid', 'in_progress', 'delivered'])
        .limit(1)

      if (ordersError) throw ordersError

      if (activeOrders && activeOrders.length > 0) {
        alert('진행 중인 주문이 있어 삭제할 수 없습니다.\n모든 주문이 완료되거나 취소된 후 삭제할 수 있습니다.')
        return
      }

      // 2. 서비스 삭제 (CASCADE로 관련 데이터도 함께 삭제됨)
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (deleteError) throw deleteError

      // UI 업데이트
      setServices(services.filter((service: any) => service.id !== serviceId))

      alert('서비스가 성공적으로 삭제되었습니다.')
    } catch (err: any) {
      console.error('서비스 삭제 실패:', err)
      alert('삭제에 실패했습니다: ' + err.message)
    }
  }

  const filteredServices = services.filter(service => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return service.title?.toLowerCase().includes(query)
    }
    return true
  })

  const tabs = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'active', label: '활성', count: statusCounts.active },
    { value: 'inactive', label: '비활성', count: statusCounts.inactive },
    { value: 'pending', label: '검토중', count: statusCounts.pending }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
          <i className="fas fa-check-circle"></i>
          활성
        </span>
      case 'inactive':
        return <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">비활성</span>
      case 'pending':
        return <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
          <i className="fas fa-clock"></i>
          검토중
        </span>
      case 'rejected':
        return <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
          <i className="fas fa-times-circle"></i>
          반려됨
        </span>
      case 'draft':
        return <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">임시저장</span>
      default:
        return <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">서비스 관리</h1>
            <p className="text-gray-600">내 서비스를 관리하세요</p>
          </div>
          <Link
            href="/mypage/seller/services/new"
            className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
          >
            <i className="fas fa-plus mr-2"></i>
            새 서비스 등록
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/mypage/seller/services?status=${tab.value}`}
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
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="서비스 검색..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
          />
        </div>

        <div className="mb-4 text-sm text-gray-600">
          총 <span className="font-bold text-gray-900">{filteredServices.length}</span>개의 서비스
        </div>

        {filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#0f3460] transition-colors">
                <div className="flex">
                  {/* 왼쪽 썸네일 */}
                  <div className="w-48 h-32 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {service.thumbnail_url ? (
                      <img src={service.thumbnail_url} alt={service.title} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-image text-gray-400 text-3xl"></i>
                    )}
                  </div>

                  {/* 오른쪽 내용 */}
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">{service.title}</h3>
                      <div className="flex gap-2">
                        {getStatusBadge(service.status)}
                        {service.hasPendingRevision && (
                          <span className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1">
                            <i className="fas fa-hourglass-half"></i>
                            승인 대기중
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{service.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{service.price?.toLocaleString()}원~</span>
                        <span><i className="fas fa-eye mr-1"></i>{service.view_count || 0}</span>
                        <span><i className="fas fa-heart mr-1"></i>{service.favorite_count || 0}</span>
                        <span><i className="fas fa-shopping-cart mr-1"></i>{service.order_count || 0}</span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={`/mypage/seller/services/${service.id}/edit`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          수정
                        </Link>
                        <Link
                          href={`/services/${service.id}`}
                          target="_blank"
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          보기
                        </Link>
                        <Link
                          href={`/mypage/seller/services/statistics?id=${service.id}`}
                          className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-chart-bar mr-1"></i>
                          통계
                        </Link>

                        {/* 활성화/일시정지 버튼 - active 또는 inactive 상태일 때만 표시 */}
                        {(service.status === 'active' || service.status === 'inactive') && (
                          <button
                            onClick={() => handleToggleStatus(service.id, service.status)}
                            className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                              service.status === 'active'
                                ? 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                : 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            <i className={`fas ${service.status === 'active' ? 'fa-pause' : 'fa-play'} mr-1`}></i>
                            {service.status === 'active' ? '일시정지' : '활성화'}
                          </button>
                        )}

                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => handleDeleteService(service.id, service.title)}
                          className="px-4 py-2 border border-red-300 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 반려 메시지 */}
                {service.rejectedRevision && (
                  <div className="mt-3 mx-4 mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-exclamation-circle text-red-500"></i>
                          <span className="font-bold text-red-800">수정 요청이 반려되었습니다</span>
                          <span className="text-xs text-red-600">
                            ({new Date(service.rejectedRevision.reviewed_at).toLocaleDateString('ko-KR')})
                          </span>
                        </div>
                        <p className="text-sm text-red-700 whitespace-pre-wrap">
                          {service.rejectedRevision.admin_note}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDismissRejection(service.rejectedRevision.id)}
                        className="ml-4 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        <i className="fas fa-times mr-1"></i>
                        확인
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="fa-briefcase"
            title="등록된 서비스가 없습니다"
            description="첫 서비스를 등록해보세요"
          />
        )}
      </main>
    </>
  )
}
