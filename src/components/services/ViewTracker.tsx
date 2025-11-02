'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ViewTrackerProps {
  serviceId: string
}

export default function ViewTracker({ serviceId }: ViewTrackerProps) {
  useEffect(() => {
    async function trackView() {
      try {
        const supabase = createClient()

        // 조회 로그 기록
        await supabase
          .from('service_view_logs')
          .insert({
            service_id: serviceId,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
          })
      } catch (error) {
        // 에러가 발생해도 사용자 경험에 영향 없도록 조용히 처리
        console.error('View tracking error:', error)
      }
    }

    trackView()
  }, [serviceId])

  return null // UI를 렌더링하지 않음
}
