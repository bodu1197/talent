'use client'

import { useEffect } from 'react'

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
  useEffect(() => {
    // 1차 카테고리만 추적
    if (!isTopLevel) return

    // 방문 기록 저장
    const trackVisit = async () => {
      try {
        await fetch('/api/user/category-visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // TODO: 실제 인증 토큰 추가
            'x-user-id': 'guest'
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
  }, [categoryId, categoryName, categorySlug, isTopLevel])

  return null // UI 없음, 추적만 수행
}
