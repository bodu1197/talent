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
  const [isSeller, setIsSeller] = useState(false)

  useEffect(() => {
    async function checkSellerStatus() {
      // Skip check for register page
      if (pathname === '/mypage/seller/register') {
        setChecking(false)
        setIsSeller(true)
        return
      }

      if (!authLoading && user) {
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

        setIsSeller(true)
        setChecking(false)
      } else if (!authLoading && !user) {
        // Not logged in
        router.push('/login')
      }
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

  if (!isSeller) {
    return null
  }

  return <>{children}</>
}
