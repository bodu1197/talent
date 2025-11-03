import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // 인증 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인 여부에 따라 리다이렉트
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/landing')
  }
}
