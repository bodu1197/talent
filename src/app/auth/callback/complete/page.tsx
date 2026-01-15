'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { parseOAuthState } from '@/lib/auth/config';
import { logger } from '@/lib/logger';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

// Helper: state 파라미터에서 추가 정보 추출
function extractFromStateParam(
  stateParam: string | null,
  currentNickname: string | undefined,
  currentProfileImage: string | undefined
): { nickname: string | undefined; profileImage: string | undefined } {
  let nickname = currentNickname;
  let profileImage = currentProfileImage;

  if (!stateParam) {
    return { nickname, profileImage };
  }

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

  return { nickname, profileImage };
}

// Helper: 프로필 DB 업데이트
async function updateProfileTables(
  supabase: SupabaseClient,
  userId: string,
  nickname: string | undefined,
  profileImage: string | undefined
): Promise<void> {
  if (!nickname && !profileImage) return;

  const updates: { name?: string; profile_image?: string } = {};
  if (nickname) updates.name = nickname;
  if (profileImage) updates.profile_image = profileImage;

  const { error: usersUpdateError } = await supabase.from('users').update(updates).eq('id', userId);

  if (usersUpdateError) {
    logger.error('Failed to update users table:', usersUpdateError);
  }

  const { error: profilesUpdateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId);

  if (profilesUpdateError) {
    logger.error('Failed to update profiles table:', profilesUpdateError);
  }
}

// Helper: 사용자 메타데이터에서 정보 추출
function extractFromUserMetadata(user: User): {
  nickname: string | undefined;
  profileImage: string | undefined;
} {
  const nickname = user.user_metadata?.full_name || user.user_metadata?.name;
  const profileImage = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  return { nickname, profileImage };
}

function CallbackCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return;

    const updateUserProfile = async () => {
      setIsProcessing(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          // 메타데이터에서 정보 추출
          const metadata = extractFromUserMetadata(user);

          // state 파라미터에서 추가 정보 추출
          const stateParam = searchParams.get('state');
          const { nickname, profileImage } = extractFromStateParam(
            stateParam,
            metadata.nickname,
            metadata.profileImage
          );

          // DB 업데이트
          await updateProfileTables(supabase, user.id, nickname, profileImage);
        }

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
