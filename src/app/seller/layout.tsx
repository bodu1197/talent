'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import SellerSidebar from '@/components/seller/SellerSidebar'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 로그인 체크
    if (!user) {
      router.push('/auth/login')
      return
    }

    // 판매자 권한 체크
    if (profile && profile.user_type !== 'seller' && profile.user_type !== 'both') {
      router.push('/profile')
      return
    }
  }, [user, profile, router])

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3460]"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (profile.user_type !== 'seller' && profile.user_type !== 'both') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerSidebar />
      <main className="ml-64 min-h-screen pt-16">
        {children}
      </main>
    </div>
  )
}
