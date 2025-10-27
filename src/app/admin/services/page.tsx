'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable from '@/components/admin/common/DataTable'
import Badge from '@/components/admin/common/Badge'
import Modal from '@/components/admin/common/Modal'
import type { AdminServiceFilter } from '@/types/admin'

export default function AdminServicesPage() {
  const supabase = useMemo(() => createClient(), [])
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'hide' | 'delete' | null>(null)
  const [actionReason, setActionReason] = useState('')

  const [filter, setFilter] = useState<AdminServiceFilter>({
    status: 'all',
    category: [],
    priceRange: [0, 10000000],
    sellerVerified: 'all',
    hasDispute: 'all',
    searchKeyword: '',
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchCategories()
    fetchServices()
  }, [filter])

  async function fetchCategories() {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  async function fetchServices() {
    setLoading(true)
    try {
      let query = supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          status,
          base_price,
          delivery_days,
          created_at,
          seller:seller_profiles!seller_id(
            id,
            business_name,
            verification_status,
            user:users!user_id(name, email)
          ),
          category:categories!category_id(name)
        `)

      // Apply filters
      if (filter.status !== 'all') {
        query = query.eq('status', filter.status)
      }

      if (filter.category.length > 0) {
        query = query.in('category_id', filter.category)
      }

      if (filter.priceRange[0] > 0) {
        query = query.gte('base_price', filter.priceRange[0])
      }

      if (filter.priceRange[1] < 10000000) {
        query = query.lte('base_price', filter.priceRange[1])
      }

      if (filter.searchKeyword) {
        query = query.or(`title.ilike.%${filter.searchKeyword}%,description.ilike.%${filter.searchKeyword}%`)
      }

      // Apply sorting
      if (filter.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filter.sortBy === 'highest_price') {
        query = query.order('base_price', { ascending: false })
      } else if (filter.sortBy === 'popular') {
        // TODO: Order by popularity metric (views, orders, etc.)
        query = query.order('created_at', { ascending: false })
      } else if (filter.sortBy === 'most_orders') {
        // TODO: Order by order count
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error

      // Filter by seller verification status if needed
      let filteredData = data || []
      if (filter.sellerVerified === 'true') {
        filteredData = filteredData.filter((s: any) => s.seller?.verification_status === 'approved')
      } else if (filter.sellerVerified === 'false') {
        filteredData = filteredData.filter((s: any) => s.seller?.verification_status !== 'approved')
      }

      setServices(filteredData)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!selectedService || !actionType) return

    try {
      if (actionType === 'approve') {
        const { error } = await supabase
          .from('services')
          .update({ status: 'active' })
          .eq('id', selectedService.id)

        if (error) throw error

        // TODO: Send notification to seller
        alert(`${selectedService.title} 서비스가 승인되었습니다.`)
      } else if (actionType === 'reject') {
        const { error } = await supabase
          .from('services')
          .update({ status: 'rejected' })
          .eq('id', selectedService.id)

        if (error) throw error

        // TODO: Send notification with reason
        alert(`${selectedService.title} 서비스가 거절되었습니다.`)
      } else if (actionType === 'suspend') {
        const { error } = await supabase
          .from('services')
          .update({ status: 'suspended' })
          .eq('id', selectedService.id)

        if (error) throw error

        alert(`${selectedService.title} 서비스가 정지되었습니다.`)
      } else if (actionType === 'hide') {
        const { error } = await supabase
          .from('services')
          .update({ status: 'inactive' })
          .eq('id', selectedService.id)

        if (error) throw error

        alert(`${selectedService.title} 서비스가 숨김 처리되었습니다.`)
      } else if (actionType === 'delete') {
        const { error } = await supabase
          .from('services')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', selectedService.id)

        if (error) throw error

        alert(`${selectedService.title} 서비스가 삭제되었습니다.`)
      }

      setShowActionModal(false)
      setActionType(null)
      setActionReason('')
      fetchServices()
    } catch (error: any) {
      console.error('Action error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  function openActionModal(service: any, type: typeof actionType) {
    setSelectedService(service)
    setActionType(type)
    setShowActionModal(true)
  }

  const columns = [
    {
      key: 'title',
      label: '서비스',
      render: (service: any) => (
        <div>
          <div className="font-medium text-gray-900">{service.title}</div>
          <div className="text-xs text-gray-500">{service.category?.name}</div>
        </div>
      ),
    },
    {
      key: 'seller',
      label: '판매자',
      render: (service: any) => (
        <div>
          <div className="text-sm text-gray-900">{service.seller?.business_name}</div>
          <div className="text-xs text-gray-500">{service.seller?.user?.name}</div>
        </div>
      ),
    },
    {
      key: 'base_price',
      label: '가격',
      render: (service: any) => (
        <span className="font-semibold text-[#0f3460]">
          {service.base_price?.toLocaleString()}원
        </span>
      ),
    },
    {
      key: 'status',
      label: '상태',
      render: (service: any) => {
        const statusMap = {
          pending: { text: '승인대기', variant: 'warning' as const },
          active: { text: '활성', variant: 'success' as const },
          rejected: { text: '거절됨', variant: 'error' as const },
          suspended: { text: '정지됨', variant: 'error' as const },
          inactive: { text: '비활성', variant: 'gray' as const },
        }
        const status = statusMap[service.status as keyof typeof statusMap] || { text: service.status, variant: 'gray' as const }
        return <Badge variant={status.variant}>{status.text}</Badge>
      },
    },
    {
      key: 'verification',
      label: '인증',
      render: (service: any) => (
        service.seller?.verification_status === 'approved' ? (
          <i className="fas fa-check-circle text-green-500" title="인증됨"></i>
        ) : (
          <i className="fas fa-times-circle text-gray-400" title="미인증"></i>
        )
      ),
      width: 'w-20',
    },
    {
      key: 'created_at',
      label: '등록일',
      render: (service: any) => (
        <span className="text-gray-600">
          {new Date(service.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '액션',
      render: (service: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedService(service)
              setShowDetailModal(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="상세보기"
          >
            <i className="fas fa-eye"></i>
          </button>
          {service.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openActionModal(service, 'approve')
                }}
                className="text-green-600 hover:text-green-800"
                title="승인"
              >
                <i className="fas fa-check"></i>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openActionModal(service, 'reject')
                }}
                className="text-red-600 hover:text-red-800"
                title="거절"
              >
                <i className="fas fa-times"></i>
              </button>
            </>
          )}
          {service.status === 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openActionModal(service, 'suspend')
              }}
              className="text-orange-600 hover:text-orange-800"
              title="정지"
            >
              <i className="fas fa-ban"></i>
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
          <h1 className="text-3xl font-bold text-gray-900">서비스 관리</h1>
          <p className="text-gray-600 mt-1">전체 {services.length}개의 서비스</p>
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
              <option value="pending">승인대기</option>
              <option value="active">활성</option>
              <option value="rejected">거절됨</option>
              <option value="suspended">정지됨</option>
              <option value="inactive">비활성</option>
            </select>
          </div>

          {/* Category Filter - Simplified to single select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              onChange={(e) => {
                const val = e.target.value
                if (val === 'all') {
                  setFilter({ ...filter, category: [] })
                } else {
                  setFilter({ ...filter, category: [val] })
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seller Verified Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              판매자 인증
            </label>
            <select
              value={filter.sellerVerified}
              onChange={(e) => setFilter({ ...filter, sellerVerified: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="true">인증됨</option>
              <option value="false">미인증</option>
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
              <option value="popular">인기순</option>
              <option value="highest_price">가격 높은순</option>
              <option value="most_orders">주문 많은순</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 가격
            </label>
            <input
              type="number"
              value={filter.priceRange[0]}
              onChange={(e) => setFilter({
                ...filter,
                priceRange: [Number(e.target.value) || 0, filter.priceRange[1]]
              })}
              placeholder="최소 가격"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 가격
            </label>
            <input
              type="number"
              value={filter.priceRange[1]}
              onChange={(e) => setFilter({
                ...filter,
                priceRange: [filter.priceRange[0], Number(e.target.value) || 10000000]
              })}
              placeholder="최대 가격"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
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
              placeholder="서비스 제목, 설명 검색"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>
        </div>
      </div>

      {/* Services Table */}
      <DataTable
        data={services}
        columns={columns}
        loading={loading}
        emptyMessage="서비스가 없습니다"
      />

      {/* Service Detail Modal */}
      {showDetailModal && selectedService && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="서비스 상세 정보"
          size="xl"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="font-semibold text-lg mb-3">기본 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">제목</label>
                  <p className="text-gray-900">{selectedService.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">카테고리</label>
                  <p className="text-gray-900">{selectedService.category?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">기본 가격</label>
                  <p className="text-gray-900 font-semibold">
                    {selectedService.base_price?.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">배송 기간</label>
                  <p className="text-gray-900">{selectedService.delivery_days}일</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">설명</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedService.description}</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-lg mb-3">판매자 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">상호명</label>
                  <p className="text-gray-900">{selectedService.seller?.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">담당자</label>
                  <p className="text-gray-900">{selectedService.seller?.user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-gray-900">{selectedService.seller?.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">인증 상태</label>
                  <Badge variant={selectedService.seller?.verification_status === 'approved' ? 'success' : 'warning'}>
                    {selectedService.seller?.verification_status === 'approved' ? '인증됨' : '미인증'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold mb-3">관리 액션</h4>
              <div className="flex gap-2">
                {selectedService.status === 'pending' && (
                  <>
                    <button
                      onClick={() => openActionModal(selectedService, 'approve')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <i className="fas fa-check mr-2"></i>
                      승인
                    </button>
                    <button
                      onClick={() => openActionModal(selectedService, 'reject')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i>
                      거절
                    </button>
                  </>
                )}
                {selectedService.status === 'active' && (
                  <>
                    <button
                      onClick={() => openActionModal(selectedService, 'suspend')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <i className="fas fa-ban mr-2"></i>
                      정지
                    </button>
                    <button
                      onClick={() => openActionModal(selectedService, 'hide')}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <i className="fas fa-eye-slash mr-2"></i>
                      숨김
                    </button>
                  </>
                )}
                <button
                  onClick={() => openActionModal(selectedService, 'delete')}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  삭제
                </button>
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
          title={`서비스 ${
            actionType === 'approve' ? '승인' :
            actionType === 'reject' ? '거절' :
            actionType === 'suspend' ? '정지' :
            actionType === 'hide' ? '숨김' : '삭제'
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
                  actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' :
                  'bg-red-500 hover:bg-red-600'
                }`}
              >
                확인
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>{selectedService?.title}</strong> 서비스를{' '}
              {actionType === 'approve' ? '승인' :
               actionType === 'reject' ? '거절' :
               actionType === 'suspend' ? '정지' :
               actionType === 'hide' ? '숨김 처리' : '삭제'}
              하시겠습니까?
            </p>

            {(actionType === 'reject' || actionType === 'suspend' || actionType === 'delete') && (
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
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
