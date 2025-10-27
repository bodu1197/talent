'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface DashboardStats {
  totalServices: number
  activeServices: number
  totalOrders: number
  inProgressOrders: number
  completedOrders: number
  totalEarnings: number
  thisMonthEarnings: number
  averageRating: number
  totalReviews: number
}

interface RecentOrder {
  id: string
  order_number: string
  title: string
  total_amount: number
  status: string
  created_at: string
  buyer?: {
    name: string
  }
}

export default function SellerDashboardPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    activeServices: 0,
    totalOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (profile?.user_type !== 'seller' && profile?.user_type !== 'both') {
      router.push('/profile')
      return
    }

    const fetchDashboardData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // 서비스 통계
      const { data: services } = await supabase
        .from('services')
        .select('id, status')
        .eq('seller_id', user.id)

      const totalServices = services?.length || 0
      const activeServices = services?.filter((s) => s.status === 'active').length || 0

      // 주문 통계
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status, seller_amount, created_at')
        .eq('seller_id', user.id)

      const totalOrders = orders?.length || 0
      const inProgressOrders =
        orders?.filter((o) => ['paid', 'in_progress', 'delivered'].includes(o.status)).length || 0
      const completedOrders = orders?.filter((o) => o.status === 'completed').length || 0
      const totalEarnings = orders?.reduce((sum, o) => sum + (o.seller_amount || 0), 0) || 0

      // 이번 달 수익
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const thisMonthEarnings =
        orders
          ?.filter((o) => new Date(o.created_at) >= thisMonth && o.status === 'completed')
          .reduce((sum, o) => sum + (o.seller_amount || 0), 0) || 0

      // 평점 및 리뷰
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('seller_id', user.id)

      const totalReviews = reviews?.length || 0
      const averageRating =
        totalReviews > 0 ? (reviews || []).reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0

      setStats({
        totalServices,
        activeServices,
        totalOrders,
        inProgressOrders,
        completedOrders,
        totalEarnings,
        thisMonthEarnings,
        averageRating,
        totalReviews,
      })

      // 최근 주문
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          title,
          total_amount,
          status,
          created_at,
          buyer:users!buyer_id(name)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentOrders((recentOrdersData as any) || [])
    } catch (error) {
      console.error('대시보드 데이터 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
    }

    if (!user) {
      router.push('/auth/login')
      return
    }

    if (profile?.user_type !== 'seller' && profile?.user_type !== 'both') {
      router.push('/profile')
      return
    }

    // DB에 현재 판매자 페이지 보는 중임을 저장
    if (user?.id) {
      supabase.from('users').update({ last_mode: 'seller' }).eq('id', user.id)
    }

    fetchDashboardData()
  }, [user, profile, router, supabase])

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

  if (!user || !profile) {
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
          <h1 className="text-3xl font-bold mb-2">판매자 대시보드</h1>
          <p className="text-gray-600">판매 현황과 통계를 한눈에 확인하세요.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="spinner-lg"></div>
          </div>
        ) : (
          <>
            {/* 주요 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 이번 달 수익 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-won-sign text-green-600 text-xl"></i>
                  </div>
                  <span className="text-sm text-green-600 font-medium">이번 달</span>
                </div>
                <div className="text-2xl font-bold mb-1">{stats.thisMonthEarnings.toLocaleString()}원</div>
                <div className="text-sm text-gray-600">월 수익</div>
              </div>

              {/* 총 수익 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-[#0f3460] text-xl"></i>
                  </div>
                  <span className="text-sm text-[#0f3460] font-medium">누적</span>
                </div>
                <div className="text-2xl font-bold mb-1">{stats.totalEarnings.toLocaleString()}원</div>
                <div className="text-sm text-gray-600">총 수익</div>
              </div>

              {/* 진행중 주문 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tasks text-purple-600 text-xl"></i>
                  </div>
                  <span className="text-sm text-purple-600 font-medium">진행중</span>
                </div>
                <div className="text-2xl font-bold mb-1">{stats.inProgressOrders}</div>
                <div className="text-sm text-gray-600">주문 / 총 {stats.totalOrders}건</div>
              </div>

              {/* 평점 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-star text-yellow-600 text-xl"></i>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">리뷰</span>
                </div>
                <div className="text-2xl font-bold mb-1">{stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">{stats.totalReviews}개 리뷰</div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link
                href="/services/new"
                className="bg-[#0f3460] text-white rounded-lg p-6 hover:bg-[#1a4b7d] transition-colors"
              >
                <i className="fas fa-plus-circle text-2xl mb-3"></i>
                <div className="font-semibold mb-1">새 서비스 등록</div>
                <div className="text-sm opacity-90">새로운 서비스를 추가하세요</div>
              </Link>

              <Link
                href="/seller/services"
                className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200"
              >
                <i className="fas fa-briefcase text-2xl mb-3 text-[#0f3460]"></i>
                <div className="font-semibold mb-1">서비스 관리</div>
                <div className="text-sm text-gray-600">
                  활성 {stats.activeServices} / 총 {stats.totalServices}개
                </div>
              </Link>

              <Link
                href="/seller/orders"
                className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200"
              >
                <i className="fas fa-shopping-bag text-2xl mb-3 text-[#0f3460]"></i>
                <div className="font-semibold mb-1">주문 관리</div>
                <div className="text-sm text-gray-600">진행중 {stats.inProgressOrders}건</div>
              </Link>
            </div>

            {/* 최근 주문 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">최근 주문</h2>
                  <Link href="/seller/orders" className="text-sm text-[#0f3460] hover:underline">
                    전체보기 →
                  </Link>
                </div>
              </div>

              {recentOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <i className="fas fa-inbox text-4xl mb-3"></i>
                  <p>최근 주문이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500">{order.order_number}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <h3 className="font-semibold mb-1">{order.title}</h3>
                          <p className="text-sm text-gray-600">
                            구매자: {order.buyer?.name || '정보 없음'}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-[#0f3460]">
                            {order.total_amount.toLocaleString()}원
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm text-[#0f3460] hover:underline"
                        >
                          주문 상세 보기 →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
