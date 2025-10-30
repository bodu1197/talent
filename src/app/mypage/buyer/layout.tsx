'use client'

// Buyer는 별도 체크 없음 (모든 로그인 유저가 구매자)
export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
