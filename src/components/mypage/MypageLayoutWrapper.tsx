'use client';

import { ReactNode, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';

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

  return (
    <div className="bg-black/5 flex justify-center">
      <div className="flex w-full max-w-[1200px]">
        <MobileSidebar mode={mode} isRegisteredSeller={isRegisteredSeller} />
        <Sidebar mode={mode} profileData={profileData} isRegisteredSeller={isRegisteredSeller} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
