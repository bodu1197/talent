import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewServiceClient from './NewServiceClient'

export default async function NewServicePage() {
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

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  // Load categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  return <NewServiceClient sellerId={seller.id} categories={categories || []} />
}
