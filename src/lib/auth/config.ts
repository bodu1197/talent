/**
 * 인증 관련 보안 설정
 */

// OAuth 리다이렉트 허용 Origin (CRITICAL 보안)
export const ALLOWED_REDIRECT_ORIGINS = [
  "http://localhost:3000",
  "https://dolpagu.com",
];

// Rate Limiting 설정
export const RATE_LIMIT_CONFIG = {
  LOGIN: {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 300000, // 5분
  },
  REGISTER: {
    MAX_ATTEMPTS: 3,
    LOCKOUT_DURATION: 600000, // 10분
  },
  FORGOT_PASSWORD: {
    MAX_ATTEMPTS: 3,
    LOCKOUT_DURATION: 600000, // 10분
  },
};

/**
 * OAuth 리다이렉트 URL 검증
 * @param origin - 검증할 origin
 * @returns 허용된 origin인지 여부
 */
export function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_REDIRECT_ORIGINS.includes(origin);
}

/**
 * 안전한 OAuth 리다이렉트 URL 생성
 * @param origin - 현재 origin
 * @param path - 리다이렉트 경로
 * @returns 검증된 리다이렉트 URL
 * @throws Error if origin is not allowed
 */
export function getSecureRedirectUrl(
  origin: string,
  path: string = "/auth/callback",
): string {
  if (!isAllowedOrigin(origin)) {
    throw new Error("Invalid origin for redirect");
  }
  return `${origin}${path}`;
}

/**
 * OAuth state 파라미터 생성 (CSRF 방지)
 * @param data - 전달할 데이터
 * @returns Base64 인코딩된 state
 */
export function createOAuthState(data: Record<string, unknown>): string {
  const stateData = {
    ...data,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15),
  };
  return btoa(JSON.stringify(stateData));
}

/**
 * OAuth state 파라미터 파싱
 * @param state - Base64 인코딩된 state
 * @param maxAge - 최대 유효 시간 (밀리초)
 * @returns 파싱된 데이터
 * @throws Error if state is invalid or expired
 */
export function parseOAuthState<T = Record<string, unknown>>(
  state: string,
  maxAge: number = 600000, // 10분
): T {
  try {
    const decoded = JSON.parse(atob(state));

    // 타임스탬프 검증
    if (!decoded.timestamp || Date.now() - decoded.timestamp > maxAge) {
      throw new Error("State expired");
    }

    return decoded as T;
  } catch {
    throw new Error("Invalid state parameter");
  }
}
