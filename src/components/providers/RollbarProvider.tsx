'use client';

import { useEffect, useState, ReactNode } from 'react';

interface RollbarProviderProps {
  children: ReactNode;
}

// 에러 발생 시 보여줄 Fallback UI
function ErrorFallback({ resetError }: { error?: Error | null; resetError?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">문제가 발생했습니다</h2>
        <p className="text-gray-600 mb-4">
          일시적인 오류가 발생했습니다. 페이지를 새로고침해 주세요.
        </p>
        <button
          onClick={() => (resetError ? resetError() : window.location.reload())}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  );
}

// 에러 상태 표시용
function ErrorBoundaryFallback({ children, hasError }: { children: ReactNode; hasError: boolean }) {
  if (hasError) {
    return <ErrorFallback />;
  }
  return <>{children}</>;
}

import type Rollbar from 'rollbar';
import type { ErrorBoundaryProps } from '@rollbar/react';

interface RollbarState {
  Provider: React.ComponentType<{ instance?: Rollbar; children: ReactNode }>;
  ErrorBoundary: React.ComponentType<ErrorBoundaryProps>;
  rollbar: Rollbar;
}

export default function RollbarProvider({ children }: RollbarProviderProps) {
  const [RollbarComponents, setRollbarComponents] = useState<RollbarState | null>(null);
  const [hasError, setHasError] = useState(false);

  // Rollbar 토큰 확인
  const hasToken =
    process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN ||
    process.env.NEXT_PUBLIC_ROLLBAR_TALENT_CLIENT_TOKEN_1764791738;

  // 토큰이 있을 때만 Rollbar 동적 로드 (번들 크기 최적화)
  useEffect(() => {
    if (!hasToken) return;

    // 지연 로드하여 초기 번들에서 제외
    const loadRollbar = async () => {
      try {
        const [rollbarReact, RollbarLib, configModule] = await Promise.all([
          import('@rollbar/react'),
          import('rollbar'),
          import('@/lib/rollbar/config'),
        ]);

        const rollbarInstance = new RollbarLib.default(configModule.default);

        setRollbarComponents({
          Provider: rollbarReact.Provider,
          ErrorBoundary: rollbarReact.ErrorBoundary,
          rollbar: rollbarInstance,
        });
      } catch (error) {
        console.error('Failed to load Rollbar:', error);
        setHasError(true);
      }
    };

    // requestIdleCallback으로 메인 스레드 차단 방지
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
        loadRollbar
      );
    } else {
      setTimeout(loadRollbar, 100);
    }
  }, [hasToken]);

  // 토큰이 없으면 Provider 없이 렌더링
  if (!hasToken) {
    return <>{children}</>;
  }

  // Rollbar가 아직 로드되지 않았으면 기본 에러 바운더리로 렌더링
  if (!RollbarComponents) {
    return <ErrorBoundaryFallback hasError={hasError}>{children}</ErrorBoundaryFallback>;
  }

  const { Provider, ErrorBoundary, rollbar } = RollbarComponents;

  return (
    <Provider instance={rollbar}>
      <ErrorBoundary fallbackUI={ErrorFallback}>{children}</ErrorBoundary>
    </Provider>
  );
}
