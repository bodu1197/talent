import { NextResponse } from 'next/server';
import { logServerError, logServerInfo } from '@/lib/rollbar/server';

export async function GET() {
  try {
    // 테스트 정보 로그
    logServerInfo('Rollbar test - info message', {
      test: true,
      timestamp: new Date().toISOString(),
    });

    // 테스트 에러 발생
    const testError = new Error('Rollbar 테스트 에러 - 정상 작동 확인용');
    logServerError(testError, {
      source: 'rollbar-test-api',
      environment: process.env.NODE_ENV,
    });

    return NextResponse.json({
      success: true,
      message: 'Rollbar 테스트 에러가 전송되었습니다. Rollbar 대시보드를 확인하세요.',
    });
  } catch {
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
