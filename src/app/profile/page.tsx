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
      return
    }

    // 로그인 안 되어있으면 로그인 페이지로
    if (!user) {
      router.push('/auth/login')
      return
    }

    // 로딩이 끝났고 user가 있는데도 profile이 null인 경우만 처리
    // (profile fetch가 실패한 경우)
    if (!loading && user && !profile) {
      console.error('Profile is null! User exists but profile not found')
      router.push('/auth/login')
      return
    }

    // profile이 아직 로딩 중이면 대기
    if (!profile) {
      return
    }

    // last_mode를 확인하여 마지막 방문 페이지로 리다이렉트
    let lastMode: 'buyer' | 'seller' | null = null

    // 구매자 프로필이 있으면 구매자의 last_mode 확인
    if (profile.buyer) {
      lastMode = profile.buyer.last_mode
    }

    // 판매자 프로필이 있고 판매자 last_mode가 'seller'면 우선
    if (profile.seller && profile.seller.last_mode === 'seller') {
      lastMode = 'seller'
    }

    // last_mode에 따라 리다이렉트
    if (lastMode === 'seller' && profile.isSeller) {
      router.push('/seller/dashboard')
    } else if (lastMode === 'buyer' && profile.isBuyer) {
      router.push('/buyer/orders')
    } else if (profile.isSeller) {
      // last_mode 없으면 판매자 페이지 우선
      router.push('/seller/dashboard')
    } else if (profile.isBuyer) {
      // 구매자만 있으면 구매자 페이지로
      router.push('/buyer/orders')
    } else {
      // 둘 다 아닌 경우 (오류)
      console.error('User is neither buyer nor seller')
      router.push('/auth/login')
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
