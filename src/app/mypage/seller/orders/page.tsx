'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/mypage/Sidebar'
import OrderCard from '@/components/mypage/OrderCard'
import Link from 'next/link'

type OrderStatus = 'all' | 'new' | 'in_progress' | 'revision' | 'delivered' | 'completed' | 'cancelled'

interface OrderFilter {
  status: OrderStatus
  searchQuery: string
  startDate: string
  endDate: string
  minPrice: string
  maxPrice: string
}

function SellerOrdersContent() {
  const searchParams = useSearchParams()
  const statusFromUrl = (searchParams.get('status') as OrderStatus) || 'all'

  const [filters, setFilters] = useState<OrderFilter>({
    status: statusFromUrl,
    searchQuery: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: ''
  })

  // TODO: 실제로는 API에서 데이터를 가져와야 합니다
  const mockOrders = [
    {
      id: '1',
      orderNumber: '12345',
      title: '로고 디자인 작업',
      thumbnailUrl: null,
      buyerName: '홍길동',
      status: 'new',
      statusLabel: '신규 주문',
      statusColor: 'red' as const,
      price: 50000,
      orderDate: '2025-01-27 14:30',
      expectedDeliveryDate: '2025-02-03',
      daysLeft: 7,
      requirements: '미니멀한 느낌의 로고를 원합니다. 파랑색 계열로 부탁드립니다.'
    },
    {
      id: '2',
      orderNumber: '12344',
      title: '영상 편집',
      thumbnailUrl: null,
      buyerName: '김철수',
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
      buyerName: '이영희',
      status: 'delivered',
      statusLabel: '완료 대기',
      statusColor: 'blue' as const,
      price: 30000,
      orderDate: '2025-01-20 09:00',
      expectedDeliveryDate: '2025-01-27',
      daysLeft: 0
    }
  ]

  const filteredOrders = mockOrders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.searchQuery && !order.buyerName.includes(filters.searchQuery) && !order.orderNumber.includes(filters.searchQuery)) return false
    return true
  })

  const statusCounts = {
    all: mockOrders.length,
    new: mockOrders.filter(o => o.status === 'new').length,
    in_progress: mockOrders.filter(o => o.status === 'in_progress').length,
    revision: mockOrders.filter(o => o.status === 'revision').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length,
    completed: mockOrders.filter(o => o.status === 'completed').length,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length
  }

  const tabs = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'new', label: '신규 주문', count: statusCounts.new },
    { value: 'in_progress', label: '진행중', count: statusCounts.in_progress },
    { value: 'revision', label: '수정 요청', count: statusCounts.revision },
    { value: 'delivered', label: '완료 대기', count: statusCounts.delivered },
    { value: 'completed', label: '완료', count: statusCounts.completed },
    { value: 'cancelled', label: '취소/환불', count: statusCounts.cancelled }
  ]

  const resetFilters = () => {
    setFilters({
      status: 'all',
      searchQuery: '',
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: ''
    })
  }

  const getActionButtons = (order: any) => {
    if (order.status === 'new') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
          >
            주문 확인
          </Link>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            작업 시작
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
            href={`/mypage/seller/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors text-sm font-medium"
          >
            상세보기
          </Link>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            납품하기
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

    if (order.status === 'delivered') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
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

    return (
      <>
        <Link
          href={`/mypage/seller/orders/${order.id}`}
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

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 관리</h1>
          <p className="text-gray-600">전체 주문 내역을 관리하세요</p>
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
                주문번호 / 구매자명 검색
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

            {/* 가격 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">최소 금액</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">최대 금액</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              />
            </div>

            {/* 초기화 버튼 */}
            <div className="lg:col-span-2 flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
                mode="seller"
                actions={getActionButtons(order)}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <i className="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-600 text-lg">주문 내역이 없습니다</p>
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

export default function SellerOrdersPage() {
  return (
    <Suspense fallback={
      <>
        <Sidebar mode="seller" />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
      </>
    }>
      <SellerOrdersContent />
    </Suspense>
  )
}
