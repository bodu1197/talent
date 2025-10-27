'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import ConditionalMegaMenu from './ConditionalMegaMenu'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // 마이페이지와 관리자 페이지에서는 헤더/푸터 숨기기
  const hideLayout = pathname?.startsWith('/mypage') || pathname?.startsWith('/admin')

  if (hideLayout) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <ConditionalMegaMenu />
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  )
}
