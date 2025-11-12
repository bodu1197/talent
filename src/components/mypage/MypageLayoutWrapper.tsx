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
