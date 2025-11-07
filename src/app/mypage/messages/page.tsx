import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatClient from './ChatClient'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return <ChatClient userId={user.id} isSeller={!!seller} />
}
