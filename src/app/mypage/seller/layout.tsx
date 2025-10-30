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

  useEffect(() => {
    async function checkSeller() {
      if (loading || !user) return

      // Register 페이지는 seller 체크 생략
      if (pathname === '/mypage/seller/register') {
        setChecked(true)
        return
      }

      // Seller 확인
      const supabase = createClient()
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!seller) {
        router.replace('/mypage/seller/register')
        return
      }

      setChecked(true)
    }

    checkSeller()
  }, [user, loading, pathname, router])

  if (!checked) return null

  return <>{children}</>
}
