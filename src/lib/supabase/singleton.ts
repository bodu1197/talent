import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트 싱글톤 매니저
 * 중복 생성을 방지하고 일관된 설정을 보장합니다
 */
export class SupabaseManager {
  private static browserClient: SupabaseClient | null = null;
  private static serviceClient: SupabaseClient | null = null;

  // 공통 설정
  private static readonly commonConfig = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' as const,
      storageKey: 'sb-auth-token',
    },
    global: {
      headers: {
        'x-application-name': 'talent-hub',
      },
    },
  };

  /**
   * 브라우저 클라이언트 (클라이언트 컴포넌트용)
   * 싱글톤 패턴으로 한 번만 생성됩니다
   */
  static getBrowserClient(): SupabaseClient {
    if (!this.browserClient) {
      // 환경 변수 검증
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        throw new Error(
          'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        );
      }

      this.browserClient = createBrowserClient(url, key, this.commonConfig);
    }
    return this.browserClient;
  }

  /**
   * 서버 클라이언트 (서버 컴포넌트/API 라우트용)
   * 쿠키를 사용하므로 매번 새로 생성해야 합니다
   * 주의: 이 메서드는 서버 환경에서만 사용해야 합니다
   */
  static async getServerClient(): Promise<SupabaseClient> {
    // 환경 변수 검증
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    // 동적 import를 사용하여 서버 전용 모듈 로드
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set({ name, value, ...options });
            }
          } catch {
            // Server Component에서 호출된 경우 무시
            // 미들웨어에서 세션 새로고침을 처리합니다
          }
        },
      },
      auth: {
        flowType: 'pkce',
        storageKey: 'sb-auth-token',
      },
    });
  }

  /**
   * Service Role 클라이언트 (관리자 권한이 필요한 경우)
   * RLS를 우회하는 특별한 권한을 가집니다
   * 서버 사이드에서만 사용해야 합니다!
   */
  static getServiceRoleClient(): SupabaseClient {
    if (globalThis.window !== undefined) {
      throw new TypeError('Service Role Client는 서버 사이드에서만 사용할 수 있습니다!');
    }

    if (!this.serviceClient) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다');
      }

      this.serviceClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
    return this.serviceClient;
  }

  /**
   * 클라이언트 인스턴스 초기화 (테스트용)
   */
  static resetClients() {
    this.browserClient = null;
    this.serviceClient = null;
  }
}

// 편의를 위한 기존 함수명 유지 (기존 코드와의 호환성)
export const createClient = () => {
  // 환경에 따라 적절한 클라이언트 반환
  if (globalThis.window !== undefined) {
    return SupabaseManager.getBrowserClient();
  }
  // 서버 사이드에서는 async 함수를 통해 호출해야 함
  throw new Error('서버 사이드에서는 createServerClient()를 사용하세요');
};

export const createServerClientHelper = async () => {
  return SupabaseManager.getServerClient();
};

export const createServiceRoleClient = () => {
  return SupabaseManager.getServiceRoleClient();
};
