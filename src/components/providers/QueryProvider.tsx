'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분간 캐시 유지
            staleTime: 5 * 60 * 1000,
            // 10분간 메모리에 보관
            gcTime: 10 * 60 * 1000,
            // 윈도우 포커스 시 자동 리페치 비활성화 (수동 관리)
            refetchOnWindowFocus: false,
            // 네트워크 재연결 시 자동 리페치
            refetchOnReconnect: true,
            // 에러 재시도 1회
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
