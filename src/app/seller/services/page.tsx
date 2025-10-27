'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type ServiceStatus = 'all' | 'draft' | 'pending_review' | 'active' | 'suspended'

interface Service {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  price: number
  delivery_days: number
  status: string
  views: number
  clicks: number
  orders_count: number
  rating: number
  review_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export default function SellerServicesPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ServiceStatus>('all')

  useEffect(() => {
    const fetchServices = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('services')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      const { data, error } = await query

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('서비스 목록 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
    }

    if (!user) {
      router.push('/auth/login')
      return
    }

    if (profile && profile.user_type !== 'seller' && profile.user_type !== 'both') {
      router.push('/profile')
      return
    }

    fetchServices()
  }, [user, profile, activeTab, supabase])

  const handleDeleteService = async (serviceId: string, title: string) => {
    if (!confirm(`"${title}" 서비스를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId)

      if (error) throw error

      setServices(services.filter((s) => s.id !== serviceId))
      alert('서비스가 삭제되었습니다.')
    } catch (error: any) {
      console.error('서비스 삭제 실패:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleToggleStatus = async (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'

    try {
      const { error } = await (supabase as any)
        .from('services')
        .update({ status: newStatus })
        .eq('id', serviceId)

      if (error) throw error

      setServices(
        services.map((s) => (s.id === serviceId ? { ...s, status: newStatus } : s))
      )
    } catch (error) {
      console.error('상태 변경 실패:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { text: string; class: string } } = {
      draft: { text: '초안', class: 'bg-gray-100 text-gray-800' },
      pending_review: { text: '검토중', class: 'bg-yellow-100 text-yellow-800' },
      active: { text: '활성', class: 'bg-green-100 text-green-800' },
      suspended: { text: '중단', class: 'bg-red-100 text-red-800' },
    }
    const badge = badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>{badge.text}</span>
  }

  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'active', label: '활성' },
    { key: 'draft', label: '초안' },
    { key: 'pending_review', label: '검토중' },
    { key: 'suspended', label: '중단' },
  ]

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-1200">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">내 서비스 관리</h1>
            <p className="text-gray-600">등록한 서비스를 관리하고 수정할 수 있습니다.</p>
          </div>
          <Link href="/services/new" className="btn-primary px-6 py-3">
            <i className="fas fa-plus mr-2"></i>
            새 서비스 등록
          </Link>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ServiceStatus)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2 border-[#0f3460] text-[#0f3460]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 서비스 목록 */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="spinner-lg"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-briefcase text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">등록된 서비스가 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 서비스를 등록해보세요!</p>
            <Link href="/services/new" className="btn-primary px-6 py-2 inline-block">
              <i className="fas fa-plus mr-2"></i>
              서비스 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex gap-6">
                    {/* 썸네일 */}
                    <div className="w-48 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {service.thumbnail_url ? (
                        <img
                          src={service.thumbnail_url}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-image text-gray-300 text-3xl"></i>
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(service.status)}
                            {service.is_featured && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                ⭐ 프리미엄
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold mb-1">{service.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-[#0f3460]">
                            {service.price.toLocaleString()}원
                          </div>
                          <div className="text-sm text-gray-500">{service.delivery_days}일 작업</div>
                        </div>
                      </div>

                      {/* 통계 */}
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div>
                          <i className="far fa-eye mr-1"></i>
                          조회 {service.views}
                        </div>
                        <div>
                          <i className="fas fa-shopping-bag mr-1"></i>
                          주문 {service.orders_count}
                        </div>
                        <div>
                          <i className="fas fa-star text-yellow-400 mr-1"></i>
                          {service.rating.toFixed(1)} ({service.review_count})
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <Link
                          href={`/services/${service.id}`}
                          className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm"
                        >
                          <i className="far fa-eye mr-1"></i>
                          미리보기
                        </Link>
                        <Link
                          href={`/services/${service.id}/edit`}
                          className="px-4 py-2 border border-[#0f3460] text-[#0f3460] rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          수정
                        </Link>
                        {(service.status === 'active' || service.status === 'suspended') && (
                          <button
                            onClick={() => handleToggleStatus(service.id, service.status)}
                            className={`px-4 py-2 border rounded-lg transition-colors text-sm ${
                              service.status === 'active'
                                ? 'border-orange-600 text-orange-600 hover:bg-orange-50'
                                : 'border-green-600 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            <i className={`fas ${service.status === 'active' ? 'fa-pause' : 'fa-play'} mr-1`}></i>
                            {service.status === 'active' ? '중단' : '재개'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteService(service.id, service.title)}
                          className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하단 정보 */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <div>
                      생성일: {new Date(service.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      최종 수정: {new Date(service.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
