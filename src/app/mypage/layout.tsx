import { ReactNode } from 'react'
import Footer from '@/components/layout/Footer'

// Middleware에서 이미 로그인 체크하므로 여기서는 불필요
export default function MypageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}
