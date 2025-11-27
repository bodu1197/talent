import { ReactNode } from 'react';

// Middleware에서 이미 로그인 체크하므로 여기서는 불필요
// ConditionalLayout에서 헤더/푸터 관리하므로 여기서는 children만 렌더링
export default function MypageLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="min-h-screen bg-black/[0.05]">{children}</div>;
}
