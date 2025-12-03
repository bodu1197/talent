'use client';

import { Provider, ErrorBoundary } from '@rollbar/react';
import Rollbar from 'rollbar';
import rollbarConfig from '@/lib/rollbar/config';

// 클라이언트 Rollbar 인스턴스
const rollbar = new Rollbar(rollbarConfig);

interface RollbarProviderProps {
  children: React.ReactNode;
}

// 에러 발생 시 보여줄 Fallback UI
function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">문제가 발생했습니다</h2>
        <p className="text-gray-600 mb-4">
          일시적인 오류가 발생했습니다. 페이지를 새로고침해 주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  );
}

export default function RollbarProvider({ children }: RollbarProviderProps) {
  // Rollbar 토큰이 없으면 Provider 없이 렌더링
  const hasToken =
    process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN ||
    process.env.NEXT_PUBLIC_choi_ROLLBAR_TALENT_CLIENT_TOKEN_1764791738;
  if (!hasToken) {
    return <>{children}</>;
  }

  return (
    <Provider instance={rollbar}>
      <ErrorBoundary fallbackUI={ErrorFallback}>{children}</ErrorBoundary>
    </Provider>
  );
}

// 클라이언트에서 직접 Rollbar 사용할 때
export { rollbar };
