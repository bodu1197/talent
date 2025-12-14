'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

interface ConditionalLayoutProps {
  readonly children: React.ReactNode;
  readonly megaMenu: React.ReactNode;
  readonly categoryBar: React.ReactNode;
}

export default function ConditionalLayout({
  children,
  megaMenu,
  categoryBar,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // 메인 페이지 확인 (모바일에서 헤더/검색 표시)
  const isMainPage = pathname === '/';

  // 검색 페이지 확인 (모바일에서 자체 UI 사용)
  const isSearchPage = pathname === '/search';

  // 서비스 상세 페이지 확인 (모바일에서 헤더/푸터/하단탭 숨기기)
  const isServiceDetailPage = pathname?.startsWith('/services/') && pathname !== '/services';

  // mypage 페이지 확인
  const isMypagePage = pathname?.startsWith('/mypage');

  // 채팅 페이지 확인 (메가메뉴 숨김)
  const isChatPage = pathname?.startsWith('/chat');

  // Admin은 자체 레이아웃을 사용하므로 children만 반환
  if (pathname?.startsWith('/admin')) {
    return (
      <>
        {children}
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      {/* Mypage/Chat: 헤더만 표시 (메가메뉴 없음) */}
      {(isMypagePage || isChatPage) && (
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
      {!isMypagePage && !isChatPage && (
        <>
          {/* PC: 항상 일반 헤더 표시 */}
          <div className="hidden lg:block">
            <Header />
            {megaMenu}
          </div>

          {/* 모바일: 항상 헤더 표시 */}
          <div className="lg:hidden">
            <Header />
            {categoryBar}
          </div>
        </>
      )}

      <main
        className={(() => {
          if (isMypagePage) return 'flex-1 pt-[60px] lg:pt-20 pb-16 lg:pb-0 w-full max-w-none';
          if (isChatPage) return 'flex-1 pt-0 pb-16 lg:pb-0';
          if (isMainPage) return 'flex-1 pt-[180px] lg:pt-20 pb-16 lg:pb-0';
          if (isSearchPage) return 'flex-1 pt-0 lg:pt-[102px] pb-16 lg:pb-0';
          if (isServiceDetailPage) return 'flex-1 pt-0 lg:pt-[102px] pb-0 lg:pb-0';
          return 'flex-1 pt-[180px] lg:pt-[102px] pb-16 lg:pb-0';
        })()}
      >
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
      {/* 모바일 하단 네비: 항상 표시 */}
      <MobileBottomNav />
    </>
  );
}
