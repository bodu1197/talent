// Rollbar dependence removed in favor of Sentry
// This file is kept to maintain API compatibility with existing server routes

export function getServerRollbar() {
  return null;
}

// 서버에서 에러 로깅
export function logServerError(error: Error | string, extra?: Record<string, unknown>) {
  console.error('[Server Error]', error, extra);
}

// 서버에서 경고 로깅
export function logServerWarning(message: string, extra?: Record<string, unknown>) {
  console.warn('[Server Warning]', message, extra);
}

// 서버에서 정보 로깅
export function logServerInfo(message: string, extra?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.info('[Server Info]', message, extra);
}
