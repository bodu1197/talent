import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserConversations } from '@/lib/supabase/queries/messages'
import MessagesClient from './MessagesClient'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { order?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const conversations = await getUserConversations(user.id)

  return <MessagesClient
    conversations={conversations}
    userId={user.id}
    isSeller={!!seller}
    orderId={searchParams.order}
  />
}
