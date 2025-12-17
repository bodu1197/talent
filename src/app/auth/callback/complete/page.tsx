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
        // state 파라미터에서 데이터 추출 (안전한 방법)
        const stateParam = searchParams.get('state');
        let nickname: string | null = null;
        let profileImage: string | null = null;

        if (stateParam) {
          try {
            const stateData = parseOAuthState<{
              nickname: string;
              profileImage: string;
            }>(stateParam);
            nickname = stateData.nickname;
            profileImage = stateData.profileImage;
          } catch (error) {
            logger.warn(
              'Invalid or expired state parameter:',
              error instanceof Error ? { message: error.message } : { error: String(error) }
            );
            // state가 유효하지 않아도 로그인은 성공했으므로 계속 진행
          }
        }

        // 현재 사용자 정보 가져오기
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (user && nickname) {
          // users 테이블 업데이트
          const { error: usersUpdateError } = await supabase
            .from('users')
            .update({
              name: nickname,
              profile_image: profileImage,
            })
            .eq('id', user.id);

          if (usersUpdateError) {
            logger.error('Failed to update users table:', usersUpdateError);
          }

          // profiles 테이블 업데이트 (동기화)
          const { error: profilesUpdateError } = await supabase
            .from('profiles')
            .update({
              name: nickname,
              profile_image: profileImage,
            })
            .eq('user_id', user.id);

          if (profilesUpdateError) {
            logger.error('Failed to update profiles table:', profilesUpdateError);
            // 업데이트 실패해도 로그인은 성공했으므로 계속 진행
          }
        }

        // 홈으로 리다이렉트
        router.push('/');
      } catch (error: unknown) {
        logger.error('Profile update error:', error);
        // 에러가 있어도 홈으로 리다이렉트
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
