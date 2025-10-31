'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { getSellerServices, getSellerServicesCount } from '@/lib/supabase/queries/services'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import EmptyState from '@/components/common/EmptyState'

type ServiceStatus = 'all' | 'active' | 'inactive' | 'pending'

export default function SellerServicesPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<ServiceStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0,
    pending: 0
  })

  useEffect(() => {
    if (user) {
      loadServices()
      loadStatusCounts()
    }
  }, [user, statusFilter])

  async function loadServices() {
    try {
      setLoading(true)
      setError(null)
      const data = await getSellerServices(user!.id, statusFilter === 'all' ? undefined : statusFilter)
      setServices(data)
    } catch (err: any) {
      console.error('서비스 조회 실패:', err)
      setError(err.message || '서비스 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function loadStatusCounts() {
    try {
      const [activeCount, inactiveCount, pendingCount] = await Promise.all([
        getSellerServicesCount(user!.id, 'active'),
        getSellerServicesCount(user!.id, 'inactive'),
        getSellerServicesCount(user!.id, 'pending')
      ])

      setStatusCounts({
        all: activeCount + inactiveCount + pendingCount,
        active: activeCount,
        inactive: inactiveCount,
        pending: pendingCount
      })
    } catch (err) {
      console.error('상태별 카운트 조회 실패:', err)
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

  if (loading) {
    return (
      <>
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-8">
          <LoadingSpinner message="서비스 목록을 불러오는 중..." />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-8">
          <ErrorState message={error} retry={loadServices} />
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">서비스 관리</h1>
              <p className="text-gray-600">등록한 서비스를 관리하세요</p>
            </div>
            <Link
              href="/mypage/seller/services/new"
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              서비스 등록
            </Link>
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">총 서비스</span>
              <i className="fas fa-shopping-bag text-blue-500"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">{services.length}개</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">총 조회수</span>
              <i className="fas fa-eye text-purple-500"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {services.reduce((sum, s) => sum + (s.view_count || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">총 찜</span>
              <i className="fas fa-heart text-red-500"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {services.reduce((sum, s) => sum + (s.favorite_count || 0), 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">총 판매</span>
              <i className="fas fa-shopping-cart text-green-500"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {services.reduce((sum, s) => sum + (s.order_count || 0), 0)}건
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as ServiceStatus)}
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="서비스 제목으로 검색"
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
        <div className="mb-4 text-sm text-gray-600">
          총 <span className="font-bold text-gray-900">{filteredServices.length}</span>개의 서비스
        </div>

        {/* 서비스 목록 */}
        <div className="space-y-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => {
              const getStatusLabel = (status: string) => {
                switch (status) {
                  case 'active': return '활성'
                  case 'inactive': return '비활성'
                  case 'pending': return '검토중'
                  default: return status
                }
              }

              return (
                <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-primary transition-colors">
                  <div className="flex gap-4">
                    {/* 썸네일 */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {service.thumbnail_url ? (
                        <img src={service.thumbnail_url} alt={service.title} className="w-full h-full object-cover" />
                      ) : (
                        <i className="fas fa-image text-gray-400 text-3xl"></i>
                      )}
                    </div>

                    {/* 서비스 정보 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              service.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : service.status === 'inactive'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {getStatusLabel(service.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            등록일: {new Date(service.created_at).toLocaleDateString('ko-KR')}
                          </div>

                          {/* 통계 */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span><i className="fas fa-eye mr-1"></i>{(service.view_count || 0).toLocaleString()}</span>
                            <span><i className="fas fa-heart mr-1 text-red-500"></i>{service.favorite_count || 0}</span>
                            <span><i className="fas fa-shopping-cart mr-1"></i>{service.order_count || 0}건</span>
                            <span><i className="fas fa-star mr-1 text-yellow-500"></i>{service.rating || 0} ({service.review_count || 0})</span>
                          </div>

                          <div className="text-lg font-bold text-brand-primary">
                            {service.price.toLocaleString()}원
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/services/${service.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          미리보기
                        </Link>
                        <Link
                          href={`/mypage/seller/services/${service.id}/edit`}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-edit mr-2"></i>
                          수정
                        </Link>
                        <Link
                          href={`/mypage/seller/services/statistics?id=${service.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-chart-bar mr-2"></i>
                          통계
                        </Link>
                        {service.status === 'active' ? (
                          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                            <i className="fas fa-pause mr-2"></i>
                            비활성화
                          </button>
                        ) : (
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                            <i className="fas fa-play mr-2"></i>
                            활성화
                          </button>
                        )}
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                          <i className="fas fa-trash mr-2"></i>
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <i className="fas fa-shopping-bag text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-600 text-lg mb-4">등록된 서비스가 없습니다</p>
              <Link
                href="/mypage/seller/services/new"
                className="inline-block px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium"
              >
                <i className="fas fa-plus mr-2"></i>
                서비스 등록하기
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
