'use client'

import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

type ServiceStatus = 'all' | 'active' | 'inactive' | 'pending'

export default function SellerServicesPage() {
  const [statusFilter, setStatusFilter] = useState<ServiceStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: 실제로는 API에서 데이터를 가져와야 합니다
  const mockServices = [
    {
      id: '1',
      title: '로고 디자인 작업',
      thumbnailUrl: null,
      status: 'active',
      statusLabel: '활성',
      price: 50000,
      createdAt: '2024-12-01',
      viewCount: 342,
      favoriteCount: 28,
      orderCount: 15,
      rating: 4.8,
      reviewCount: 12
    },
    {
      id: '2',
      title: '영상 편집 서비스',
      thumbnailUrl: null,
      status: 'active',
      statusLabel: '활성',
      price: 150000,
      createdAt: '2024-11-15',
      viewCount: 521,
      favoriteCount: 45,
      orderCount: 23,
      rating: 4.9,
      reviewCount: 18
    },
    {
      id: '3',
      title: '명함 디자인',
      thumbnailUrl: null,
      status: 'inactive',
      statusLabel: '비활성',
      price: 30000,
      createdAt: '2024-10-20',
      viewCount: 189,
      favoriteCount: 12,
      orderCount: 8,
      rating: 4.5,
      reviewCount: 6
    }
  ]

  const filteredServices = mockServices.filter(service => {
    if (statusFilter !== 'all' && service.status !== statusFilter) return false
    if (searchQuery && !service.title.includes(searchQuery)) return false
    return true
  })

  const statusCounts = {
    all: mockServices.length,
    active: mockServices.filter(s => s.status === 'active').length,
    inactive: mockServices.filter(s => s.status === 'inactive').length,
    pending: mockServices.filter(s => s.status === 'pending').length
  }

  const tabs = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'active', label: '활성', count: statusCounts.active },
    { value: 'inactive', label: '비활성', count: statusCounts.inactive },
    { value: 'pending', label: '검토중', count: statusCounts.pending }
  ]

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">서비스 관리</h1>
              <p className="text-gray-600">등록한 서비스를 관리하세요</p>
            </div>
            <Link
              href="/mypage/seller/services/new"
              className="px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
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
            <div className="text-2xl font-bold text-gray-900">{mockServices.length}개</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">총 조회수</span>
              <i className="fas fa-eye text-purple-500"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {mockServices.reduce((sum, s) => sum + s.viewCount, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">총 찜</span>
              <i className="fas fa-heart text-red-500"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {mockServices.reduce((sum, s) => sum + s.favoriteCount, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">총 판매</span>
              <i className="fas fa-shopping-cart text-green-500"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {mockServices.reduce((sum, s) => sum + s.orderCount, 0)}건
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="서비스 제목으로 검색"
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
        <div className="mb-4 text-sm text-gray-600">
          총 <span className="font-bold text-gray-900">{filteredServices.length}</span>개의 서비스
        </div>

        {/* 서비스 목록 */}
        <div className="space-y-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#0f3460] transition-colors">
                <div className="flex gap-4">
                  {/* 썸네일 */}
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {service.thumbnailUrl ? (
                      <img src={service.thumbnailUrl} alt={service.title} className="w-full h-full object-cover" />
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
                            {service.statusLabel}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          등록일: {service.createdAt}
                        </div>

                        {/* 통계 */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span><i className="fas fa-eye mr-1"></i>{service.viewCount.toLocaleString()}</span>
                          <span><i className="fas fa-heart mr-1 text-red-500"></i>{service.favoriteCount}</span>
                          <span><i className="fas fa-shopping-cart mr-1"></i>{service.orderCount}건</span>
                          <span><i className="fas fa-star mr-1 text-yellow-500"></i>{service.rating} ({service.reviewCount})</span>
                        </div>

                        <div className="text-lg font-bold text-[#0f3460]">
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
                        className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
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
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <i className="fas fa-shopping-bag text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-600 text-lg mb-4">등록된 서비스가 없습니다</p>
              <Link
                href="/mypage/seller/services/new"
                className="inline-block px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
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
