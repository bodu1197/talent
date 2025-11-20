/**
 * Sentry 테스트용 API 엔드포인트
 *
 * 사용법:
 * 1. 개발 서버 실행: npm run dev
 * 2. 브라우저에서 접속: http://localhost:3000/api/sentry-test
 * 3. Sentry.io 대시보드에서 에러 확인
 *
 * 확인 후 이 파일을 삭제해도 됩니다.
 */

export async function GET() {
  // 의도적으로 에러 발생
  throw new Error(
    "🧪 Sentry 테스트 에러입니다! 이 에러가 Sentry.io 대시보드에 표시되면 성공!",
  );
}
