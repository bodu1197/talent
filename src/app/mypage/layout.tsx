'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function MypageLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 로딩 끝났는데 user 없으면 로그인 페이지로
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // 로딩 중이거나 user 없으면 아무것도 렌더링하지 않음
  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {children}
    </div>
  )
}
