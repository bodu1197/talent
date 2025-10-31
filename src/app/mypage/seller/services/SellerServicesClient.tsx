'use client'

import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'
import EmptyState from '@/components/common/EmptyState'

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

  const filteredServices = initialServices.filter(service => {
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
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">활성</span>
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">비활성</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">검토중</span>
      default:
        return null
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#0f3460] transition-colors">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {service.thumbnail_url ? (
                    <img src={service.thumbnail_url} alt={service.title} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-image text-gray-400 text-4xl"></i>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{service.title}</h3>
                    {getStatusBadge(service.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{service.base_price?.toLocaleString()}원~</span>
                    <span><i className="fas fa-eye mr-1"></i>{service.view_count || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/mypage/seller/services/${service.id}/edit`}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
                    >
                      수정
                    </Link>
                    <Link
                      href={`/mypage/seller/services/statistics?id=${service.id}`}
                      className="flex-1 px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium text-center"
                    >
                      통계
                    </Link>
                  </div>
                </div>
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
