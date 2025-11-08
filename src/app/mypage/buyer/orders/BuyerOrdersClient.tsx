'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Sidebar from '@/components/mypage/Sidebar'
import OrderCard from '@/components/mypage/OrderCard'
import Link from 'next/link'
import EmptyState from '@/components/common/EmptyState'

type OrderStatus = 'all' | 'paid' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'

interface OrderFilter {
  status: OrderStatus
  searchQuery: string
  startDate: string
  endDate: string
}

interface BuyerOrdersClientProps {
  initialOrders: any[]
  statusCounts: {
    all: number
    paid: number
    in_progress: number
    delivered: number
    completed: number
    cancelled: number
  }
}

function BuyerOrdersContent({ initialOrders, statusCounts }: BuyerOrdersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFromUrl = (searchParams.get('status') as OrderStatus) || 'all'

  const [filters, setFilters] = useState<OrderFilter>({
    status: statusFromUrl,
    searchQuery: '',
    startDate: '',
    endDate: ''
  })

  const filteredOrders = initialOrders.filter(order => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesSellerName = order.seller?.name?.toLowerCase().includes(query)
      const matchesOrderNumber = order.order_number?.toLowerCase().includes(query)
      const matchesTitle = order.title?.toLowerCase().includes(query)
      if (!matchesSellerName && !matchesOrderNumber && !matchesTitle) return false
    }
    return true
  })

  const tabs = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'paid', label: '결제완료', count: statusCounts.paid },
    { value: 'in_progress', label: '진행중', count: statusCounts.in_progress },
    { value: 'delivered', label: '도착 확인 대기', count: statusCounts.delivered },
    { value: 'completed', label: '완료', count: statusCounts.completed },
    { value: 'cancelled', label: '취소/환불', count: statusCounts.cancelled }
  ]

  const handleStatusChange = (status: OrderStatus) => {
    setFilters({ ...filters, status })
    if (status === 'all') {
      router.push('/mypage/buyer/orders')
    } else {
      router.push(`/mypage/buyer/orders?status=${status}`)
    }
  }

  const resetFilters = () => {
    setFilters({
      status: 'all',
      searchQuery: '',
      startDate: '',
      endDate: ''
    })
    router.push('/mypage/buyer/orders')
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return '결제완료'
      case 'in_progress': return '진행중'
      case 'delivered': return '도착 확인 대기'
      case 'completed': return '완료'
      case 'cancelled': return '취소/환불'
      case 'refunded': return '환불완료'
      default: return status
    }
  }

  const getStatusColor = (status: string): 'red' | 'yellow' | 'green' | 'gray' => {
    switch (status) {
      case 'delivered': return 'red'
      case 'in_progress': return 'yellow'
      case 'completed': return 'green'
      default: return 'gray'
    }
  }

  const getActionButtons = (order: any) => {
    if (order.status === 'delivered') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
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

    if (order.status === 'completed') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
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
          className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
        >
          상세보기
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
      sellerName: order.seller?.name,
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

        <Sidebar mode="buyer" />

        <main className="flex-1 overflow-y-auto w-full">

          <div className="container-1200 px-4 py-4 sm:py-6 lg:py-8">
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
                onClick={() => handleStatusChange(tab.value as OrderStatus)}
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
                order={formatOrderData(order)}
                mode="buyer"
                actions={getActionButtons(order)}
              />
            ))
          ) : (
            <EmptyState
              icon="fa-inbox"
              title="주문 내역이 없습니다"
              description="서비스를 구매하고 주문 내역을 확인해보세요"
              action={{
                label: '서비스 둘러보기',
                href: '/'
              }}
            />
          )}
        </div>
          </div>
          <Footer />
        </main>

      </div>

      </>
  )
}

export default function BuyerOrdersClient(props: BuyerOrdersClientProps) {
  return (
    <Suspense fallback={
      <>
        <Sidebar mode="buyer" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
      </>
    }>
      <BuyerOrdersContent {...props} />
    </Suspense>
  )
}
