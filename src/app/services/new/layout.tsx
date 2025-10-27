'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import SellerSidebar from '@/components/seller/SellerSidebar'

export default function NewServiceLayout({ children }: { children: React.ReactNode }) {
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

    // 판매자 권한 체크
    if (profile && profile.user_type !== 'seller' && profile.user_type !== 'both') {
      alert('판매자만 서비스를 등록할 수 있습니다.')
      router.push('/buyer/orders')
      return
    }
  }, [user, profile, loading, router])

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

  if (profile.user_type !== 'seller' && profile.user_type !== 'both') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-1200">
        <div className="flex gap-6 py-6">
          <SellerSidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
