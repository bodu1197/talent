'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import BuyerSidebar from '@/components/buyer/BuyerSidebar'

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 로딩 중이면 대기
    if (loading) return

    // 로그인 체크
    if (!user) {
      router.push('/auth/login')
      return
    }
  }, [user, loading, router])

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3460]"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BuyerSidebar />
      <main className="ml-64 min-h-screen pt-16">
        <div className="container-1200 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
