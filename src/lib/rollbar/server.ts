import Rollbar from 'rollbar';

// 서버사이드 Rollbar 인스턴스 (싱글톤)
let rollbarInstance: Rollbar | null = null;

export function getServerRollbar(): Rollbar | null {
  if (typeof window !== 'undefined') {
    return null; // 클라이언트에서는 null 반환
  }

  const serverToken =
    process.env.ROLLBAR_SERVER_TOKEN || process.env.choi_ROLLBAR_TALENT_SERVER_TOKEN_1764791738;
  if (!rollbarInstance && serverToken) {
    rollbarInstance = new Rollbar({
      accessToken: serverToken,
      environment: process.env.NODE_ENV || 'development',
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
  }

  return rollbarInstance;
}

// 서버에서 에러 로깅
export function logServerError(error: Error | string, extra?: Record<string, unknown>) {
  const rollbar = getServerRollbar();
  if (rollbar) {
    rollbar.error(error, extra);
  }
  // Rollbar 없어도 에러는 항상 콘솔에 출력

  console.error('[Server Error]', error, extra);
}

// 서버에서 경고 로깅
export function logServerWarning(message: string, extra?: Record<string, unknown>) {
  const rollbar = getServerRollbar();
  if (rollbar) {
    rollbar.warning(message, extra);
  } else {
    console.warn('[Server Warning]', message, extra);
  }
}

// 서버에서 정보 로깅
export function logServerInfo(message: string, extra?: Record<string, unknown>) {
  const rollbar = getServerRollbar();
  if (rollbar) {
    rollbar.info(message, extra);
  }
}
