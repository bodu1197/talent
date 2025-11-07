import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatListClient from './ChatListClient'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 사용자가 판매자인지 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return <ChatListClient userId={user.id} sellerId={seller?.id || null} />
}
