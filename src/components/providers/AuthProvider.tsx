'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { registerServiceWorker } from '@/lib/serviceWorker';

type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // 역할 확인
  is_buyer: boolean;
  is_seller: boolean;
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 프로필 정보 가져오기 (profiles, buyers, sellers 테이블에서 조회)
  const fetchProfile = async (userId: string) => {
    logger.debug('[AuthProvider] fetchProfile called for user:', { userId });
    try {
      // profiles 테이블에서 기본 정보 조회
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        logger.error('[AuthProvider] Profile fetch error:', userError, {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code,
        });
        // 에러 발생 시 기본 프로필 설정
        setProfile({
          id: userId,
          email: '',
          name: 'User',
          email_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_buyer: true,
          is_seller: false,
        });
        logger.warn('[AuthProvider] Set fallback profile due to error');
        return;
      }

      // buyers 테이블 확인
      const { data: buyerData } = await supabase
        .from('buyers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      const isBuyer = !!buyerData;

      // sellers 테이블 확인
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      const isSeller = !!sellerData;

      // profiles 테이블의 user_id를 제외하고 userId를 id로 사용
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Destructuring to exclude user_id and id from profileFields
      const { user_id, id, ...profileFields } = userData as Record<string, unknown>;
      const profileData = {
        ...profileFields,
        id: userId, // user의 id를 profile id로 사용
        is_buyer: isBuyer,
        is_seller: isSeller,
      } as UserProfile;

      logger.debug('[AuthProvider] Profile loaded successfully:', {
        isBuyer,
        isSeller,
      });
      setProfile(profileData);
    } catch (error: unknown) {
      logger.error('[AuthProvider] Profile fetch error:', error);

      // 에러 시 fallback 프로필 설정
      setProfile({
        id: userId,
        email: '',
        name: 'User',
        email_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_buyer: true,
        is_seller: false,
      });
      logger.warn('[AuthProvider] Set fallback profile due to exception');
    }
  };

  // 프로필 새로고침
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      logger.error('로그아웃 실패:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Service Worker 등록
    registerServiceWorker();

    // 초기 세션 체크 - 단순화
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setUser(session?.user ?? null);
        setLoading(false);

        // 프로필은 필요할 때만 백그라운드에서 로드 (에러 무시)
        if (session?.user) {
          fetchProfile(session.user.id).catch(() => {
            // 프로필 로딩 실패해도 무시 (user만 있으면 됨)
          });
        } else {
          setProfile(null);
        }
      } catch {
        // 에러 무시하고 loading만 false로
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // 인증 상태 변화 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION') return;

      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, signOut, refreshProfile }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
