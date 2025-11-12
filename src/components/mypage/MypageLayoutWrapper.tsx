'use client'

import { ReactNode } from 'react'
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

export default function MypageLayoutWrapper({ mode, sellerData, children }: MypageLayoutWrapperProps) {
  return (
    <div className="flex w-full">
      <MobileSidebar mode={mode} />
      <Sidebar mode={mode} sellerData={sellerData} />
      <main className="flex-1 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
