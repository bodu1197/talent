'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import ConditionalMegaMenu from './ConditionalMegaMenu'
import SearchBar from './SearchBar'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // 마이페이지와 관리자 페이지에서는 헤더/푸터 숨기기
  const hideLayout = pathname?.startsWith('/mypage') || pathname?.startsWith('/admin')

  // pathname을 key로 사용하여 pathname 변경 시 완전히 새로 렌더링
  return (
    <div key={pathname}>
      {!hideLayout && (
        <>
          <Header />
          <SearchBar />
          <ConditionalMegaMenu />
        </>
      )}
      <main className={hideLayout ? '' : 'flex-1 pt-[140px] lg:pt-[86px] pb-16 lg:pb-0'}>
        {children}
      </main>
      {!hideLayout && (
        <>
          <Footer />
          <MobileBottomNav />
        </>
      )}
    </div>
  )
}
