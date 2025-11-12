import { ReactNode } from 'react'
import Footer from '@/components/layout/Footer'

// Middleware에서 이미 로그인 체크하므로 여기서는 불필요
export default function MypageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pt-16 lg:pt-[86px]">
        {children}
      </div>
      <Footer />
    </div>
  )
}
