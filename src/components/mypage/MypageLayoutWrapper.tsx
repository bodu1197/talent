'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import Sidebar from './Sidebar';
import MobileMyPageNav from './MobileMyPageNav';
import MobileMyPageHeader from './MobileMyPageHeader';
import ServiceTabs from './ServiceTabs';

interface MypageLayoutWrapperProps {
  readonly mode: 'seller' | 'buyer' | 'helper';
  readonly profileData?: {
    readonly name: string;
    readonly profile_image?: string | null;
  } | null;
  readonly children: ReactNode;
}

export default function MypageLayoutWrapper({
  mode,
  profileData: initialProfileData,
  children,
}: MypageLayoutWrapperProps) {
  const [profileData, setProfileData] = useState(initialProfileData);
  const [isRegisteredSeller, setIsRegisteredSeller] = useState(false);
  const [isRegisteredHelper, setIsRegisteredHelper] = useState(false);

  // 자동으로 프로필 정보 로드
  useEffect(() => {
    // initialProfileData가 이미 있으면 사용 (dashboard에서 전달한 경우)
    if (initialProfileData !== undefined) {
      setProfileData(initialProfileData);
    } else {
      // profileData가 없으면 자동 로드
      loadProfileData();
    }

    // 판매자 모드일 때 등록 여부 확인
    if (mode === 'seller') {
      checkSellerRegistration();
    }

    // 심부름꾼 모드일 때 등록 여부 확인
    if (mode === 'helper') {
      checkHelperRegistration();
    }
  }, [mode, initialProfileData]);

  async function loadProfileData() {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Load from profiles table (unified source for both buyer and seller)
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, profile_image')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfileData(profile);
    } catch (error) {
      logger.error('Failed to load profile data:', error);
      setProfileData(null);
    }
  }

  async function checkSellerRegistration() {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsRegisteredSeller(!!seller);
    } catch (error) {
      logger.error('Failed to check seller registration:', error);
    }
  }

  async function checkHelperRegistration() {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: helper } = await supabase
        .from('helper_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsRegisteredHelper(!!helper);
    } catch (error) {
      logger.error('Failed to check helper registration:', error);
    }
  }

  const pathname = usePathname();
  const router = useRouter();

  // 대시보드 페이지인지 확인
  const isDashboard =
    pathname === '/mypage/seller/dashboard' ||
    pathname === '/mypage/buyer/dashboard' ||
    pathname === '/mypage/helper/dashboard';

  // 서브페이지 제목 매핑
  const pageTitleMap: Record<string, string> = {
    '/orders': '주문 관리',
    '/errands': '심부름 관리',
    '/favorites': '찜한 서비스',
    '/reviews': '리뷰 관리',
    '/quotes': '견적 요청',
    '/services': '서비스 관리',
    '/earnings': '수익 관리',
    '/statistics': '통계',
    '/portfolio': '포트폴리오',
    '/profile': '프로필',
    '/advertising': '광고 관리',
    '/notifications': '알림',
    '/settings': '설정',
    '/subscription': '구독 관리',
    '/available': '심부름 찾기',
    '/applied': '지원한 심부름',
  };

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitleMap)) {
      if (pathname.includes(path)) return title;
    }
    return '마이페이지';
  };

  // 역할 변경 핸들러
  const handleRoleChange = (role: 'buyer' | 'seller' | 'helper') => {
    if (role === 'seller') {
      // 판매자 등록이 안 되어 있으면 등록 페이지로
      if (!isRegisteredSeller) {
        router.push('/mypage/seller/register');
      } else {
        router.push('/mypage/seller/dashboard');
      }
    } else if (role === 'helper') {
      // 심부름꾼 등록이 안 되어 있으면 등록 페이지로
      if (!isRegisteredHelper) {
        router.push('/errands/register');
      } else {
        router.push('/mypage/helper/dashboard');
      }
    } else {
      router.push('/mypage/buyer/dashboard');
    }
  };

  // 뒤로가기 URL
  const getBackHref = () => {
    if (mode === 'seller') return '/mypage/seller/dashboard';
    if (mode === 'helper') return '/mypage/helper/dashboard';
    return '/mypage/buyer/dashboard';
  };

  return (
    <>
      {/* 서비스 전환 탭 - 모바일에서만 표시 */}
      <div className="lg:hidden">
        <ServiceTabs
          isRegisteredSeller={isRegisteredSeller}
          isRegisteredHelper={isRegisteredHelper}
        />
      </div>

      <div className="bg-black/[0.05] flex justify-center">
        <div className="flex w-full max-w-[1200px]">
          {/* PC: 사이드바 */}
          <Sidebar
            mode={mode}
            profileData={profileData}
            isRegisteredSeller={isRegisteredSeller}
            isRegisteredHelper={isRegisteredHelper}
          />

          <main className="flex-1 overflow-y-auto">
            {/* 모바일: 서브페이지 헤더 (대시보드가 아닌 경우) */}
            {!isDashboard && (
              <div className="lg:hidden">
                <MobileMyPageHeader title={getPageTitle()} backHref={getBackHref()} />
              </div>
            )}

            {/* 모바일: 대시보드에서 네비게이션 메뉴 표시 */}
            {isDashboard && (
              <div className="lg:hidden">
                <MobileMyPageNav
                  currentRole={mode}
                  onRoleChange={handleRoleChange}
                  isSeller={isRegisteredSeller}
                />
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
    </>
  );
}
