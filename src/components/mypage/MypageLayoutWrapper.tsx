'use client'

import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'
import Footer from '@/components/layout/Footer'

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
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-16 lg:pt-[86px] absolute inset-0 top-[86px]">
      <div className="flex w-full max-w-[1200px]">
        <MobileSidebar mode={mode} />
        <Sidebar mode={mode} sellerData={sellerData} />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
