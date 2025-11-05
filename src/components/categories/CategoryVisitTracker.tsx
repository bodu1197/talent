'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { logger } from '@/lib/logger'

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
    console.log('[VISIT TRACKER] User:', !!user, 'Category:', categoryName, 'isTopLevel:', isTopLevel)

    // 로그인하지 않은 사용자는 추적 안 함
    if (!user) {
      console.log('[VISIT TRACKER] No user, skipping')
      return
    }

    // 1차 카테고리만 추적
    if (!isTopLevel) {
      console.log('[VISIT TRACKER] Not top level, skipping')
      return
    }

    // 방문 기록 저장
    const trackVisit = async () => {
      try {
        console.log('[VISIT TRACKER] Tracking visit:', { categoryId, categoryName, categorySlug })

        const response = await fetch('/api/user/category-visits', {
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

        console.log('[VISIT TRACKER] Response status:', response.status)

        // 401 에러는 조용히 무시
        if (!response.ok && response.status !== 401) {
          logger.error('Failed to track category visit:', response.status)
          const errorData = await response.json()
          console.log('[VISIT TRACKER] Error data:', errorData)
        } else if (response.ok) {
          const data = await response.json()
          console.log('[VISIT TRACKER] Success:', data)
        }
      } catch (error) {
        console.error('[VISIT TRACKER] Network error:', error)
      }
    }

    trackVisit()
  }, [user, categoryId, categoryName, categorySlug, isTopLevel])

  return null // UI 없음, 추적만 수행
}
