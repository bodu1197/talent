'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function MypagePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // 로그인되지 않은 경우 로그인 페이지로
        router.push('/login')
      } else if (profile) {
        // 사용자 타입에 따라 적절한 대시보드로 리다이렉트
        if (profile.user_type === 'seller' || profile.user_type === 'both') {
          router.push('/mypage/seller/dashboard')
        } else if (profile.user_type === 'buyer') {
          router.push('/mypage/buyer/dashboard')
        } else {
          // 기본값은 buyer 대시보드로
          router.push('/mypage/buyer/dashboard')
        }
      }
    }
  }, [user, profile, loading, router])

  // 로딩 중이거나 리다이렉트 중일 때 표시
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner message="마이페이지로 이동 중..." />
    </div>
  )
}