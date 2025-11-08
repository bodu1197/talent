'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import SearchBar from './SearchBar'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import MobileSubHeader from './MobileSubHeader'

interface ConditionalLayoutProps {
  children: React.ReactNode
  megaMenu: React.ReactNode
}

export default function ConditionalLayout({ children, megaMenu }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // 관리자 페이지에서만 헤더/푸터 숨기기
  const hideLayout = pathname?.startsWith('/admin')

  // 메인 페이지 확인 (모바일에서 헤더/검색 표시) - 랜딩 페이지도 포함
  const isMainPage = pathname === '/' || pathname === '/landing'

  // mypage 페이지 확인
  const isMypagePage = pathname?.startsWith('/mypage')

  // 서브 페이지 확인 (모바일에서 뒤로가기 헤더 표시)
  const isSubPage = !hideLayout && !isMainPage && !isMypagePage

  return (
    <>
      {!hideLayout && (
        <>
          {/* PC: 항상 일반 헤더 표시 */}
          <div className="hidden lg:block">
            <Header />
            <SearchBar id="desktop-search" />
            {megaMenu}
          </div>

          {/* 모바일: 메인 페이지일 때만 헤더/검색 표시 */}
          {isMainPage && (
            <div className="lg:hidden">
              <Header />
              <SearchBar id="mobile-search" />
            </div>
          )}

          {/* 모바일: 서브 페이지일 때 뒤로가기 헤더 표시 */}
          {isSubPage && <MobileSubHeader />}
        </>
      )}
      <main className={
        hideLayout
          ? ''
          : isMypagePage
            ? 'flex-1 pt-16 lg:pt-[86px] pb-16 lg:pb-0'
            : isMainPage
              ? 'flex-1 pt-[140px] lg:pt-[86px] pb-16 lg:pb-0'
              : 'flex-1 pt-16 lg:pt-[86px] pb-16 lg:pb-0'
      }>
        {isMypagePage ? (
          <div className="h-full w-full">
            {children}
          </div>
        ) : (
          <div className="container-1200 h-full">
            {children}
          </div>
        )}
      </main>
      {!hideLayout && (
        <>
          {/* PC: 모든 페이지에서 풋터 표시, 모바일: 메인 페이지에서만 풋터 표시 */}
          <div className="hidden lg:block">
            <Footer />
          </div>
          {isMainPage && (
            <div className="lg:hidden">
              <Footer />
            </div>
          )}
          <MobileBottomNav />
        </>
      )}
    </>
  )
}
