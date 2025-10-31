'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'

interface CategoryVisit {
  categoryId: string
  categoryName: string
  categorySlug: string
  visitCount: number
  lastVisitedAt: string
}

export default function RecentCategories() {
  const { user } = useAuth()
  const [recentCategories, setRecentCategories] = useState<CategoryVisit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentCategories = async () => {
      // 로그인하지 않은 사용자는 API 호출 안 함
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/category-visits')

        if (response.ok) {
          const data = await response.json()
          setRecentCategories(data.data || [])
        } else if (response.status === 401) {
          // 인증 실패는 조용히 처리
          setRecentCategories([])
        }
      } catch (error) {
        // 에러 발생 시 조용히 처리
        setRecentCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentCategories()
  }, [user])

  // 방문 기록이 없으면 섹션 숨김
  if (loading || recentCategories.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="mb-6">
          <h2 className="text-mobile-lg lg:text-xl font-bold mb-2">최근 본 카테고리</h2>
          <p className="text-mobile-md text-gray-600">최근에 방문한 카테고리를 다시 확인해보세요</p>
        </div>

        {/* 모바일: 텍스트 링크 가로 스크롤 */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-3 min-w-max pb-2">
            {recentCategories.map((category) => (
              <Link
                key={category.categoryId}
                href={`/categories/${category.categorySlug}`}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-mobile-md font-medium hover:bg-brand-primary hover:text-white transition-colors whitespace-nowrap"
              >
                {category.categoryName}
              </Link>
            ))}
          </div>
        </div>

        {/* 데스크톱: 플렉스 래핑 */}
        <div className="hidden lg:flex flex-wrap gap-3">
          {recentCategories.map((category) => (
            <Link
              key={category.categoryId}
              href={`/categories/${category.categorySlug}`}
              className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-full text-base font-medium hover:bg-brand-primary hover:text-white transition-colors"
            >
              {category.categoryName}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
