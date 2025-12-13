// Server Component - Middleware에서 인증 체크 완료
// buyers는 회원가입 시 자동 생성되므로 별도 체크 불필요
export default function BuyerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
