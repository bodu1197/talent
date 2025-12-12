'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { ChatUnreadProvider } from '@/components/providers/ChatUnreadProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

/**
 * 클라이언트 전용 Providers
 * 이 컴포넌트는 동적으로 로드되어 초기 번들 크기를 줄입니다.
 * Supabase + React Query 의존성이 여기에 포함됩니다.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ChatUnreadProvider>{children}</ChatUnreadProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
