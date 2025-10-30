'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      // 로그인 체크
      if (!authLoading && !user) {
        // Not logged in - redirect to login
        router.push('/login')
        return
      }

      // 로그인된 경우
      if (!authLoading && user) {
        setChecking(false)
      }
    }

    checkAuth()
  }, [user, authLoading, router])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="로그인 확인 중..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
