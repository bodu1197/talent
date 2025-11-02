'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { getRecentVisitedCategories, RecentCategory } from '@/lib/supabase/queries/category-visits'

export default function RecentVisitedCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<RecentCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentCategories() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const data = await getRecentVisitedCategories(10)
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch recent visited categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentCategories()
  }, [user])

  // 로그인하지 않았거나 방문 기록이 없으면 표시 안 함
  if (!user || categories.length === 0) {
    return null
  }

  if (loading) {
    return (
      <section className="py-6 bg-gray-50">
        <div className="container-1200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="flex gap-3 overflow-x-auto">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded-full w-32"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-6 bg-gray-50 border-b border-gray-200">
      <div className="container-1200">
        <div className="flex items-center gap-3 mb-4">
          <i className="fas fa-clock-rotate-left text-brand-primary"></i>
          <h2 className="text-lg font-bold text-gray-900">최근 방문한 카테고리</h2>
          <span className="text-sm text-gray-500">(최근 30일)</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <Link
              key={category.category_id}
              href={`/categories/${category.category_slug}`}
              className="flex-shrink-0"
            >
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 group">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium whitespace-nowrap">
                    {category.category_name}
                  </span>
                  {category.visit_count > 1 && (
                    <span className="text-xs px-1.5 py-0.5 bg-brand-primary text-white group-hover:bg-white group-hover:text-brand-primary rounded-full">
                      {category.visit_count}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
