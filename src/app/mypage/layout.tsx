import { ReactNode } from 'react'

// Middleware에서 이미 로그인 체크하므로 여기서는 불필요
export default function MypageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
