import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 성능 모니터링 설정
  tracesSampleRate: 1.0,

  // 에러 리포팅 환경 설정
  environment: process.env.NODE_ENV,

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',
})
