'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { parseOAuthState } from '@/lib/auth/config';
import { logger } from '@/lib/logger';

function CallbackCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return; // 중복 실행 방지

    const updateUserProfile = async () => {
      setIsProcessing(true);

      try {
        // 현재 사용자 정보 가져오기
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (user) {
          // 1. 소셜 로그인(user_metadata)에서 정보 추출 - 우선순위 1
          let nickname = user.user_metadata?.full_name || user.user_metadata?.name;
          let profileImage = user.user_metadata?.avatar_url || user.user_metadata?.picture;

          // 2. state 파라미터에서 정보 추출 (메타데이터가 없을 경우) - 우선순위 2
          const stateParam = searchParams.get('state');
          if (stateParam) {
            try {
              const stateData = parseOAuthState<{
                nickname?: string;
                profileImage?: string;
              }>(stateParam);
              
              if (!nickname && stateData.nickname) nickname = stateData.nickname;
              if (!profileImage && stateData.profileImage) profileImage = stateData.profileImage;
            } catch (error) {
              logger.warn('State parse error (ignored):', {
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          // 업데이트할 정보가 있는 경우에만 DB 업데이트
          if (nickname || profileImage) {
            const updates: { name?: string; profile_image?: string } = {};
            if (nickname) updates.name = nickname;
            if (profileImage) updates.profile_image = profileImage;

            // users 테이블 업데이트
            const { error: usersUpdateError } = await supabase
              .from('users')
              .update(updates)
              .eq('id', user.id);

            if (usersUpdateError) {
              logger.error('Failed to update users table:', usersUpdateError);
            }

            // profiles 테이블 업데이트 (동기화)
            const { error: profilesUpdateError } = await supabase
              .from('profiles')
              .update(updates)
              .eq('user_id', user.id);

            if (profilesUpdateError) {
              logger.error('Failed to update profiles table:', profilesUpdateError);
            }
          }
        }

        // 홈으로 리다이렉트
        router.push('/');
      } catch (error: unknown) {
        logger.error('Profile update error:', error);
        router.push('/');
      }
    };

    updateUserProfile();
  }, [router, supabase, searchParams, isProcessing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner mb-4"></div>
        <p className="text-gray-600">로그인 중...</p>
      </div>
    </div>
  );
}

export default function CallbackCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">로그인 중...</p>
          </div>
        </div>
      }
    >
      <CallbackCompleteContent />
    </Suspense>
  );
}
