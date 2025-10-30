'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'

interface CategoryVisitTrackerProps {
  categoryId: string
  categoryName: string
  categorySlug: string
  isTopLevel: boolean // 1차 카테고리인지 확인
}

export default function CategoryVisitTracker({
  categoryId,
  categoryName,
  categorySlug,
  isTopLevel
}: CategoryVisitTrackerProps) {
  const { user } = useAuth()

  useEffect(() => {
    // 로그인하지 않은 사용자는 추적 안 함
    if (!user) return

    // 1차 카테고리만 추적
    if (!isTopLevel) return

    // 방문 기록 저장
    const trackVisit = async () => {
      try {
        await fetch('/api/user/category-visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categoryId,
            categoryName,
            categorySlug
          })
        })
      } catch (error) {
        console.error('Failed to track category visit:', error)
      }
    }

    trackVisit()
  }, [user, categoryId, categoryName, categorySlug, isTopLevel])

  return null // UI 없음, 추적만 수행
}
