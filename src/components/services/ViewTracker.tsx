'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { logger } from '@/lib/logger'

interface ViewTrackerProps {
  serviceId: string
}

export default function ViewTracker({ serviceId }: ViewTrackerProps) {
  const { user } = useAuth()

  useEffect(() => {
    // 로그인 사용자만 최근 본 서비스 기록
    if (!user) return

    async function trackView() {
      try {
        await fetch('/api/user/service-views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serviceId })
        })
      } catch (error) {
        // 에러가 발생해도 사용자 경험에 영향 없도록 조용히 처리
        logger.error('View tracking error:', error)
      }
    }

    trackView()
  }, [serviceId, user])

  return null // UI를 렌더링하지 않음
}
