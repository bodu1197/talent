'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function MypageLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('[Mypage Layout] useEffect triggered - loading:', loading, 'user:', user?.id)

    // 로딩 중이면 기다림
    if (loading) {
      console.log('[Mypage Layout] Auth still loading...')
      return
    }

    // 로그인 체크
    if (!user) {
      console.log('[Mypage Layout] No user, redirecting to login')
      router.replace('/auth/login')
    } else {
      console.log('[Mypage Layout] User authenticated:', user.id)
    }
  }, [loading, user, router])

  // 레이아웃은 항상 children을 렌더링 (로딩 체크는 각 페이지에서)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {children}
    </div>
  )
}
