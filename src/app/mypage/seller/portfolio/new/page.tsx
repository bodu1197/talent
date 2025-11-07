import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PortfolioNewClient from './PortfolioNewClient'

export default async function PortfolioNewPage() {
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

  // 카테고리 목록 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .order('display_order', { ascending: true })

  // 판매자의 서비스 목록 가져오기
  const { data: services } = await supabase
    .from('services')
    .select('id, title, status')
    .eq('seller_id', seller.id)
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false })

  return <PortfolioNewClient sellerId={seller.id} categories={categories || []} services={services || []} />
}
