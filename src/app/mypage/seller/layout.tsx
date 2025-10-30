'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkSellerStatus() {
      // authLoading이 끝날 때까지 대기
      if (authLoading) return

      // user가 없으면 상위 레이아웃에서 처리
      if (!user) return

      // Register 페이지는 seller 체크 생략
      if (pathname === '/mypage/seller/register') {
        setChecking(false)
        return
      }

      // 다른 페이지들은 seller 레코드 확인
      const supabase = createClient()

      const { data: seller } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!seller) {
        // No seller record - redirect to registration
        router.push('/mypage/seller/register')
        return
      }

      setChecking(false)
    }

    checkSellerStatus()
  }, [user, authLoading, pathname, router])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="판매자 정보 확인 중..." />
      </div>
    )
  }

  return <>{children}</>
}
