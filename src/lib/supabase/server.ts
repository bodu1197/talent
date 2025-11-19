import { SupabaseManager } from './singleton'

/**
 * 서버 클라이언트 생성 (서버 컴포넌트/API 라우트용)
 * 쿠키를 사용하므로 매 요청마다 새로 생성됩니다
 */
export async function createClient() {
  return SupabaseManager.getServerClient()
}

/**
 * Service Role 클라이언트 생성 (RLS 우회)
 * 서버 사이드에서만 사용 가능합니다
 */
export function createServiceRoleClient() {
  return SupabaseManager.getServiceRoleClient()
}