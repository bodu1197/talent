'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    console.log('[Seller Layout] useEffect triggered - loading:', loading, 'user:', user?.id, 'pathname:', pathname)

    async function checkSeller() {
      if (loading) {
        console.log('[Seller Layout] Auth still loading...')
        return
      }

      if (!user) {
        console.log('[Seller Layout] No user')
        setChecking(false)
        return
      }

      // Register 페이지는 seller 체크 생략
      if (pathname === '/mypage/seller/register') {
        console.log('[Seller Layout] Register page, skipping seller check')
        setChecked(true)
        setChecking(false)
        return
      }

      // Seller 확인
      console.log('[Seller Layout] Checking seller status...')
      const supabase = createClient()
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!seller) {
        console.log('[Seller Layout] Not a seller, redirecting to register')
        router.replace('/mypage/seller/register')
        setChecking(false)
        return
      }

      console.log('[Seller Layout] Seller verified:', seller.id)
      setChecked(true)
      setChecking(false)
    }

    checkSeller()
  }, [loading, user?.id, pathname, router])

  // Show loading state instead of returning null
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">판매자 정보 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!checked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">페이지 이동 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
