'use client'

import { ReactNode, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'

interface MypageLayoutWrapperProps {
  mode: 'seller' | 'buyer'
  sellerData?: {
    display_name: string
    profile_image?: string | null
  } | null
  children: ReactNode
}

export default function MypageLayoutWrapper({ mode, sellerData: initialSellerData, children }: MypageLayoutWrapperProps) {
  const [sellerData, setSellerData] = useState(initialSellerData)

  // seller 모드일 때 자동으로 seller 정보 로드
  useEffect(() => {
    // initialSellerData가 이미 있으면 사용 (dashboard에서 전달한 경우)
    if (initialSellerData !== undefined) {
      setSellerData(initialSellerData)
      return
    }

    // seller 모드이고 sellerData가 없으면 자동 로드
    if (mode === 'seller') {
      loadSellerData()
    }
  }, [mode, initialSellerData])

  async function loadSellerData() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Use seller_profiles view which joins sellers + profiles
      const { data: seller } = await supabase
        .from('seller_profiles')
        .select('display_name, profile_image')
        .eq('user_id', user.id)
        .maybeSingle()

      setSellerData(seller)
    } catch (error) {
      console.error('Failed to load seller data:', error)
      setSellerData(null)
    }
  }

  return (
    <div className="bg-gray-100 flex justify-center">
      <div className="flex w-full max-w-[1200px]">
        <MobileSidebar mode={mode} />
        <Sidebar mode={mode} sellerData={sellerData} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
