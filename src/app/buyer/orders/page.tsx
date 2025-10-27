'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type OrderStatus = 'all' | 'pending_payment' | 'paid' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'

interface Order {
  id: string
  order_number: string
  title: string
  total_amount: number
  status: string
  delivery_date: string
  created_at: string
  seller?: {
    name: string
    business_name: string
  }
  service?: {
    id: string
    title: string
    thumbnail_url: string
  }
}

export default function BuyerOrdersPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<OrderStatus>('all')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // DB에 현재 구매자 페이지 보는 중임을 저장
    async function updateLastMode() {
      if (user?.id) {
        await supabase
          .from('users')
          .update({ last_mode: 'buyer' })
          .eq('id', user.id)
      }
    }
    updateLastMode()

    fetchOrders()
  }, [user, activeTab])

  const fetchOrders = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          service:services(id, title, thumbnail_url),
          seller:users!seller_id(name)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('주문 내역 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { text: string; class: string } } = {
      pending_payment: { text: '결제대기', class: 'bg-yellow-100 text-yellow-800' },
      paid: { text: '결제완료', class: 'bg-blue-100 text-blue-800' },
      in_progress: { text: '작업중', class: 'bg-purple-100 text-purple-800' },
      delivered: { text: '납품완료', class: 'bg-green-100 text-green-800' },
      completed: { text: '거래완료', class: 'bg-gray-100 text-gray-800' },
      cancelled: { text: '취소됨', class: 'bg-red-100 text-red-800' },
    }
    const badge = badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>{badge.text}</span>
  }

  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'paid', label: '진행중' },
    { key: 'delivered', label: '납품완료' },
    { key: 'completed', label: '거래완료' },
    { key: 'cancelled', label: '취소' },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">구매 내역</h1>
          <p className="text-gray-600">주문한 서비스의 진행 상황을 확인하세요.</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as OrderStatus)}
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

        {/* 주문 목록 */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="spinner-lg"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shopping-bag text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">주문 내역이 없습니다</h3>
            <p className="text-gray-600 mb-6">마음에 드는 서비스를 찾아보세요!</p>
            <Link href="/services" className="btn-primary px-6 py-2 inline-block">
              서비스 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500">주문번호: {order.order_number}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{order.title}</h3>
                      <p className="text-sm text-gray-600">
                        판매자: {order.seller?.business_name || order.seller?.name || '정보 없음'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#0f3460]">
                        {order.total_amount.toLocaleString()}원
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {order.delivery_date && (
                    <div className="text-sm text-gray-600 mb-4">
                      <i className="far fa-calendar mr-2"></i>
                      납품 예정일: {new Date(order.delivery_date).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 text-center px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors"
                    >
                      주문 상세
                    </Link>
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                        검수 완료
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <Link
                        href={`/orders/${order.id}/review`}
                        className="px-4 py-2 border border-[#0f3460] text-[#0f3460] rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        리뷰 작성
                      </Link>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <i className="far fa-comment"></i>
                    </button>
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
