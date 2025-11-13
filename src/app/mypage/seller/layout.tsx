import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Server Component - 판매자 권한 서버에서 체크
export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // 사용자 정보 가져오기 (middleware에서 이미 인증 체크 완료)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 판매자 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  // 판매자가 아니면 "판매자 되기" 페이지로
  if (!seller) {
    redirect('/become-seller')
  }

  return <>{children}</>
}
