'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function MypageLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checkedAuth, setCheckedAuth] = useState(false)

  useEffect(() => {
    console.log('[Mypage Layout] useEffect triggered - loading:', loading, 'user:', user?.id, 'checkedAuth:', checkedAuth)

    // 이미 체크했으면 리턴
    if (checkedAuth) {
      return
    }

    // 로딩 중이면 기다림
    if (loading) {
      console.log('[Mypage Layout] Auth still loading...')
      return
    }

    // 로딩 완료됨
    console.log('[Mypage Layout] Auth loading complete')

    if (!user) {
      console.log('[Mypage Layout] No user, redirecting to login')
      router.replace('/login')
    } else {
      console.log('[Mypage Layout] User authenticated:', user.id)
      setCheckedAuth(true)
    }
  }, [loading, user, checkedAuth, router])

  // Show loading state
  if (loading || !checkedAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {children}
    </div>
  )
}
