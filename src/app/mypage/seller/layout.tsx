'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

// 간단한 클라이언트 체크 (한 번만)
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Register 페이지는 체크 생략
    if (pathname === '/mypage/seller/register') return

    // 판매자 확인
    async function checkSeller() {
      if (!user) {
        router.replace('/auth/login')
        return
      }

      const supabase = createClient()
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!seller) {
        router.replace('/mypage/seller/register')
      }
    }

    checkSeller()
  }, [user, loading, pathname, router])

  // 항상 children 렌더링 (체크는 백그라운드에서)
  return <>{children}</>
}
