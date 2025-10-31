import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CashChargeClient from './CashChargeClient'

export default async function CashChargePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <CashChargeClient />
}
