import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsEditClient from './SettingsEditClient'

export default async function SettingsEditPage() {
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

  return <SettingsEditClient profile={profile} isSeller={!!seller} />
}
