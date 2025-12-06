'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import MobileSubHeader from './MobileSubHeader';

interface ConditionalLayoutProps {
  readonly children: React.ReactNode;
  readonly megaMenu: React.ReactNode;
}

export default function ConditionalLayout({ children, megaMenu }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // 관리자 및 마이페이지에서 헤더/푸터 숨기기
  const hideLayout = pathname?.startsWith('/admin') || pathname?.startsWith('/mypage');

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

  // 서브 페이지 확인 (모바일에서 뒤로가기 헤더 표시) - 검색 페이지, 서비스 상세 페이지 제외
  const isSubPage =
    !hideLayout && !isMainPage && !isMypagePage && !isSearchPage && !isServiceDetailPage;

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

          {/* 모바일: 메인 페이지일 때만 헤더 표시 */}
          <div className="lg:hidden">{isMainPage && <Header />}</div>

          {/* 모바일: 서브 페이지일 때 뒤로가기 헤더 표시 */}
          {isSubPage && <MobileSubHeader />}
        </>
      )}

      <main
        className={(() => {
          if (isMypagePage) return 'flex-1 pt-[60px] lg:pt-20 pb-16 lg:pb-0 w-full max-w-none';
          if (isChatPage) return 'flex-1 pt-0 pb-16 lg:pb-0';
          if (isMainPage) return 'flex-1 pt-[60px] lg:pt-20 pb-16 lg:pb-0';
          if (isSearchPage) return 'flex-1 pt-0 lg:pt-[102px] pb-16 lg:pb-0';
          if (isServiceDetailPage) return 'flex-1 pt-0 lg:pt-[102px] pb-0 lg:pb-0';
          return 'flex-1 pt-[60px] lg:pt-[102px] pb-16 lg:pb-0';
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
      {/* 모바일 하단 네비: 서비스 상세 페이지에서는 숨김 */}
      {!isServiceDetailPage && <MobileBottomNav />}
    </>
  );
}
