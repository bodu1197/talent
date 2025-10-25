import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 요청을 그대로 통과시킵니다.
  return NextResponse.next();
}

export const config = {
  // 모든 경로에서 미들웨어가 실행되지 않도록 빈 배열로 설정합니다.
  // 특정 경로에서 미_들웨어를 실행하려면 ['/about/:path*'] 와 같이 설정할 수 있습니다.
  matcher: [],
};
