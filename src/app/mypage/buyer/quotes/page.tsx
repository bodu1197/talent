import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBuyerQuotes } from '@/lib/supabase/queries/quotes'
import BuyerQuotesClient from './BuyerQuotesClient'

export default async function BuyerQuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const quotes = await getBuyerQuotes(user.id)

  return <BuyerQuotesClient quotes={quotes} />
}
