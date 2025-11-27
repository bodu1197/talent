'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import Sidebar from './Sidebar';
import MobileMyPageNav from './MobileMyPageNav';
import MobileMyPageHeader from './MobileMyPageHeader';

interface MypageLayoutWrapperProps {
  readonly mode: 'seller' | 'buyer';
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

  const pathname = usePathname();
  const router = useRouter();

  // 대시보드 페이지인지 확인
  const isDashboard =
    pathname === '/mypage/seller/dashboard' || pathname === '/mypage/buyer/dashboard';

  // 서브페이지 제목 매핑
  const getPageTitle = () => {
    if (pathname.includes('/orders')) return '주문 관리';
    if (pathname.includes('/favorites')) return '찜한 서비스';
    if (pathname.includes('/reviews')) return '리뷰 관리';
    if (pathname.includes('/quotes')) return '견적 요청';
    if (pathname.includes('/services')) return '서비스 관리';
    if (pathname.includes('/earnings')) return '정산 관리';
    if (pathname.includes('/statistics')) return '통계';
    if (pathname.includes('/portfolio')) return '포트폴리오';
    if (pathname.includes('/profile')) return '프로필';
    if (pathname.includes('/advertising')) return '광고 관리';
    if (pathname.includes('/notifications')) return '알림';
    if (pathname.includes('/settings')) return '설정';
    return '마이페이지';
  };

  // 역할 변경 핸들러
  const handleRoleChange = (role: 'buyer' | 'seller') => {
    if (role === 'seller') {
      // 판매자 등록이 안 되어 있으면 등록 페이지로
      if (!isRegisteredSeller) {
        router.push('/mypage/seller/register');
      } else {
        router.push('/mypage/seller/dashboard');
      }
    } else {
      router.push('/mypage/buyer/dashboard');
    }
  };

  // 뒤로가기 URL
  const getBackHref = () => {
    if (mode === 'seller') return '/mypage/seller/dashboard';
    return '/mypage/buyer/dashboard';
  };

  return (
    <div className="bg-black/[0.05] flex justify-center">
      <div className="flex w-full max-w-[1200px]">
        {/* PC: 사이드바 */}
        <Sidebar mode={mode} profileData={profileData} isRegisteredSeller={isRegisteredSeller} />

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
  );
}
