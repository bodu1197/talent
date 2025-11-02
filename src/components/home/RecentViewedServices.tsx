'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Service } from '@/types'
import { getServicesByCategory } from '@/lib/supabase/queries/services'

interface ServiceView {
  service_id: string
  viewed_at: string
  service: Service
}

export default function RecentViewedServices() {
  const { user } = useAuth()
  const [recentViews, setRecentViews] = useState<ServiceView[]>([])
  const [relatedServices, setRelatedServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // 최근 본 서비스 조회 (최대 10개)
        const viewsResponse = await fetch('/api/user/service-views?limit=10')

        if (viewsResponse.ok) {
          const { data } = await viewsResponse.json()
          const validViews = (data || []).filter((v: ServiceView) => v.service)
          setRecentViews(validViews)

          // 최근 본 서비스가 있으면 같은 카테고리의 서비스 가져오기
          if (validViews.length > 0) {
            const firstService = validViews[0].service
            const categories = firstService.service_categories

            if (categories && categories.length > 0) {
              const categoryId = categories[0].category?.id || categories[0].category_id

              if (categoryId) {
                // 같은 카테고리의 서비스 조회
                const categoryServices = await getServicesByCategory(categoryId)

                // 최근 본 서비스 제외
                const viewedIds = validViews.map((v: ServiceView) => v.service_id)
                const filtered = categoryServices.filter((s: Service) => !viewedIds.includes(s.id))

                // 랜덤 셔플
                const shuffled = filtered.sort(() => Math.random() - 0.5)

                // 최근 본 서비스 개수에 따라 필요한 만큼만 가져오기
                const needed = Math.max(0, 10 - validViews.length)
                setRelatedServices(shuffled.slice(0, needed))
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch recent views:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // 로그인하지 않았거나 데이터 없으면 표시 안 함
  if (!user || (recentViews.length === 0 && relatedServices.length === 0)) {
    return null
  }

  if (loading) {
    return (
      <section className="py-8 bg-white">
        <div className="container-1200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 최근 본 서비스 + 같은 카테고리 서비스 합치기
  const allServices = [
    ...recentViews.map((v, index) => ({
      service: v.service,
      isRecentView: true,
      viewIndex: index,
      viewed_at: v.viewed_at
    })),
    ...relatedServices.map(s => ({
      service: s,
      isRecentView: false,
      viewIndex: -1,
      viewed_at: null
    }))
  ]

  return (
    <section className="py-8 bg-white border-t border-gray-200">
      <div className="container-1200">
        <div className="flex items-center gap-3 mb-6">
          <i className="fas fa-eye text-brand-primary text-xl"></i>
          <h2 className="text-xl font-bold text-gray-900">최근 본 서비스</h2>
          {recentViews.length > 0 && (
            <span className="text-sm text-gray-500">
              ({recentViews.length}개)
              {relatedServices.length > 0 && ` + 추천 ${relatedServices.length}개`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allServices.map((item, index) => {
            const { service, isRecentView, viewIndex } = item
            if (!service) return null

            return (
              <Link
                key={`${service.id}-${index}`}
                href={`/services/${service.id}`}
                className="group relative"
              >
                {/* 최근 본 서비스 표시 (처음 3개만 깃발) */}
                {isRecentView && viewIndex < 3 && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
                      <i className="fas fa-flag"></i>
                      금방 봄
                    </div>
                  </div>
                )}

                {/* 썸네일 */}
                <div className="bg-gray-100 rounded-lg overflow-hidden w-full relative" style={{ aspectRatio: '210/160' }}>
                  {service.thumbnail_url ? (
                    <img
                      src={service.thumbnail_url}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <i className="fas fa-box text-4xl text-gray-400"></i>
                    </div>
                  )}

                  {/* 최근 본 서비스 오버레이 (4번째부터는 작은 배지) */}
                  {isRecentView && viewIndex >= 3 && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        <i className="fas fa-eye"></i>
                      </div>
                    </div>
                  )}
                </div>

                {/* 서비스 정보 */}
                <div className="mt-2">
                  {/* 판매자 */}
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center text-white text-[8px] font-bold">
                      {service.seller?.business_name?.[0] || 'S'}
                    </div>
                    <span className="text-xs text-gray-600 truncate">
                      {service.seller?.business_name}
                    </span>
                    {service.seller?.is_verified && (
                      <i className="fas fa-check-circle text-[10px] text-blue-500"></i>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-brand-primary transition-colors mb-1">
                    {service.title}
                  </h3>

                  {/* 평점 및 주문 수 */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <span className="flex items-center gap-1">
                      <i className="fas fa-star text-yellow-400"></i>
                      {(service.rating || 0).toFixed(1)}
                    </span>
                    <span>({service.order_count || 0})</span>
                  </div>

                  {/* 가격 */}
                  <p className="text-brand-primary font-bold text-sm">
                    {(service.price_min || service.price || 0).toLocaleString()}원~
                  </p>

                  {/* 같은 카테고리 추천 표시 */}
                  {!isRecentView && (
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">
                        추천
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* 더보기 버튼 (최근 본 서비스가 많을 경우) */}
        {recentViews.length > 10 && (
          <div className="mt-6 text-center">
            <Link
              href="/mypage/buyer/history"
              className="inline-flex items-center gap-2 px-6 py-3 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
            >
              <i className="fas fa-history"></i>
              전체 방문 기록 보기
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
