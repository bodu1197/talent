'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      // authLoading이 끝날 때까지 대기
      if (authLoading) return

      // user가 없으면 상위 레이아웃에서 처리
      if (!user) return

      // 로그인된 경우
      setChecking(false)
    }

    checkAuth()
  }, [user, authLoading])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="구매자 정보 확인 중..." />
      </div>
    )
  }

  return <>{children}</>
}
