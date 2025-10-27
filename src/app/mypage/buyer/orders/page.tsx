'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/mypage/Sidebar'
import OrderCard from '@/components/mypage/OrderCard'
import Link from 'next/link'

type OrderStatus = 'all' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'

interface OrderFilter {
  status: OrderStatus
  searchQuery: string
  startDate: string
  endDate: string
}

export default function BuyerOrdersPage() {
  const searchParams = useSearchParams()
  const statusFromUrl = (searchParams.get('status') as OrderStatus) || 'all'

  const [filters, setFilters] = useState<OrderFilter>({
    status: statusFromUrl,
    searchQuery: '',
    startDate: '',
    endDate: ''
  })

  // TODO: 실제로는 API에서 데이터를 가져와야 합니다
  const mockOrders = [
    {
      id: '1',
      orderNumber: '12345',
      title: '로고 디자인 작업',
      thumbnailUrl: null,
      sellerName: '디자인스튜디오',
      status: 'delivered',
      statusLabel: '도착 확인 대기',
      statusColor: 'red' as const,
      price: 50000,
      orderDate: '2025-01-27 14:30',
      expectedDeliveryDate: '2025-02-03',
      daysLeft: 0,
      requirements: '미니멀한 느낌의 로고를 원합니다.'
    },
    {
      id: '2',
      orderNumber: '12344',
      title: '영상 편집',
      thumbnailUrl: null,
      sellerName: '비디오프로',
      status: 'in_progress',
      statusLabel: '진행중',
      statusColor: 'yellow' as const,
      price: 150000,
      orderDate: '2025-01-25 10:15',
      expectedDeliveryDate: '2025-02-01',
      daysLeft: 5
    },
    {
      id: '3',
      orderNumber: '12343',
      title: '명함 디자인',
      thumbnailUrl: null,
      sellerName: '인쇄소A',
      status: 'completed',
      statusLabel: '완료',
      statusColor: 'green' as const,
      price: 30000,
      orderDate: '2025-01-20 09:00',
      expectedDeliveryDate: '2025-01-27',
      daysLeft: 0
    }
  ]

  const filteredOrders = mockOrders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.searchQuery && !order.sellerName.includes(filters.searchQuery) && !order.orderNumber.includes(filters.searchQuery)) return false
    return true
  })

  const statusCounts = {
    all: mockOrders.length,
    in_progress: mockOrders.filter(o => o.status === 'in_progress').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length,
    completed: mockOrders.filter(o => o.status === 'completed').length,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length
  }

  const tabs = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'in_progress', label: '진행중', count: statusCounts.in_progress },
    { value: 'delivered', label: '도착 확인 대기', count: statusCounts.delivered },
    { value: 'completed', label: '완료', count: statusCounts.completed },
    { value: 'cancelled', label: '취소/환불', count: statusCounts.cancelled }
  ]

  const resetFilters = () => {
    setFilters({
      status: 'all',
      searchQuery: '',
      startDate: '',
      endDate: ''
    })
  }

  const getActionButtons = (order: any) => {
    if (order.status === 'delivered') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
          >
            <i className="fas fa-download mr-2"></i>
            다운로드
          </Link>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            <i className="fas fa-check mr-2"></i>
            구매 확정
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
            <i className="fas fa-redo mr-2"></i>
            수정 요청
          </button>
          <Link
            href={`/mypage/messages?order=${order.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            메시지
          </Link>
        </>
      )
    }

    if (order.status === 'in_progress') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
          >
            상세보기
          </Link>
          <Link
            href={`/mypage/messages?order=${order.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            메시지
          </Link>
        </>
      )
    }

    if (order.status === 'completed') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
          >
            상세보기
          </Link>
          <Link
            href={`/mypage/buyer/reviews?order=${order.id}`}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <i className="fas fa-star mr-2"></i>
            리뷰 작성
          </Link>
        </>
      )
    }

    return (
      <>
        <Link
          href={`/mypage/buyer/orders/${order.id}`}
          className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
        >
          상세보기
        </Link>
      </>
    )
  }

  return (
    <>
      <Sidebar mode="buyer" />
      <main className="flex-1 p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 내역</h1>
          <p className="text-gray-600">주문 내역을 확인하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilters({ ...filters, status: tab.value as OrderStatus })}
                className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  filters.status === tab.value
                    ? 'border-[#0f3460] text-[#0f3460]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filters.status === tab.value
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

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                판매자명 / 주문번호 검색
              </label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="검색어를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              />
            </div>

            {/* 기간 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              />
            </div>

            {/* 초기화 버튼 */}
            <div className="lg:col-span-4 flex items-end">
              <button
                onClick={resetFilters}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <i className="fas fa-redo-alt mr-2"></i>
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 결과 카운트 */}
        <div className="mb-4 text-sm text-gray-600">
          총 <span className="font-bold text-gray-900">{filteredOrders.length}</span>건의 주문
        </div>

        {/* 주문 목록 */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                mode="buyer"
                actions={getActionButtons(order)}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <i className="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-600 text-lg">주문 내역이 없습니다</p>
              <Link
                href="/"
                className="inline-block mt-4 px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
              >
                서비스 둘러보기
              </Link>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="px-4 py-2 bg-[#0f3460] text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </main>
    </>
  )
}
