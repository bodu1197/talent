'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 로딩 중이면 대기
    if (loading) {
      console.log('AuthProvider loading...')
      return
    }

    // 로그인 안 되어있으면 로그인 페이지로
    if (!user) {
      console.log('No user, redirecting to login')
      router.push('/auth/login')
      return
    }

    console.log('User:', user.email, 'Profile:', profile)

    // 로딩이 끝났고 user가 있는데도 profile이 null인 경우만 처리
    // (profile fetch가 실패한 경우)
    if (!loading && user && !profile) {
      console.error('Profile is null! User exists but profile not found in users table')
      // profile이 null이면 구매자 페이지로 기본 이동
      router.push('/buyer/orders')
      return
    }

    // profile이 아직 로딩 중이면 대기
    if (!profile) {
      return
    }

    // user_type에 따라 리다이렉트
    if (profile.user_type === 'buyer') {
      // 구매자 전용 → 무조건 구매자 페이지
      console.log('Redirecting to buyer page')
      router.push('/buyer/orders')
    } else if (profile.user_type === 'seller' || profile.user_type === 'both') {
      // 판매자 또는 둘 다 → DB에 저장된 마지막 모드 확인
      const lastMode = (profile as any).last_mode || 'buyer'

      if (lastMode === 'seller') {
        console.log('Redirecting to seller dashboard')
        router.push('/seller/dashboard')
      } else {
        console.log('Redirecting to buyer page (both type, last_mode: buyer)')
        router.push('/buyer/orders')
      }
    }
  }, [user, profile, loading])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3460] mb-4"></div>
        <p className="text-gray-600">페이지 이동 중...</p>
      </div>
    </div>
  )
}
