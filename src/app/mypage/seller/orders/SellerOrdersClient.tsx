'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import OrderCard from '@/components/mypage/OrderCard'
import Link from 'next/link'
import EmptyState from '@/components/common/EmptyState'

type OrderStatus = 'all' | 'paid' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'

interface OrderFilter {
  status: OrderStatus
  searchQuery: string
  startDate: string
  endDate: string
  minPrice: string
  maxPrice: string
}

interface Props {
  initialOrders: any[]
  initialStatus: OrderStatus
  statusCounts: {
    all: number
    paid: number
    in_progress: number
    delivered: number
    completed: number
    cancelled: number
  }
}

export default function SellerOrdersClient({ initialOrders, initialStatus, statusCounts }: Props) {
  const [orders] = useState(initialOrders)
  const [filters, setFilters] = useState<OrderFilter>({
    status: initialStatus,
    searchQuery: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: ''
  })

  const filteredOrders = orders.filter(order => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesBuyerName = order.buyer?.name?.toLowerCase().includes(query)
      const matchesOrderNumber = order.order_number?.toLowerCase().includes(query)
      const matchesTitle = order.title?.toLowerCase().includes(query)
      if (!matchesBuyerName && !matchesOrderNumber && !matchesTitle) return false
    }

    if (filters.minPrice && order.total_amount < parseInt(filters.minPrice)) return false
    if (filters.maxPrice && order.total_amount > parseInt(filters.maxPrice)) return false

    return true
  })

  const tabs = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'paid', label: '신규 주문', count: statusCounts.paid },
    { value: 'in_progress', label: '진행중', count: statusCounts.in_progress },
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return '결제완료'
      case 'in_progress': return '진행중'
      case 'delivered': return '완료 대기'
      case 'completed': return '완료'
      case 'cancelled': return '취소/환불'
      case 'refunded': return '환불완료'
      default: return status
    }
  }

  const getStatusColor = (status: string): 'red' | 'yellow' | 'green' | 'gray' => {
    switch (status) {
      case 'paid': return 'red'
      case 'in_progress': return 'yellow'
      case 'delivered': return 'green'
      case 'completed': return 'gray'
      default: return 'gray'
    }
  }

  const getActionButtons = (order: any) => {
    if (order.status === 'paid') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
          >
            주문 확인
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

    if (order.status === 'in_progress') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
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

    if (order.status === 'delivered') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
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
          className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
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

  const formatOrderData = (order: any) => {
    return {
      id: order.id,
      orderNumber: order.order_number,
      title: order.title || order.service?.title,
      thumbnailUrl: order.service?.thumbnail_url,
      buyerName: order.buyer?.name,
      status: order.status,
      statusLabel: getStatusLabel(order.status),
      statusColor: getStatusColor(order.status),
      price: order.total_amount,
      orderDate: new Date(order.created_at).toLocaleString('ko-KR'),
      expectedDeliveryDate: order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('ko-KR') : '-',
      daysLeft: order.delivery_date ? Math.ceil((new Date(order.delivery_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
      requirements: order.requirements
    }
  }

  return (
    <>

      <Header />

      <div className="flex min-h-screen bg-gray-50 pt-16">

        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />

        <main className="flex-1 overflow-y-auto w-full">

          <div className="container-1200 px-4 py-4 sm:py-6 lg:py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 관리</h1>
          <p className="text-gray-600">전체 주문 내역을 관리하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/mypage/seller/orders?status=${tab.value}`}
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
              </Link>
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
                order={formatOrderData(order)}
                mode="seller"
                actions={getActionButtons(order)}
              />
            ))
          ) : (
            <EmptyState
              icon="fa-inbox"
              title="주문 내역이 없습니다"
              description="새로운 주문이 들어오면 여기에 표시됩니다"
            />
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
          </div>
          <Footer />
        </main>

      </div>

      </>
  )
}
