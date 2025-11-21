import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 성능 모니터링 설정
  tracesSampleRate: 1.0,

  // 에러 리포팅 환경 설정
  environment: process.env.NODE_ENV,

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',

  // 리플레이 세션 샘플링
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // CSP 호환 설정: eval() 사용 방지
  // Sentry가 안전한 방식으로 동작하도록 설정
  transport: Sentry.makeFetchTransport,
  stackParser: Sentry.defaultStackParser,
})

