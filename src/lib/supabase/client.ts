import { SupabaseManager } from './singleton';

/**
 * 브라우저 클라이언트 생성 (클라이언트 컴포넌트용)
 * 싱글톤 패턴으로 한 번만 생성되어 재사용됩니다
 */
export function createClient() {
  return SupabaseManager.getBrowserClient();
}
