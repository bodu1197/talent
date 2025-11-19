'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import MobileSubHeader from './MobileSubHeader'

interface ConditionalLayoutProps {
  readonly children: React.ReactNode
  readonly megaMenu: React.ReactNode
}

export default function ConditionalLayout({ children, megaMenu }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // 관리자 및 마이페이지에서 헤더/푸터 숨기기
  const hideLayout = pathname?.startsWith('/admin') || pathname?.startsWith('/mypage')

  // 메인 페이지 확인 (모바일에서 헤더/검색 표시) - 랜딩 페이지도 포함
  const isMainPage = pathname === '/' || pathname === '/landing'

  // mypage 페이지 확인
  const isMypagePage = pathname?.startsWith('/mypage')

  // 서브 페이지 확인 (모바일에서 뒤로가기 헤더 표시)
  const isSubPage = !hideLayout && !isMainPage && !isMypagePage

  // Admin은 자체 레이아웃을 사용하므로 children만 반환
  if (pathname?.startsWith('/admin')) {
    return (
      <>
        {children}
        <MobileBottomNav />
      </>
    )
  }

  return (
    <>
      {/* Mypage: 헤더만 표시 (메가메뉴, 검색바 없음) */}
      {isMypagePage && (
        <>
          <div className="hidden lg:block">
            <Header />
          </div>
          <div className="lg:hidden">
            <Header />
          </div>
        </>
      )}

      {/* 일반 페이지: 헤더 + 검색바 + 메가메뉴 */}
      {!isMypagePage && (
        <>
          {/* PC: 항상 일반 헤더 표시 */}
          <div className="hidden lg:block">
            <Header />
            {megaMenu}
          </div>

          {/* 모바일: 메인 페이지일 때만 헤더 표시 */}
          <div className="lg:hidden">
            {isMainPage && <Header />}
          </div>

          {/* 모바일: 서브 페이지일 때 뒤로가기 헤더 표시 */}
          {isSubPage && <MobileSubHeader />}
        </>
      )}

      <main className={
        isMypagePage
          ? 'flex-1 pt-16 lg:pt-[86px] pb-16 lg:pb-0 w-full max-w-none'
          : isMainPage
            ? 'flex-1 pt-[140px] lg:pt-16 pb-16 lg:pb-0'
            : 'flex-1 pt-16 lg:pt-[86px] pb-16 lg:pb-0'
      }>
        {children}
      </main>

      {/* PC: mypage 제외한 모든 페이지에서 풋터 표시, 모바일: 메인 페이지에서만 풋터 표시 */}
      {!isMypagePage && (
        <div className="hidden lg:block">
          <Footer />
        </div>
      )}
      {isMainPage && (
        <div className="lg:hidden">
          <Footer />
        </div>
      )}
      <MobileBottomNav />
    </>
  )
}
